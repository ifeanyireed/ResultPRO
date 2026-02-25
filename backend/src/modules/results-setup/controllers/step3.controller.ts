import { Request, Response } from 'express';
import { ResultsSetupService } from '../services/results-setup.service';

const service = new ResultsSetupService();

export async function handleStep3(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const { sessionId, termId, affectiveTraits } = req.body;

    if (!sessionId || !termId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and Term ID are required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!Array.isArray(affectiveTraits) || affectiveTraits.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one affective trait must be selected',
        code: 'VALIDATION_ERROR',
      });
    }

    // Update session with step 3 data
    const updated = await service.updateStep(schoolId, 3, {
      currentStep: 4,
      affectiveTraits: JSON.stringify(affectiveTraits),
    });

    res.json({
      success: true,
      message: 'Step 3 completed successfully',
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
