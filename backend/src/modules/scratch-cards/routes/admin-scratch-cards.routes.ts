import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import {
  generateBatch,
  getAllBatches,
  getBatchDetails,
  assignBatchToSchool,
  activateBatch,
  deactivateBatch,
  getSystemStats,
  exportBatchCodes,
} from '../controllers/admin-scratch-cards.controller';

const router = Router();

// All routes require authentication and SUPER_ADMIN role
router.use(authMiddleware);

/**
 * Generate new batch of scratch cards
 * POST /api/admin/scratch-cards/batches/generate
 */
router.post('/batches/generate', generateBatch);

/**
 * Get all batches with filters
 * GET /api/admin/scratch-cards/batches?status=ACTIVE&schoolId=xxx
 */
router.get('/batches', getAllBatches);

/**
 * Get specific batch details
 * GET /api/admin/scratch-cards/batches/:batchId
 */
router.get('/batches/:batchId', getBatchDetails);

/**
 * Assign batch to school
 * PATCH /api/admin/scratch-cards/batches/:batchId/assign
 */
router.patch('/batches/:batchId/assign', assignBatchToSchool);

/**
 * Activate batch
 * POST /api/admin/scratch-cards/batches/:batchId/activate
 */
router.post('/batches/:batchId/activate', activateBatch);

/**
 * Deactivate batch
 * POST /api/admin/scratch-cards/batches/:batchId/deactivate
 */
router.post('/batches/:batchId/deactivate', deactivateBatch);

/**
 * Get system-wide statistics
 * GET /api/admin/scratch-cards/stats
 */
router.get('/stats', getSystemStats);

/**
 * Export batch codes
 * GET /api/admin/scratch-cards/batches/:batchId/export?format=csv
 */
router.get('/batches/:batchId/export', exportBatchCodes);

export default router;
