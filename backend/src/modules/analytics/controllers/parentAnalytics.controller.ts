// Parent Analytics Controller
import { Request, Response, NextFunction } from 'express';
import { ParentAnalyticsService } from '../services/parentAnalytics.service';

export class ParentAnalyticsController {
  /**
   * GET /api/parent-analytics/dashboard
   * Get parent dashboard overview with all children
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const data = await ParentAnalyticsService.getParentDashboardOverview(userId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch parent dashboard',
      });
    }
  }

  /**
   * GET /api/parent-analytics/children
   * Get list of parent's children
   */
  static async getChildren(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const children = await ParentAnalyticsService.getParentChildren(userId);
      return res.status(200).json({
        success: true,
        data: children,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch children',
      });
    }
  }

  /**
   * GET /api/parent-analytics/child/:studentId/summary
   * Get current term performance summary for a child
   */
  static async getChildSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { studentId } = req.params;

      if (!userId || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters',
        });
      }

      // Verify parent owns this student
      const parent = await (require('@prisma/client').prisma).parent.findUnique({
        where: { userId },
        include: {
          students: {
            where: { id: studentId },
          },
        },
      });

      if (!parent || parent.students.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have access to this student',
        });
      }

      const summary = await ParentAnalyticsService.getChildCurrentTermSummary(studentId);
      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch child summary',
      });
    }
  }

  /**
   * GET /api/parent-analytics/child/:studentId/progress
   * Get child's progress trend
   */
  static async getChildProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { studentId } = req.params;
      const { limit = '3' } = req.query;

      if (!userId || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters',
        });
      }

      const progress = await ParentAnalyticsService.getChildProgressTrend(studentId, parseInt(limit as string));
      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch progress data',
      });
    }
  }

  /**
   * GET /api/parent-analytics/child/:studentId/subject/:subjectName
   * Get subject-specific analysis for a child
   */
  static async getChildSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { studentId, subjectName } = req.params;

      if (!userId || !studentId || !subjectName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters',
        });
      }

      const analysis = await ParentAnalyticsService.getChildSubjectAnalysis(studentId, decodeURIComponent(subjectName));
      return res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch subject analysis',
      });
    }
  }

  /**
   * GET /api/parent-analytics/child/:studentId/attendance
   * Get attendance analysis for a child
   */
  static async getChildAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { studentId } = req.params;

      if (!userId || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters',
        });
      }

      const attendance = await ParentAnalyticsService.getChildAttendanceAnalysis(studentId);
      return res.status(200).json({
        success: true,
        data: attendance,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch attendance data',
      });
    }
  }

  /**
   * GET /api/parent-analytics/child/:studentId/analytics
   * Get comprehensive analytics for a child
   */
  static async getChildAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { studentId } = req.params;

      if (!userId || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters',
        });
      }

      const analytics = await ParentAnalyticsService.getChildAnalytics(userId, studentId);
      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch analytics',
      });
    }
  }
}
