// Teacher Analytics Controller - HTTP request handlers for teachers
import { Request, Response, NextFunction } from 'express';
import { TeacherAnalyticsService } from '../services/teacherAnalytics.service';

export class TeacherAnalyticsController {
  /**
   * GET /api/teacher-analytics/classes
   * Get all classes for a teacher
   */
  static async getTeacherClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).id;
      const classes = await TeacherAnalyticsService.getTeacherClasses(userId);

      res.json({
        success: true,
        data: classes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/teacher-analytics/class/:classId/overview
   * Get class overview with performance metrics
   */
  static async getClassOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const { sessionId, termId } = req.query;

      if (!sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId and termId are required',
        });
      }

      const data = await TeacherAnalyticsService.getClassOverview(
        classId,
        sessionId as string,
        termId as string
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/teacher-analytics/class/:classId/at-risk
   * Get at-risk students for a class
   */
  static async getAtRiskStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const { sessionId, termId } = req.query;

      if (!sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId and termId are required',
        });
      }

      const students = await TeacherAnalyticsService.getAtRiskStudents(
        classId,
        sessionId as string,
        termId as string
      );

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/teacher-analytics/student/:studentId
   * Get detailed student performance
   */
  static async getStudentDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { sessionId, termId } = req.query;

      if (!sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId and termId are required',
        });
      }

      const data = await TeacherAnalyticsService.getStudentDetail(
        studentId,
        sessionId as string,
        termId as string
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/teacher-analytics/class/:classId/cohort
   * Get cohort analysis for a class
   */
  static async getCohortAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const { sessionId, termId } = req.query;

      if (!sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId and termId are required',
        });
      }

      const data = await TeacherAnalyticsService.getCohortAnalysis(
        classId,
        sessionId as string,
        termId as string
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
