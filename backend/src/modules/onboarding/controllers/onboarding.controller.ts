import { Request, Response } from 'express';
import { onboardingService } from '../services/onboarding.service';

export class OnboardingController {
  /**
   * GET /api/onboarding/status
   * Get onboarding status
   */
  static async getStatus(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const status = await onboardingService.getStatus(schoolId);

      res.json({
        success: true,
        data: status,
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

  /**
   * POST /api/onboarding/step/1
   * Update school profile
   */
  static async updateSchoolProfile(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const school = await onboardingService.updateSchoolProfile(schoolId, req.body);

      res.json({
        success: true,
        message: 'School profile updated successfully',
        data: {
          stepCompleted: true,
          nextStep: 2,
        },
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

  /**
   * POST /api/onboarding/step/2
   * Create academic session and terms
   */
  static async createAcademicSession(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const result = await onboardingService.createAcademicSession(schoolId, req.body);

      res.json({
        success: true,
        message: 'Academic session and terms created successfully',
        data: {
          stepCompleted: true,
          nextStep: 3,
          ...result,
        },
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

  /**
   * POST /api/onboarding/step/3
   * Create classes
   */
  static async createClasses(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const classes = await onboardingService.createClasses(schoolId, req.body);

      res.json({
        success: true,
        message: 'Classes created successfully',
        data: {
          stepCompleted: true,
          nextStep: 4,
          classes,
        },
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

  /**
   * POST /api/onboarding/step/4
   * Create subjects
   */
  static async createSubjects(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const subjects = await onboardingService.createSubjects(schoolId, req.body);

      res.json({
        success: true,
        message: 'Subjects created successfully',
        data: {
          stepCompleted: true,
          nextStep: 5,
          subjectsByClass: subjects,
        },
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

  /**
   * POST /api/onboarding/step/5
   * Configure grading system
   */
  static async configureGradingSystem(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const result = await onboardingService.createGradingSystem(schoolId, req.body);

      res.json({
        success: true,
        message: 'Grading system configured successfully',
        data: {
          stepCompleted: true,
          nextStep: 6,
          ...result,
        },
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

  /**
   * POST /api/onboarding/step/6
   * Record CSV upload
   */
  static async recordCsvUpload(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const result = await onboardingService.recordCsvUpload(schoolId, req.body);

      res.json({
        success: true,
        message: 'CSV data recorded successfully',
        data: {
          stepCompleted: true,
          nextStep: 7,
        },
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

  /**
   * POST /api/onboarding/complete
   * Mark onboarding as complete
   */
  static async completeOnboarding(req: Request, res: Response) {
    try {
      const schoolId = req.user?.schoolId;
      if (!schoolId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      const result = await onboardingService.completeOnboarding(schoolId);

      res.json({
        success: true,
        message: 'Onboarding completed successfully!',
        data: {
          schoolId,
          onboardingStatus: 'COMPLETE',
          completedAt: new Date().toISOString(),
          redirectTo: '/school-admin/overview',
        },
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
}
