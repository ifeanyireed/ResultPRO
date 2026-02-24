import { Request, Response } from 'express';
/**
 * Generate multiple scratch cards
 * POST /api/scratch-cards/generate
 */
export declare function generateScratchCards(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Get all scratch cards for a school
 * GET /api/scratch-cards
 */
export declare function getScratchCards(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Check scratch card and return student results
 * POST /api/scratch-cards/check-results
 */
export declare function checkResultsWithScratchCard(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Get scratch card statistics (admin)
 * GET /api/scratch-cards/stats
 */
export declare function getScratchCardStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=scratch-cards.controller.d.ts.map