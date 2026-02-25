import { Request, Response } from 'express';
import { ResultsSetupService } from '../services/results-setup.service';

const service = new ResultsSetupService();

export async function getResultsSetupSession(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const session = await service.getSession(schoolId);

    res.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    // Return 404 if session doesn't exist, which means it's a fresh start
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: 'Results setup session not found',
        code: 'NOT_FOUND',
      });
    }

    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: error.message,
      code: error.code || 'ERROR',
    });
  }
}

export async function initializeResultsSetup(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const session = await service.initializeSession(schoolId);

    res.json({
      success: true,
      data: session,
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
