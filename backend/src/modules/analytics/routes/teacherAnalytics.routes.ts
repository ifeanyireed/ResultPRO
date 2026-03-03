// Teacher Analytics Routes
import { Router } from 'express';
import { TeacherAnalyticsController } from '../controllers/teacherAnalytics.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

// All teacher analytics routes require authentication
router.use(authMiddleware);

/**
 * Get teacher's classes
 */
router.get('/classes', TeacherAnalyticsController.getTeacherClasses);

/**
 * Class overview and analytics
 */
router.get('/class/:classId/overview', TeacherAnalyticsController.getClassOverview);

/**
 * At-risk students for a class
 */
router.get('/class/:classId/at-risk', TeacherAnalyticsController.getAtRiskStudents);

/**
 * Cohort analysis
 */
router.get('/class/:classId/cohort', TeacherAnalyticsController.getCohortAnalysis);

/**
 * Individual student detail
 */
router.get('/student/:studentId', TeacherAnalyticsController.getStudentDetail);

export default router;
