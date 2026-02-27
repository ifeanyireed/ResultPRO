import { Request, Response } from 'express';
import { prisma } from '@config/database';

/**
 * Public: Validate scratch card and get student results
 * POST /api/scratch-cards/validate
 * No authentication required
 */
export async function validateScratchCard(req: Request, res: Response) {
  try {
    const { pin, studentAdmissionNumber, sessionId, termId } = req.body;
    const userIp = req.ip || req.connection.remoteAddress || 'unknown';

    // Validate input
    if (!pin || !studentAdmissionNumber) {
      return res.status(400).json({
        success: false,
        error: 'PIN and student admission number are required',
      });
    }

    // Find scratch card
    const card = await prisma.scratchCard.findUnique({
      where: { pin },
      include: {
        school: {
          select: { id: true, name: true, logoUrl: true, motto: true, primaryColor: true },
        },
      },
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Invalid scratch card PIN',
      });
    }

    // Check if card is active
    if (!card.isActive) {
      return res.status(403).json({
        success: false,
        error: 'This scratch card has been deactivated',
      });
    }

    // Check if card has uses remaining
    if (card.usesRemaining <= 0) {
      return res.status(403).json({
        success: false,
        error: 'This scratch card has expired (no uses remaining)',
      });
    }

    // Find student
    const student = await prisma.student.findFirst({
      where: {
        schoolId: card.schoolId,
        admissionNumber: studentAdmissionNumber,
      },
      include: {
        class: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    // Get student results
    let results = await prisma.studentResult.findMany({
      where: {
        studentId: student.id,
        schoolId: card.schoolId,
        ...(sessionId && { sessionId }),
        ...(termId && { termId }),
      },
      include: {
        class: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (results.length === 0) {
      // If no specific session/term provided, get latest
      results = await prisma.studentResult.findMany({
        where: {
          studentId: student.id,
          schoolId: card.schoolId,
        },
        include: {
          class: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No results found for this student',
      });
    }

    const result = results[0];

    // Decrement uses and record usage
    const updatedCard = await prisma.scratchCard.update({
      where: { id: card.id },
      data: {
        usesRemaining: card.usesRemaining - 1,
        usageCount: card.usageCount + 1,
        lastUsedAt: new Date(),
        usedByEmail: 'public_user@example.com', // Placeholder for public access
        ...(card.usesRemaining - 1 === 0 && { deactivatedAt: new Date() }),
      },
    });

    // Record usage
    await prisma.scratchCardUsage.create({
      data: {
        cardId: card.id,
        schoolId: card.schoolId,
        studentAdmissionNumber,
        sessionId,
        termId,
        usedByEmail: 'public_user@example.com',
        usedByIpAddress: userIp,
      },
    });

    // Parse subject results
    let subjectResults = {};
    try {
      subjectResults = JSON.parse(result.subjectResults);
    } catch {
      subjectResults = {};
    }

    // Parse affective domain
    let affectiveDomain = {};
    try {
      affectiveDomain = JSON.parse(result.affectiveDomain || '{}');
    } catch {
      affectiveDomain = {};
    }

    // Parse psychomotor domain
    let psychomotorDomain = {};
    try {
      psychomotorDomain = JSON.parse(result.psychomotorDomain || '{}');
    } catch {
      psychomotorDomain = {};
    }

    return res.json({
      success: true,
      message: 'Scratch card validated successfully',
      data: {
        student: {
          name: student.name,
          admissionNumber: student.admissionNumber,
          className: student.class?.name || 'N/A',
          sex: result.sex,
          dateOfBirth: result.dateOfBirth,
          age: result.age,
          height: result.height,
          weight: result.weight,
          favouriteColor: result.favouriteColor,
        },
        school: {
          name: card.school.name,
          logo: card.school.logoUrl,
          motto: card.school.motto,
          primaryColor: card.school.primaryColor,
        },
        results: {
          subjects: subjectResults,
          affectiveDomain,
          psychomotorDomain,
          overallAverage: result.overallAverage,
          overallPosition: result.overallPosition,
          overallRemark: result.overallRemark,
          daysPresent: result.daysPresent,
          daysSchoolOpen: result.daysSchoolOpen,
          principalComments: result.principalComments,
          classTeacherComments: result.classTeacherComments,
        },
        cardStatus: {
          usesRemaining: updatedCard.usesRemaining,
          usageCount: updatedCard.usageCount,
          isExpired: updatedCard.usesRemaining === 0,
        },
      },
    });
  } catch (error) {
    console.error('Error validating scratch card:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to validate scratch card',
    });
  }
}

/**
 * Public: Get scratch card usage stats
 * GET /api/scratch-cards/:pin/stats
 */
export async function getCardStats(req: Request, res: Response) {
  try {
    const { pin } = req.params;

    const card = await prisma.scratchCard.findUnique({
      where: { pin },
      include: {
        batch: {
          select: { batchCode: true },
        },
        school: {
          select: { name: true },
        },
        usageHistory: true,
      },
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Scratch card not found',
      });
    }

    return res.json({
      success: true,
      data: {
        pin: card.pin,
        batchCode: card.batch.batchCode,
        schoolName: card.school.name,
        isActive: card.isActive,
        usesRemaining: card.usesRemaining,
        usageCount: card.usageCount,
        lastUsedAt: card.lastUsedAt,
        createdAt: card.createdAt,
        usageHistory: card.usageHistory.slice(0, 5), // Last 5 usages
      },
    });
  } catch (error) {
    console.error('Error fetching card stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch card statistics',
    });
  }
}
