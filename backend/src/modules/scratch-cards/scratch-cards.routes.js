import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { generateScratchCards, getScratchCards, checkResultsWithScratchCard, getScratchCardStats, } from './scratch-cards.controller';
const router = Router();
// All routes require authentication
router.use(authMiddleware);
/**
 * Generate new scratch cards
 * POST /api/scratch-cards/generate
 */
router.post('/generate', generateScratchCards);
/**
 * Get all scratch cards for the school
 * GET /api/scratch-cards
 */
router.get('/', getScratchCards);
/**
 * Get statistics
 * GET /api/scratch-cards/stats
 */
router.get('/stats', getScratchCardStats);
/**
 * Check results using scratch card PIN
 * POST /api/scratch-cards/check-results
 * Body: { scratchCardPin, sessionId, termId, admissionNumber }
 */
router.post('/check-results', checkResultsWithScratchCard);
export default router;
//# sourceMappingURL=scratch-cards.routes.js.map