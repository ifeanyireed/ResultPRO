// Analytics Controller - HTTP request handlers
import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { RiskScoreService } from '../services/riskScore.service';
import { SubjectAnalyticsService } from '../services/subjectAnalytics.service';
import { AttendanceImpactService } from '../services/attendanceImpact.service';
import { StudentProgressService } from '../services/studentProgress.service';
import { ClassComparisonService } from '../services/classComparison.service';

export class AnalyticsController {
  /**
   * GET /api/analytics/dashboard
   * Get dashboard KPIs for a class
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, sessionId, termId } = req.query;

      if (!classId || !sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'classId, sessionId, and termId are required',
        });
      }

      const data = await DashboardService.getDashboardData(
        classId as string,
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
   * GET /api/analytics/at-risk-students
   * Get list of at-risk students with risk scores
   */
  static async getAtRiskStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, sessionId, termId } = req.query;

      if (!classId || !sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'classId, sessionId, and termId are required',
        });
      }

      const riskScores = await RiskScoreService.calculateClassRiskScores(
        classId as string,
        sessionId as string,
        termId as string
      );

      // Separate by risk level
      const summary = {
        totalAtRisk: riskScores.length,
        critical: riskScores.filter(r => r.riskLevel === 'CRITICAL').length,
        high: riskScores.filter(r => r.riskLevel === 'HIGH').length,
        medium: riskScores.filter(r => r.riskLevel === 'MEDIUM').length,
        low: riskScores.filter(r => r.riskLevel === 'LOW').length,
      };

      res.json({
        success: true,
        data: {
          students: riskScores,
          summary,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/subject/:subjectId
   * Get detailed analytics for a subject
   */
  static async getSubjectAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;
      const { classId, sessionId, termId } = req.query;

      if (!classId || !sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'classId, sessionId, and termId are required',
        });
      }

      const data = await SubjectAnalyticsService.getSubjectAnalytics(
        classId as string,
        subjectId,
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
   * GET /api/analytics/subjects
   * Get analytics for all subjects in a class
   */
  static async getClassSubjectsAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, sessionId, termId } = req.query;

      if (!classId || !sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'classId, sessionId, and termId are required',
        });
      }

      const data = await SubjectAnalyticsService.getClassSubjectsAnalytics(
        classId as string,
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
   * GET /api/analytics/student/:studentId
   * Get comprehensive analytics for a student
   */
  static async getStudentAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;

      const data = await StudentProgressService.getStudentAnalytics(studentId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/attendance-impact
   * Analyze attendance impact on performance
   */
  static async getAttendanceImpact(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, sessionId, termId } = req.query;

      if (!classId || !sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'classId, sessionId, and termId are required',
        });
      }

      const data = await AttendanceImpactService.analyzeAttendanceImpact(
        classId as string,
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
   * GET /api/analytics/compare-classes
   * Compare performance across multiple classes
   */
  static async compareClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const { classIds, sessionId, termId } = req.query;

      if (!classIds || !sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'classIds, sessionId, and termId are required',
        });
      }

      const ids = (classIds as string).split(',');
      const data = await ClassComparisonService.compareClasses(
        ids,
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
   * GET /api/analytics/school-dashboard
   * Get dashboard for entire school
   */
  static async getSchoolDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, sessionId, termId } = req.query;

      if (!schoolId || !sessionId || !termId) {
        return res.status(400).json({
          success: false,
          message: 'schoolId, sessionId, and termId are required',
        });
      }

      const data = await DashboardService.getSchoolDashboardData(
        schoolId as string,
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
