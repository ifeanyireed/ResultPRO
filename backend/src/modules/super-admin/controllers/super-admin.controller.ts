import { Request, Response } from 'express';
import { superAdminService } from '../services/super-admin.service';

export class SuperAdminController {
  /**
   * GET /api/super-admin/schools/pending
   * Get all pending schools for verification
   */
  static async getPendingSchools(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await superAdminService.getPendingSchools(page, limit);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * GET /api/super-admin/schools/:schoolId
   * Get school details for verification
   */
  static async getSchoolDetails(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;

      const result = await superAdminService.getSchoolDetails(schoolId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * POST /api/super-admin/schools/:schoolId/approve
   * Approve a school
   */
  static async approveSchool(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      const { remarks } = req.body;

      const result = await superAdminService.approveSchool({
        schoolId,
        remarks,
      });

      res.json({
        success: true,
        message: 'School approved successfully',
        data: result,
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * POST /api/super-admin/schools/:schoolId/reject
   * Reject a school
   */
  static async rejectSchool(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Rejection reason is required',
          code: 'MISSING_REASON',
        });
      }

      const result = await superAdminService.rejectSchool({
        schoolId,
        reason,
      });

      res.json({
        success: true,
        message: 'School rejected successfully',
        data: result,
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }

  /**
   * GET /api/super-admin/schools
   * Get all schools with optional status filter
   */
  static async getAllSchools(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await superAdminService.getAllSchools(status, page, limit);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message,
        code: error.code || 'ERROR',
      });
    }
  }
}
