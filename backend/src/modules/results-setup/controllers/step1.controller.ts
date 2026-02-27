import { Request, Response } from 'express';
import { ResultsSetupService } from '../services/results-setup.service';

const service = new ResultsSetupService();

export async function handleStep1(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    console.log('🔵 STEP 1 CALLED - schoolId:', schoolId);
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const { sessionId, termId, sessionName, termName, startDate, endDate } = req.body;
    console.log('📝 Step 1 data received:', { sessionId, termId, sessionName, termName });

    if (!sessionId || !termId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and Term ID are required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Ensure session exists
    await service.initializeSession(schoolId);
    console.log('✅ Session initialized for schoolId:', schoolId);

    // Update session with step 1 data
    const updated = await service.updateStep(schoolId, 1, {
      currentStep: 2,
      sessionId,
      termId,
      sessionName,
      termName,
    });
    console.log('💾 Step 1 data saved to DB:', JSON.stringify(updated).substring(0, 100));

    res.json({
      success: true,
      message: 'Step 1 completed successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('❌ STEP 1 ERROR:', error.message, error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: error.message,
      code: error.code || 'ERROR',
    });
  }
}
