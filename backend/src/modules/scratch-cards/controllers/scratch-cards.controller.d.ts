import { Request, Response } from 'express';
/**
 * SCHOOL ADMIN ENDPOINTS - VIEW & TRACK ONLY
 * School admins can ONLY view assigned cards and track usage
 * Card generation is handled exclusively by SUPER_ADMIN
 */
export declare function verifyScratchCard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getScratchCardStats(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function downloadScratchCards(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getScratchCardDashboard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=scratch-cards.controller.d.ts.map