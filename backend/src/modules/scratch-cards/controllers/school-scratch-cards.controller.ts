import { Request, Response } from 'express';
import { prisma } from '@config/database';

/**
 * SchoolAdmin: Request scratch cards
 * POST /api/school/scratch-cards/request
 */
export async function requestScratchCards(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    const schoolAdminId = req.user?.id;
    const { quantity, reason } = req.body;

    if (!schoolId || !schoolAdminId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    if (!quantity || quantity < 1 || quantity > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be between 1 and 1,000',
      });
    }

    // Create request
    const request = await prisma.batchRequest.create({
      data: {
        schoolId,
        schoolAdminId,
        quantity,
        reason,
        status: 'PENDING',
      },
      include: {
        school: {
          select: { name: true },
        },
      },
    });

    return res.json({
      success: true,
      message: 'Request submitted successfully. Awaiting admin approval.',
      data: request,
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create request',
    });
  }
}

/**
 * SchoolAdmin: Get all batch requests for school
 * GET /api/school/scratch-cards/requests
 */
export async function getSchoolRequests(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const requests = await prisma.batchRequest.findMany({
      where: { schoolId },
      include: {
        batch: {
          select: { batchCode: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'PENDING').length,
      approved: requests.filter((r) => r.status === 'APPROVED').length,
      rejected: requests.filter((r) => r.status === 'REJECTED').length,
      delivered: requests.filter((r) => r.status === 'DELIVERED').length,
    };

    return res.json({
      success: true,
      data: {
        requests,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch requests',
    });
  }
}

/**
 * SchoolAdmin: Get all assigned batches
 * GET /api/school/scratch-cards/batches
 */
export async function getSchoolBatches(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const batches = await prisma.scratchCardBatch.findMany({
      where: {
        schoolId,
        status: {
          in: ['ASSIGNED', 'ACTIVE', 'DEPLETED'],
        },
      },
      include: {
        cards: {
          select: {
            id: true,
            pin: true,
            isActive: true,
            usesRemaining: true,
            usageCount: true,
            lastUsedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totals = {
      totalCards: batches.reduce((sum, b) => sum + b.quantity, 0),
      activeCards: batches.reduce(
        (sum, b) => sum + b.cards.filter((c) => c.isActive && c.usesRemaining > 0).length,
        0
      ),
      usedCards: batches.reduce((sum, b) => sum + b.cards.filter((c) => c.usageCount > 0).length, 0),
      depletedCards: batches.reduce((sum, b) => sum + b.cards.filter((c) => c.usesRemaining === 0).length, 0),
    };

    return res.json({
      success: true,
      data: {
        batches,
        totals,
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
 * SchoolAdmin: Get cards in a batch
 * GET /api/school/scratch-cards/batches/:batchId
 */
export async function getBatchCards(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    const { batchId } = req.params;
    const { status = 'all' } = req.query;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const batch = await prisma.scratchCardBatch.findUnique({
      where: { id: batchId },
      include: {
        cards: true,
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found',
      });
    }

    // Verify ownership
    if (batch.schoolId !== schoolId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    let cards = batch.cards;

    if (status === 'active') {
      cards = cards.filter((c) => c.isActive && c.usesRemaining > 0);
    } else if (status === 'used') {
      cards = cards.filter((c) => c.usageCount > 0);
    } else if (status === 'depleted') {
      cards = cards.filter((c) => c.usesRemaining === 0);
    }

    const stats = {
      total: batch.cards.length,
      active: batch.cards.filter((c) => c.isActive && c.usesRemaining > 0).length,
      used: batch.cards.filter((c) => c.usageCount > 0).length,
      depleted: batch.cards.filter((c) => c.usesRemaining === 0).length,
    };

    return res.json({
      success: true,
      data: {
        batch,
        cards,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching batch cards:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch batch cards',
    });
  }
}

/**
 * SchoolAdmin: Activate/Deactivate scratch card
 * PATCH /api/school/scratch-cards/cards/:cardId
 */
export async function toggleCardStatus(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    const { cardId } = req.params;
    const { isActive, reason } = req.body;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const card = await prisma.scratchCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found',
      });
    }

    // Verify ownership
    if (card.schoolId !== schoolId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const updatedCard = await prisma.scratchCard.update({
      where: { id: cardId },
      data: {
        isActive,
        ...(isActive
          ? { activatedAt: new Date() }
          : {
              deactivatedAt: new Date(),
              deactivationReason: reason,
            }),
      },
    });

    return res.json({
      success: true,
      message: isActive ? 'Card activated' : 'Card deactivated',
      data: updatedCard,
    });
  } catch (error) {
    console.error('Error toggling card status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update card',
    });
  }
}

/**
 * SchoolAdmin: Dispense card to student
 * POST /api/school/scratch-cards/dispense
 */
export async function dispenseCard(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    const { cardId, studentId, studentAdmissionNumber } = req.body;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Verify card exists and belongs to school
    const card = await prisma.scratchCard.findUnique({
      where: { id: cardId },
      include: {
        batch: true,
      },
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found',
      });
    }

    if (card.schoolId !== schoolId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Verify student exists
    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student || student.schoolId !== schoolId) {
        return res.status(404).json({
          success: false,
          error: 'Student not found',
        });
      }
    }

    // Update card with student info
    const updatedCard = await prisma.scratchCard.update({
      where: { id: cardId },
      data: {
        usedByEmail: req.user?.email,
      },
    });

    return res.json({
      success: true,
      message: `Card dispensed to student ${studentAdmissionNumber}`,
      data: {
        card: updatedCard,
        pin: updatedCard.pin,
        usesRemaining: updatedCard.usesRemaining,
      },
    });
  } catch (error) {
    console.error('Error dispensing card:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to dispense card',
    });
  }
}

/**
 * SchoolAdmin: Get dashboard statistics
 * GET /api/school/scratch-cards/dashboard
 */
export async function getDashboard(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Get all batches and cards for school
    const batches = await prisma.scratchCardBatch.findMany({
      where: { schoolId },
      include: {
        cards: true,
      },
    });

    const allCards = batches.flatMap((b) => b.cards);

    const stats = {
      totalAllocated: allCards.length,
      activeAvailable: allCards.filter((c) => c.isActive && c.usesRemaining > 0).length,
      dispensed: allCards.filter((c) => c.usageCount > 0).length,
      depleted: allCards.filter((c) => c.usesRemaining === 0).length,
      deactivated: allCards.filter((c) => !c.isActive).length,
    };

    // Get recent usage
    const recentUsage = await prisma.scratchCardUsage.findMany({
      where: { schoolId },
      orderBy: { usedAt: 'desc' },
      take: 10,
      include: {
        card: {
          select: { pin: true },
        },
      },
    });

    // Get pending requests
    const pendingRequests = await prisma.batchRequest.findMany({
      where: {
        schoolId,
        status: 'PENDING',
      },
    });

    return res.json({
      success: true,
      data: {
        stats,
        pendingRequests: pendingRequests.length,
        recentUsage,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard',
    });
  }
}

/**
 * SchoolAdmin: Export available cards
 * GET /api/school/scratch-cards/export
 */
export async function exportAvailableCards(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    const { format = 'csv' } = req.query;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const batches = await prisma.scratchCardBatch.findMany({
      where: { schoolId },
      include: {
        cards: {
          where: { isActive: true, usesRemaining: { gt: 0 } },
        },
      },
    });

    const availableCards = batches.flatMap((batch) =>
      batch.cards.map((card) => ({
        batchCode: batch.batchCode,
        pin: card.pin,
        usesRemaining: card.usesRemaining,
        createdAt: card.createdAt,
      }))
    );

    if (format === 'csv') {
      const csv = [
        ['Batch Code', 'PIN', 'Uses Remaining', 'Created Date'],
        ...availableCards.map((card) => [
          card.batchCode,
          card.pin,
          card.usesRemaining.toString(),
          card.createdAt.toISOString(),
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="available_cards_${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }

    return res.json({
      success: true,
      data: {
        cards: availableCards,
        count: availableCards.length,
      },
    });
  } catch (error) {
    console.error('Error exporting cards:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to export cards',
    });
  }
}
