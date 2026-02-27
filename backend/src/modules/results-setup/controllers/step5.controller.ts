import { Request, Response } from 'express';
import { ResultsSetupService } from '../services/results-setup.service';

const service = new ResultsSetupService();

export async function handleStep5(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const { sessionId, termId, principalName, principalSignatureUrl, principalS3Key, staffData } = req.body;

    if (!sessionId || !termId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and Term ID are required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!principalName) {
      return res.status(400).json({
        success: false,
        error: 'Principal name is required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!principalSignatureUrl) {
      return res.status(400).json({
        success: false,
        error: 'Principal signature is required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!Array.isArray(staffData) || staffData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one teacher must be assigned',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate all teachers have required fields
    for (const staff of staffData) {
      if (!staff.classId || !staff.className || !staff.teacherName || !staff.teacherSignatureUrl) {
        return res.status(400).json({
          success: false,
          error: 'All teachers must have class, name, and signature',
          code: 'VALIDATION_ERROR',
        });
      }
    }

    // Update session with step 5 data
    const updated = await service.updateStep(schoolId, 5, {
      currentStep: 6,
      principalName,
      principalSignatureUrl,
      principalS3Key, // Store S3 key for regenerating URLs later
      staffData: JSON.stringify(staffData),
    });

    res.json({
      success: true,
      message: 'Step 5 completed successfully',
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

export async function updateStaffData(req: Request, res: Response) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const { principalName, principalSignatureUrl, staffData } = req.body;

    // Update session with partial step 5 data (real-time)
    const updated = await service.updateStaffDataRealtime(schoolId, {
      principalName,
      principalSignatureUrl,
      staffData: staffData ? JSON.stringify(staffData) : undefined,
    });

    res.json({
      success: true,
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
