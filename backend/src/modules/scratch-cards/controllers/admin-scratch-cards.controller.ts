import { Request, Response } from 'express';
import { prisma } from '@config/database';
import crypto from 'crypto';

/**
 * Generate random PIN for scratch card
 */
function generateScratchCardPin(): string {
  // Generate 10-digit PIN
  return crypto.randomBytes(5).toString('hex').toUpperCase().slice(0, 10);
}

/**
 * Generate unique batch code
 */
function generateBatchCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SCB-${timestamp}-${random}`;
}

/**
 * SuperAdmin: Generate new batch of scratch cards
 * POST /api/admin/scratch-cards/batches/generate
 */
export async function generateBatch(req: Request, res: Response) {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1 || quantity > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be between 1 and 10,000',
      });
    }

    // Generate unique batch code
    const batchCode = generateBatchCode();

    // Generate unique PINs
    const pinsSet = new Set<string>();
    while (pinsSet.size < quantity) {
      pinsSet.add(generateScratchCardPin());
    }
    const pins = Array.from(pinsSet);

    // Create batch (without assigning to school yet)
    const batch = await prisma.scratchCardBatch.create({
      data: {
        batchCode,
        schoolId: 'SYSTEM', // Temporary school ID for unassigned batch
        quantity,
        status: 'PENDING',
      },
    });

    // Create individual scratch cards
    const cards = await Promise.all(
      pins.map((pin) =>
        prisma.scratchCard.create({
          data: {
            batchId: batch.id,
            schoolId: 'SYSTEM', // Temporary
            pin,
            usesRemaining: 3,
            usageCount: 0,
            isActive: true,
          },
        })
      )
    );

    return res.json({
      success: true,
      message: `Generated batch ${batchCode} with ${quantity} scratch cards`,
      data: {
        batchId: batch.id,
        batchCode: batch.batchCode,
        quantity: batch.quantity,
        status: batch.status,
        createdAt: batch.createdAt,
        cardCount: cards.length,
      },
    });
  } catch (error) {
    console.error('Error generating batch:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate scratch card batch',
    });
  }
}

/**
 * SuperAdmin: Get all batches
 * GET /api/admin/scratch-cards/batches
 */
export async function getAllBatches(req: Request, res: Response) {
  try {
    const { status, schoolId } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (schoolId && schoolId !== 'SYSTEM') where.schoolId = schoolId;

    const batches = await prisma.scratchCardBatch.findMany({
      where,
      include: {
        school: {
          select: { id: true, name: true },
        },
        cards: {
          select: {
            id: true,
            usageCount: true,
            usesRemaining: true,
          },
        },
        requestHistory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add calculated stats to each batch
    const batchesWithStats = await Promise.all(
      batches.map(async (batch) => {
        return {
          ...batch,
          stats: {
            totalCards: batch.cards.length,
            usedCount: batch.cards.reduce((sum, c) => sum + c.usageCount, 0),
            activeCount: batch.cards.filter((c) => c.usesRemaining > 0).length,
            depletedCount: batch.cards.filter((c) => c.usesRemaining === 0).length,
          },
        };
      })
    );

    // Calculate system-wide stats
    const allCards = await prisma.scratchCard.findMany({
      select: { usageCount: true, usesRemaining: true, isActive: true },
    });

    const systemStats = {
      totalGenerated: allCards.length,
      totalUsed: allCards.reduce((sum, c) => sum + c.usageCount, 0),
      totalRemaining: allCards.reduce((sum, c) => sum + c.usesRemaining, 0),
      activeCards: allCards.filter((c) => c.isActive).length,
      depletetdCards: allCards.filter((c) => !c.isActive).length,
      usageRate: allCards.length
        ? Math.round(
            (allCards.reduce((sum, c) => sum + c.usageCount, 0) /
              (allCards.length * 3)) *
              100
          )
        : 0,
    };

    return res.json({
      success: true,
      data: {
        batches: batchesWithStats,
        systemStats,
      },
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch batches',
    });
  }
}

/**
 * SuperAdmin: Get batch details
 * GET /api/admin/scratch-cards/batches/:batchId
 */
export async function getBatchDetails(req: Request, res: Response) {
  try {
    const { batchId } = req.params;

    const batch = await prisma.scratchCardBatch.findUnique({
      where: { id: batchId },
      include: {
        school: true,
        cards: {
          include: {
            usageHistory: true,
          },
        },
        requestHistory: true,
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
      });
    }

    const stats = {
      total: batch.cards.length,
      active: batch.cards.filter((c) => c.isActive).length,
      inactive: batch.cards.filter((c) => !c.isActive).length,
      usedCount: batch.cards.filter((c) => c.usageCount > 0).length,
      depletedCount: batch.cards.filter((c) => c.usesRemaining === 0).length,
      totalUsages: batch.cards.reduce((sum, c) => sum + c.usageCount, 0),
    };

    return res.json({
      success: true,
      data: {
        batch,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching batch details:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch batch details',
    });
  }
}

/**
 * SuperAdmin: Assign batch to school
 * PATCH /api/admin/scratch-cards/batches/:batchId/assign
 */
export async function assignBatchToSchool(req: Request, res: Response) {
  try {
    const { batchId } = req.params;
    const { schoolId } = req.body;
    const adminId = req.user?.id;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'schoolId is required',
      });
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'School not found',
      });
    }

    // Update batch
    const updatedBatch = await prisma.scratchCardBatch.update({
      where: { id: batchId },
      data: {
        schoolId,
        status: 'ASSIGNED',
        assignedAt: new Date(),
        assignedBy: adminId,
      },
      include: {
        school: true,
        cards: true,
      },
    });

    // Update all cards in batch
    await prisma.scratchCard.updateMany({
      where: { batchId },
      data: {
        schoolId,
      },
    });

    return res.json({
      success: true,
      message: `Batch ${updatedBatch.batchCode} assigned to ${school.name}`,
      data: {
        batch: updatedBatch,
      },
    });
  } catch (error) {
    console.error('Error assigning batch:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to assign batch',
    });
  }
}

/**
 * SuperAdmin: Activate batch
 * POST /api/admin/scratch-cards/batches/:batchId/activate
 */
export async function activateBatch(req: Request, res: Response) {
  try {
    const { batchId } = req.params;
    const adminId = req.user?.id;

    const batch = await prisma.scratchCardBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
      });
    }

    if (batch.status === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Batch is already active',
      });
    }

    // Update batch
    const updatedBatch = await prisma.scratchCardBatch.update({
      where: { id: batchId },
      data: {
        status: 'ACTIVE',
        activatedAt: new Date(),
        activatedBy: adminId,
      },
    });

    // Activate all cards in batch
    await prisma.scratchCard.updateMany({
      where: { batchId },
      data: {
        isActive: true,
        activatedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: `Batch ${updatedBatch.batchCode} activated successfully`,
      data: { batch: updatedBatch },
    });
  } catch (error) {
    console.error('Error activating batch:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to activate batch',
    });
  }
}

/**
 * SuperAdmin: Deactivate batch
 * POST /api/admin/scratch-cards/batches/:batchId/deactivate
 */
export async function deactivateBatch(req: Request, res: Response) {
  try {
    const { batchId } = req.params;
    const { reason } = req.body;

    const batch = await prisma.scratchCardBatch.findUnique({
      where: { id: batchId },
      include: { cards: true },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
      });
    }

    // Update batch
    const updatedBatch = await prisma.scratchCardBatch.update({
      where: { id: batchId },
      data: {
        status: 'DEACTIVATED',
        deactivatedAt: new Date(),
        deactivatedCount: batch.cards.length,
      },
    });

    // Deactivate all cards in batch
    await prisma.scratchCard.updateMany({
      where: { batchId },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: reason || 'Batch deactivated by admin',
      },
    });

    return res.json({
      success: true,
      message: `Batch ${updatedBatch.batchCode} deactivated`,
      data: { batch: updatedBatch },
    });
  } catch (error) {
    console.error('Error deactivating batch:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to deactivate batch',
    });
  }
}

/**
 * SuperAdmin: Get system-wide statistics
 * GET /api/admin/scratch-cards/stats
 */
export async function getSystemStats(req: Request, res: Response) {
  try {
    const allCards = await prisma.scratchCard.findMany({
      select: { usageCount: true, usesRemaining: true, isActive: true, createdAt: true },
    });

    const allBatches = await prisma.scratchCardBatch.findMany({
      select: { id: true, status: true, quantity: true },
    });

    const stats = {
      batches: {
        total: allBatches.length,
        pending: allBatches.filter((b) => b.status === 'PENDING').length,
        assigned: allBatches.filter((b) => b.status === 'ASSIGNED').length,
        active: allBatches.filter((b) => b.status === 'ACTIVE').length,
        depleted: allBatches.filter((b) => b.status === 'DEPLETED').length,
        deactivated: allBatches.filter((b) => b.status === 'DEACTIVATED').length,
      },
      cards: {
        totalGenerated: allCards.length,
        totalUsed: allCards.reduce((sum, c) => sum + c.usageCount, 0),
        totalRemaining: allCards.reduce((sum, c) => sum + c.usesRemaining, 0),
        activeCards: allCards.filter((c) => c.isActive).length,
        depletedCards: allCards.filter((c) => c.usesRemaining === 0).length,
        usageRate: allCards.length
          ? Math.round(
              (allCards.reduce((sum, c) => sum + c.usageCount, 0) / (allCards.length * 3)) * 100
            )
          : 0,
      },
      schools: {
        activeWithCards: await prisma.school.count({
          where: {
            scratchCardBatches: {
              some: {
                status: 'ACTIVE',
              },
            },
          },
        }),
      },
    };

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
}

/**
 * SuperAdmin: Export batch codes
 * GET /api/admin/scratch-cards/batches/:batchId/export
 */
export async function exportBatchCodes(req: Request, res: Response) {
  try {
    const { batchId } = req.params;
    const { format = 'csv' } = req.query;

    const batch = await prisma.scratchCardBatch.findUnique({
      where: { id: batchId },
      include: {
        cards: {
          select: { pin: true, isActive: true, usesRemaining: true, createdAt: true },
        },
        school: {
          select: { name: true },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
      });
    }

    if (format === 'csv') {
      // CSV format
      const csv = [
        ['Batch Code', 'School', 'Generated Date', 'Total Cards', ''],
        [batch.batchCode, batch.school?.name || 'UNASSIGNED', batch.generated.toISOString(), batch.quantity.toString(), ''],
        [''],
        ['PIN', 'Status', 'Uses Remaining', 'Created Date'],
        ...batch.cards.map((card) => [
          card.pin,
          card.isActive ? 'Active' : 'Deactivated',
          card.usesRemaining.toString(),
          card.createdAt.toISOString(),
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="batch_${batch.batchCode}.csv"`);
      return res.send(csv);
    }

    // Default JSON format
    return res.json({
      success: true,
      data: {
        batch,
      },
    });
  } catch (error) {
    console.error('Error exporting batch:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to export batch',
    });
  }
}
