import { Request, Response } from 'express';
/**
 * Get a student's results by admission number and PIN
 * This endpoint is called after scratch card verification
 */
export declare function getStudentResults(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get available sessions and terms for a school
 */
export declare function getSessionsAndTerms(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=results.controller.d.ts.map