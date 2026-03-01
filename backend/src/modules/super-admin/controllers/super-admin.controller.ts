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

  /**
   * GET /api/super-admin/agents
   * Get all agents with pagination and filters
   */
  static async listAgents(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const tier = req.query.tier as string | undefined;

      const result = await superAdminService.listAgents(page, limit, { search, status, tier });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/super-admin/agents/:agentId
   * Get agent details
   */
  static async getAgent(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const agent = await superAdminService.getAgent(agentId);

      res.json({ success: true, data: agent });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/super-admin/agents
   * Create new agent
   */
  static async createAgent(req: Request, res: Response) {
    try {
      const { email, firstName, lastName, specialization } = req.body;
      const agent = await superAdminService.createAgent({ email, firstName, lastName, specialization });

      res.json({ success: true, data: agent });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * PATCH /api/super-admin/agents/:agentId
   * Update agent
   */
  static async updateAgent(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const agent = await superAdminService.updateAgent(agentId, req.body);

      res.json({ success: true, data: agent });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * PATCH /api/super-admin/agents/:agentId/status
   * Toggle agent status
   */
  static async toggleAgentStatus(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const { status } = req.body;
      const agent = await superAdminService.updateAgentStatus(agentId, status);

      res.json({ success: true, data: agent });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /api/super-admin/agents/:agentId
   * Delete agent
   */
  static async deleteAgent(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      await superAdminService.deleteAgent(agentId);

      res.json({ success: true, message: 'Agent deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/super-admin/agents/bulk/invite
   * Bulk invite agents
   */
  static async bulkInviteAgents(req: Request, res: Response) {
    try {
      const { emails, department, message } = req.body;
      const result = await superAdminService.bulkInviteUsers(emails, 'AGENT', { department, message });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/super-admin/support-staff
   * Get all support staff
   */
  static async listSupportStaff(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const department = req.query.department as string | undefined;
      const permissionLevel = req.query.permissionLevel as string | undefined;

      const result = await superAdminService.listSupportStaff(page, limit, {
        search,
        department,
        permissionLevel,
      });

      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/super-admin/support-staff/:staffId
   * Get support staff member details
   */
  static async getSupportStaff(req: Request, res: Response) {
    try {
      const { staffId } = req.params;
      const staff = await superAdminService.getSupportStaff(staffId);

      res.json({ success: true, data: staff });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/super-admin/support-staff
   * Create support staff
   */
  static async createSupportStaff(req: Request, res: Response) {
    try {
      const { email, firstName, lastName, department, permissionLevel } = req.body;
      const staff = await superAdminService.createSupportStaff({
        email,
        firstName,
        lastName,
        department,
        permissionLevel,
      });

      res.json({ success: true, data: staff });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * PATCH /api/super-admin/support-staff/:staffId
   * Update support staff
   */
  static async updateSupportStaff(req: Request, res: Response) {
    try {
      const { staffId } = req.params;
      const staff = await superAdminService.updateSupportStaff(staffId, req.body);

      res.json({ success: true, data: staff });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * PATCH /api/super-admin/support-staff/:staffId/permission-level
   * Update staff permission level
   */
  static async updateStaffPermissionLevel(req: Request, res: Response) {
    try {
      const { staffId } = req.params;
      const { permissionLevel } = req.body;
      const staff = await superAdminService.updateStaffPermissionLevel(staffId, permissionLevel);

      res.json({ success: true, data: staff });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * PATCH /api/super-admin/support-staff/:staffId/status
   * Toggle staff status
   */
  static async toggleStaffStatus(req: Request, res: Response) {
    try {
      const { staffId } = req.params;
      const { status } = req.body;
      const staff = await superAdminService.updateStaffStatus(staffId, status);

      res.json({ success: true, data: staff });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /api/super-admin/support-staff/:staffId
   * Delete support staff
   */
  static async deleteSupportStaff(req: Request, res: Response) {
    try {
      const { staffId } = req.params;
      await superAdminService.deleteSupportStaff(staffId);

      res.json({ success: true, message: 'Support staff deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/super-admin/support-staff/bulk/invite
   * Bulk invite support staff
   */
  static async bulkInviteSupportStaff(req: Request, res: Response) {
    try {
      const { emails, department, message } = req.body;
      const result = await superAdminService.bulkInviteUsers(emails, 'SUPPORT_AGENT', {
        department,
        message,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
