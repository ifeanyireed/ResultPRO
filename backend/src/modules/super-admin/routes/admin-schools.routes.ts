import { Router } from 'express';
import { AdminSchoolsController } from '../controllers/admin-schools.controller';

const router = Router();

// All routes are for SUPER_ADMIN only
// TODO: Add roleMiddleware check for SUPER_ADMIN

// Network overview statistics
router.get('/overview', AdminSchoolsController.getNetworkOverview);

// List all schools with filters
router.get('/list', AdminSchoolsController.getSchoolsList);

// Consolidated network analytics
router.get('/analytics', AdminSchoolsController.getNetworkAnalytics);

// Financial dashboard
router.get('/financial', AdminSchoolsController.getFinancialDashboard);

// Network-wide staff management
router.get('/staff', AdminSchoolsController.getNetworkStaff);

// System alerts and notifications
router.get('/alerts', AdminSchoolsController.getNetworkAlerts);

// Bulk actions on schools
router.post('/:schoolId/bulk-action', AdminSchoolsController.performBulkAction);

export default router;
