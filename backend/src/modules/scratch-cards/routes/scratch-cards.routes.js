import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { getScratchCardStats, verifyScratchCard, downloadScratchCards, getScratchCardDashboard, } from '../controllers/scratch-cards.controller';
const router = Router();
/**
 * PUBLIC ENDPOINT
 * Users can verify their scratch card without authentication
 */
router.post('/verify', verifyScratchCard);
/**
 * SCHOOL ADMIN ENDPOINTS (PROTECTED)
 * School admins can view their assigned scratch cards and track usage
 */
// All authenticated endpoints require authentication
router.use(authMiddleware);
// Get comprehensive dashboard data for scratch cards
// Shows: overview stats, usage trends, distribution, recent activity
router.get('/dashboard', getScratchCardDashboard);
// Get scratch card statistics and list for dashboard
// Shows: total cards, active cards, usage statistics, generation rates
router.get('/stats', getScratchCardStats);
// Download unused scratch cards as CSV for printing/distribution
router.get('/download', downloadScratchCards);
export default router;
//# sourceMappingURL=scratch-cards.routes.js.map