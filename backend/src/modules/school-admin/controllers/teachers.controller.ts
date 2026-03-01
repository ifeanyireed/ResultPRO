import { Request, Response } from 'express';
import { teachersService } from '../services/teachers.service';

export class TeachersController {
  /**
   * List all teachers for a school
   */
  static async listTeachers(req: Request, res: Response) {
    try {
      const schoolId = req.query.schoolId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      if (!schoolId) {
        return res.status(400).json({ success: false, error: 'School ID is required' });
      }

      const result = await teachersService.listTeachers(schoolId, page, limit, { search, status });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get teacher details
   */
  static async getTeacher(req: Request, res: Response) {
    try {
      const { teacherId } = req.params;
      const teacher = await teachersService.getTeacher(teacherId);
      res.json({ success: true, data: teacher });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Create a new teacher
   */
  static async createTeacher(req: Request, res: Response) {
    try {
      const { email, firstName, lastName, schoolId, subject } = req.body;

      if (!email || !schoolId) {
        return res.status(400).json({ success: false, error: 'Email and School ID are required' });
      }

      const teacher = await teachersService.createTeacher({
        email,
        firstName,
        lastName,
        schoolId,
        subject,
      });

      res.status(201).json({ success: true, data: teacher });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Update teacher
   */
  static async updateTeacher(req: Request, res: Response) {
    try {
      const { teacherId } = req.params;
      const data = req.body;

      const teacher = await teachersService.updateTeacher(teacherId, data);
      res.json({ success: true, data: teacher });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Assign class to teacher
   */
  static async assignClass(req: Request, res: Response) {
    try {
      const { teacherId } = req.params;
      const { classId } = req.body;

      if (!classId) {
        return res.status(400).json({ success: false, error: 'Class ID is required' });
      }

      const result = await teachersService.assignClass(teacherId, classId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Assign subject to teacher
   */
  static async assignSubject(req: Request, res: Response) {
    try {
      const { teacherId } = req.params;
      const { subject } = req.body;

      if (!subject) {
        return res.status(400).json({ success: false, error: 'Subject is required' });
      }

      const result = await teachersService.assignSubject(teacherId, subject);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Toggle teacher status
   */
  static async toggleTeacherStatus(req: Request, res: Response) {
    try {
      const { teacherId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      const teacher = await teachersService.updateTeacherStatus(teacherId, status);
      res.json({ success: true, data: teacher });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete teacher
   */
  static async deleteTeacher(req: Request, res: Response) {
    try {
      const { teacherId } = req.params;
      await teachersService.deleteTeacher(teacherId);
      res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Bulk invite teachers
   */
  static async bulkInviteTeachers(req: Request, res: Response) {
    try {
      const { emails, schoolId, subject } = req.body;

      if (!emails || emails.length === 0 || !schoolId) {
        return res.status(400).json({ success: false, error: 'Emails array and School ID are required' });
      }

      const result = await teachersService.bulkInviteTeachers(emails, schoolId, subject);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Update teacher permissions
   */
  static async updatePermissions(req: Request, res: Response) {
    try {
      const { teacherId } = req.params;
      const { permissions } = req.body;

      if (!permissions) {
        return res.status(400).json({ success: false, error: 'Permissions are required' });
      }

      const result = await teachersService.updatePermissions(teacherId, permissions);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
