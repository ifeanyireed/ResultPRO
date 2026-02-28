// Analytics Routes
import { Router, Request, Response } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

/**
 * Dashboard
 */
router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/school-dashboard', AnalyticsController.getSchoolDashboard);

/**
 * At-Risk Students
 */
router.get('/at-risk-students', AnalyticsController.getAtRiskStudents);

/**
 * Subject Analytics
 */
router.get('/subjects', AnalyticsController.getClassSubjectsAnalytics);
router.get('/subject/:subjectId', AnalyticsController.getSubjectAnalytics);

/**
 * Student Analytics
 */
router.get('/student/:studentId', AnalyticsController.getStudentAnalytics);

/**
 * Attendance Impact
 */
router.get('/attendance-impact', AnalyticsController.getAttendanceImpact);

/**
 * Class Comparison
 */
router.get('/compare-classes', AnalyticsController.compareClasses);

/**
 * Health check
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Analytics module is running',
  });
});

export default router;
