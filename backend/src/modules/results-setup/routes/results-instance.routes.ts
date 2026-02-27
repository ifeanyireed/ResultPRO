import { Router } from 'express';
import * as resultsInstanceController from '../controllers/results-instance.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

// Protect all routes with auth middleware
router.use(authMiddleware);

/**
 * POST /api/results-setup/instances
 * Create a new results instance
 * Auto-archives previous active instance for same class/session/term
 */
router.post('/', resultsInstanceController.createInstance);

/**
 * GET /api/results-setup/instances
 * List all instances for the school
 * Query params: classId, sessionId, status
 */
router.get('/', resultsInstanceController.listInstances);

/**
 * GET /api/results-setup/instances/active/:classId/:sessionId/:termId
 * Get the active instance for a specific class/session/term combo
 */
router.get('/active/:classId/:sessionId/:termId', resultsInstanceController.getActiveInstance);

/**
 * GET /api/results-setup/instances/:instanceId
 * Get a specific instance by ID
 */
router.get('/:instanceId', resultsInstanceController.getInstance);

/**
 * PUT /api/results-setup/instances/:instanceId/archive
 * Archive an instance (soft delete)
 */
router.put('/:instanceId/archive', resultsInstanceController.archiveInstance);

/**
 * DELETE /api/results-setup/instances/:instanceId
 * Permanently delete an instance (hard delete)
 */
router.delete('/:instanceId', resultsInstanceController.deleteInstance);

export default router;
