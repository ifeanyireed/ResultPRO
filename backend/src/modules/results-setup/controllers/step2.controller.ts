import { Request, Response } from 'express';
import { ResultsSetupService } from '../services/results-setup.service';

const service = new ResultsSetupService();

export async function handleStep2(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const { examConfigComponents, totalExamScore } = req.body;

    if (!examConfigComponents || !Array.isArray(examConfigComponents)) {
      return res.status(400).json({
        success: false,
        error: 'Exam config components are required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate components
    const totalScore = examConfigComponents.reduce((sum: number, c: any) => sum + (c.score || 0), 0);
    if (totalScore !== 100) {
      return res.status(400).json({
        success: false,
        error: `Assessment components must total 100 (got ${totalScore})`,
        code: 'VALIDATION_ERROR',
      });
    }

    // Update session with step 2 data
    const updated = await service.updateStep(schoolId, 2, {
      currentStep: 3,
      examConfigComponents: JSON.stringify(examConfigComponents),
      totalExamScore: totalScore,
    });

    res.json({
      success: true,
      message: 'Step 2 completed successfully',
      data: updated,
    });
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: error.message,
      code: error.code || 'ERROR',
    });
  }
}
