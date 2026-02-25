import { Request, Response } from 'express';
import { prisma } from '@config/database';

/**
 * DEBUG ONLY - Create sample classes for testing
 * Used only in development to test Step 5
 */
export async function createSampleClasses(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    }

    // Check if classes already exist
    const existingClasses = await prisma.class.findMany({
      where: { schoolId },
    });

    if (existingClasses.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Classes already exist for this school',
        code: 'CONFLICT',
      });
    }

    // Create sample classes
    const sampleClasses = [
      { schoolId, name: 'SS1', level: 'SS1', order: 1 },
      { schoolId, name: 'SS2', level: 'SS2', order: 2 },
      { schoolId, name: 'SS3', level: 'SS3', order: 3 },
      { schoolId, name: 'JSS1', level: 'JSS1', order: 4 },
      { schoolId, name: 'JSS2', level: 'JSS2', order: 5 },
      { schoolId, name: 'JSS3', level: 'JSS3', order: 6 },
    ];

    const createdClasses = await Promise.all(
      sampleClasses.map(cls => prisma.class.create({ data: cls }))
    );

    res.json({
      success: true,
      message: 'Sample classes created for testing',
      data: {
        classes: createdClasses.map(cls => ({
          id: cls.id,
          name: cls.name,
          level: cls.level,
        })),
      },
    });
  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'ERROR',
    });
  }
}
