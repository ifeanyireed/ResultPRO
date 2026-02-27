import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import {
  requestScratchCards,
  getSchoolRequests,
  getSchoolBatches,
  getBatchCards,
  toggleCardStatus,
  dispenseCard,
  getDashboard,
  exportAvailableCards,
} from '../controllers/school-scratch-cards.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * Request scratch cards
 * POST /api/school/scratch-cards/request
 */
router.post('/request', requestScratchCards);

/**
 * Get school's batch requests
 * GET /api/school/scratch-cards/requests
 */
router.get('/requests', getSchoolRequests);

/**
 * Get dashboard stats
 * GET /api/school/scratch-cards/dashboard
 */
router.get('/dashboard', getDashboard);

/**
 * Get all assigned batches
 * GET /api/school/scratch-cards/batches
 */
router.get('/batches', getSchoolBatches);

/**
 * Get cards in a batch
 * GET /api/school/scratch-cards/batches/:batchId
 */
router.get('/batches/:batchId', getBatchCards);

/**
 * Activate/Deactivate card
 * PATCH /api/school/scratch-cards/cards/:cardId
 */
router.patch('/cards/:cardId', toggleCardStatus);

/**
 * Dispense card to student
 * POST /api/school/scratch-cards/dispense
 */
router.post('/dispense', dispenseCard);

/**
 * Export available cards
 * GET /api/school/scratch-cards/export?format=csv
 */
router.get('/export', exportAvailableCards);

export default router;
