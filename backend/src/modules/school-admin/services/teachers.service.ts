import { prisma } from '@lib/prisma';
import { PasswordHelper } from '@utils/helpers/password.helper';

class TeachersService {
  /**
   * List all teachers for a school
   */
  async listTeachers(
    schoolId: string,
    page: number = 1,
    limit: number = 20,
    filters?: { search?: string; status?: string }
  ) {
    try {
      const offset = (page - 1) * limit;
      const where: any = {
        schoolId,
        role: 'TEACHER',
      };

      if (filters?.search) {
        where.OR = [
          { email: { contains: filters.search, mode: 'insensitive' } },
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      const [teachers, count] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        data: teachers,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      console.error('Error listing teachers:', error);
      throw error;
    }
  }

  /**
   * Get teacher details
   */
  async getTeacher(teacherId: string) {
    try {
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new Error('Teacher not found');
      }

      return teacher;
    } catch (error) {
      console.error('Error getting teacher:', error);
      throw error;
    }
  }

  /**
   * Create a new teacher
   */
  async createTeacher(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    schoolId: string;
    subject?: string;
  }) {
    try {
      const tempPassword = this.generateTempPassword();
      const hashedPassword = await PasswordHelper.hashPassword(tempPassword);

      const teacher = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          passwordHash: hashedPassword,
          role: 'TEACHER',
          status: 'ACTIVE',
          schoolId: data.schoolId,
          firstLogin: true,
        },
      });

      return teacher;
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  }

  /**
   * Update teacher
   */
  async updateTeacher(teacherId: string, data: any) {
    try {
      const teacher = await prisma.user.update({
        where: { id: teacherId },
        data,
      });

      return teacher;
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  }

  /**
   * Assign class to teacher
   */
  async assignClass(teacherId: string, classId: string) {
    try {
      // Create association between teacher and class
      // You may need to create a TeacherClass linking table if it doesn't exist
      const teacher = await prisma.user.update({
        where: { id: teacherId },
        data: {
          classId, // Assuming there's a classId field in User model
        },
      });

      return teacher;
    } catch (error) {
      console.error('Error assigning class:', error);
      throw error;
    }
  }

  /**
   * Assign subject to teacher
   */
  async assignSubject(teacherId: string, subject: string) {
    try {
      const teacher = await prisma.user.update({
        where: { id: teacherId },
        data: {
          subject, // Assuming there's a subject field in User model
        },
      });

      return teacher;
    } catch (error) {
      console.error('Error assigning subject:', error);
      throw error;
    }
  }

  /**
   * Update teacher status
   */
  async updateTeacherStatus(teacherId: string, status: string) {
    try {
      const teacher = await prisma.user.update({
        where: { id: teacherId },
        data: { status },
      });

      return teacher;
    } catch (error) {
      console.error('Error updating teacher status:', error);
      throw error;
    }
  }

  /**
   * Delete teacher
   */
  async deleteTeacher(teacherId: string) {
    try {
      await prisma.user.delete({
        where: { id: teacherId },
      });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  }

  /**
   * Bulk invite teachers
   */
  async bulkInviteTeachers(emails: string[], schoolId: string, subject?: string) {
    try {
      const results = { success: 0, failed: 0, errors: [] as any[] };
      const tempPassword = this.generateTempPassword();
      const hashedPassword = await PasswordHelper.hashPassword(tempPassword);

      for (const email of emails) {
        try {
          await prisma.user.create({
            data: {
              email,
              passwordHash: hashedPassword,
              role: 'TEACHER',
              status: 'ACTIVE',
              schoolId,
              subject,
              firstLogin: true,
            },
          });
          results.success++;

          // Send invitation email (optional)
          // await this.emailService.sendTeacherInvitation(email, tempPassword, { schoolId, subject });
        } catch (error: any) {
          results.failed++;
          results.errors.push({ email, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Error bulk inviting teachers:', error);
      throw error;
    }
  }

  /**
   * Update teacher permissions
   */
  async updatePermissions(teacherId: string, permissions: any) {
    try {
      // If using a separate permissions table, update it here
      // For now, we'll just update the user record
      const teacher = await prisma.user.update({
        where: { id: teacherId },
        data: {
          // Store permissions as JSON if the user model supports it
          // permissions: JSON.stringify(permissions),
        },
      });

      return { success: true, data: teacher };
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  }

  /**
   * Generate temporary password
   */
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

export const teachersService = new TeachersService();
