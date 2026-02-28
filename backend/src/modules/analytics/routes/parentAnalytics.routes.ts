// Parent Analytics Routes
import { Router } from 'express';
import { ParentAnalyticsController } from '../controllers/parentAnalytics.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Dashboard and children
router.get('/dashboard', ParentAnalyticsController.getDashboard);
router.get('/children', ParentAnalyticsController.getChildren);

// Child-specific analytics
router.get('/child/:studentId/summary', ParentAnalyticsController.getChildSummary);
router.get('/child/:studentId/progress', ParentAnalyticsController.getChildProgress);
router.get('/child/:studentId/subject/:subjectName', ParentAnalyticsController.getChildSubject);
router.get('/child/:studentId/attendance', ParentAnalyticsController.getChildAttendance);
router.get('/child/:studentId/analytics', ParentAnalyticsController.getChildAnalytics);

export default router;
