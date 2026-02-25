import { Request, Response } from 'express';
import { ResultsSetupService } from '../services/results-setup.service';

const service = new ResultsSetupService();

export async function handleStep1(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const { sessionId, termId, sessionName, termName, startDate, endDate } = req.body;

    if (!sessionId || !termId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and Term ID are required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Ensure session exists
    await service.initializeSession(schoolId);

    // Update session with step 1 data
    const updated = await service.updateStep(schoolId, 1, {
      currentStep: 2,
      sessionId,
      termId,
      sessionName,
      termName,
    });

    res.json({
      success: true,
      message: 'Step 1 completed successfully',
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
