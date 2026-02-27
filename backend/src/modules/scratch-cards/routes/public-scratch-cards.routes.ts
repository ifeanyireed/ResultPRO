import { Router } from 'express';
import { validateScratchCard, getCardStats } from '../controllers/public-scratch-cards.controller';

const router = Router();

/**
 * Validate scratch card and get student results
 * POST /api/scratch-cards/validate
 * No authentication required
 */
router.post('/validate', validateScratchCard);

/**
 * Get scratch card usage statistics
 * GET /api/scratch-cards/:pin/stats
 */
router.get('/:pin/stats', getCardStats);

export default router;
