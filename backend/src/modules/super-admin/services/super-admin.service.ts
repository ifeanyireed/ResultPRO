import { AuthRepository } from '../../auth/repositories/auth.repository';
import { EmailService } from '../../common/services/email.service';
import { JwtHelper } from '@utils/helpers/jwt.helper';
import { PasswordHelper } from '@utils/helpers/password.helper';
import { UnauthorizedException } from '@modules/common/exceptions/unauthorized.exception';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';
import { ValidationException } from '@modules/common/exceptions/validation.exception';
import { prisma } from '@config/database';
import { v4 as uuidv4 } from 'uuid';

interface ApprovalData {
  schoolId: string;
  remarks?: string;
}

interface RejectionData {
  schoolId: string;
  reason: string;
}

export class SuperAdminService {
  private authRepo = new AuthRepository();
  private emailService = new EmailService();

  /**
   * Get all pending schools for verification
   * Returns schools that have submitted documents and are awaiting admin review
   */
  async getPendingSchools(page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;

      // Query schools with documents submitted and pending verification
      const [schools, count] = await Promise.all([
        prisma.school.findMany({
          where: {
            documentVerificationSubmittedAt: {
              not: null,
            },
            status: 'PENDING_VERIFICATION',
          },
          skip: offset,
          take: limit,
          orderBy: { documentVerificationSubmittedAt: 'asc' },
        }),
        prisma.school.count({
          where: {
            documentVerificationSubmittedAt: {
              not: null,
            },
            status: 'PENDING_VERIFICATION',
          },
        }),
      ]);

      const mappedSchools = schools.map((school: any) => {
        const documents = [];
        
        // Add document if one exists
        if (school.documentVerificationType && school.documentVerificationUrl) {
          console.log(`📄 School "${school.name}" has document:`);
          console.log(`   Type: ${school.documentVerificationType}`);
          console.log(`   URL length: ${school.documentVerificationUrl.length}`);
          console.log(`   Has X-Amz-Signature: ${school.documentVerificationUrl.includes('X-Amz-Signature')}`);
          console.log(`   Preview: ${school.documentVerificationUrl.substring(0, 100)}...`);
          
          documents.push({
            documentType: school.documentVerificationType,
            documentUrl: school.documentVerificationUrl,
            uploadedAt: school.documentVerificationSubmittedAt?.toISOString() || new Date().toISOString(),
          });
        } else {
          console.log(`⚠️ School "${school.name}" missing document verification data:`);
          console.log(`   has type: ${!!school.documentVerificationType}`);
          console.log(`   has url: ${!!school.documentVerificationUrl}`);
        }

        return {
          id: school.id,
          schoolName: school.name,
          email: school.contactEmail,
          phone: school.contactPhone,
          address: school.fullAddress,
          registrationDate: school.createdAt,
          documents,
          status: 'PENDING_VERIFICATION',
        };
      });

      return {
        data: mappedSchools,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error: any) {
      console.error('❌ Error fetching pending schools:', error);
      throw error;
    }
  }

  /**
   * Get school details for verification
   */
  async getSchoolDetails(schoolId: string) {
    try {
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: { adminUsers: true },
      });

      if (!school) {
        throw new NotFoundException('School not found');
      }

      const admin = school.adminUsers[0];

      return {
        school: {
          id: school.id,
          name: school.name,
          slug: school.slug,
          contactEmail: school.contactEmail,
          contactPhone: school.contactPhone,
          contactPersonName: school.contactPersonName,
          fullAddress: school.fullAddress,
          state: school.state,
          lga: school.lga,
          logoUrl: school.logoUrl,
          subscriptionTier: school.subscriptionTier,
          maxStudents: school.maxStudents,
          maxTeachers: school.maxTeachers,
          status: school.status,
          verificationStatus: school.verificationStatus,
          documentVerificationUrl: school.documentVerificationUrl,
          createdAt: school.createdAt,
        },
        admin: admin
          ? {
              id: admin.id,
              firstName: admin.firstName,
              lastName: admin.lastName,
              email: admin.email,
              role: admin.role,
            }
          : null,
        onboardingStatus: school.onboardingStatus,
      };
    } catch (error: any) {
      console.error('❌ Error getting school details:', error);
      throw error;
    }
  }

  /**
   * Approve a school for activation
   */
  async approveSchool(data: ApprovalData) {
    try {
      const { schoolId, remarks } = data;

      // Check if school exists and is pending verification
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: { adminUsers: true },
      });

      if (!school) {
        throw new NotFoundException('School not found');
      }

      if (school.status !== 'PENDING_VERIFICATION') {
        throw new ValidationException(
          `School cannot be approved. Current status: ${school.status}`
        );
      }

      // Get admin user
      const admin = school.adminUsers[0];

      if (!admin) {
        throw new NotFoundException('School admin user not found');
      }

      // Generate temporary password for admin
      const tempPassword = this.generateTempPassword();
      const hashedPassword = await PasswordHelper.hashPassword(tempPassword);

      // Update admin and school in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update admin user
        await tx.schoolAdminUser.update({
          where: { id: admin.id },
          data: {
            passwordHash: hashedPassword,
            status: 'ACTIVE',
          },
        });

        // Update school status
        const updatedSchool = await tx.school.update({
          where: { id: schoolId },
          data: {
            status: 'APPROVED',
            onboardingStatus: 'NOT_STARTED',
            verifiedAt: new Date(),
            verifiedBy: 'super-admin',
            rejectionReason: null,
          },
        });

        return updatedSchool;
      });

      // Send approval email to admin with temp password
      await this.emailService.sendSchoolApprovalEmail(admin.email, admin.firstName || 'Admin', tempPassword);

      return {
        success: true,
        message: 'School approved successfully',
        school: {
          id: result.id,
          name: result.name,
          status: result.status,
        },
      };
    } catch (error: any) {
      console.error('❌ Error approving school:', error);
      throw error;
    }
  }

  /**
   * Reject a school
   */
  async rejectSchool(data: RejectionData) {
    try {
      const { schoolId, reason } = data;

      if (!reason || reason.trim().length === 0) {
        throw new ValidationException('Rejection reason is required');
      }

      // Check if school exists and is pending verification
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: { adminUsers: true },
      });

      if (!school) {
        throw new NotFoundException('School not found');
      }

      if (school.status !== 'PENDING_VERIFICATION') {
        throw new ValidationException(
          `School cannot be rejected. Current status: ${school.status}`
        );
      }

      // Get admin contact
      const admin = school.adminUsers[0];

      // Update school status
      const updatedSchool = await prisma.school.update({
        where: { id: schoolId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
        },
      });

      // Send rejection email
      if (admin) {
        await this.emailService.sendSchoolRejectionEmail(
          admin.email,
          school.name,
          reason
        );
      }

      return {
        success: true,
        message: 'School rejected successfully',
        school: {
          id: updatedSchool.id,
          name: updatedSchool.name,
          status: updatedSchool.status,
        },
      };
    } catch (error: any) {
      console.error('❌ Error rejecting school:', error);
      throw error;
    }
  }

  /**
   * Get all schools with various statuses
   */
  async getAllSchools(status?: string, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      const where: any = {};

      if (status) {
        where.onboardingStatus = status;
      }

      const [schools, count] = await Promise.all([
        prisma.school.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.school.count({ where }),
      ]);

      const mappedSchools = schools.map((school) => ({
        id: school.id,
        name: school.name,
        contactEmail: school.contactEmail,
        status: school.onboardingStatus,
        subscriptionTier: school.subscriptionTier,
        createdAt: school.createdAt,
        verifiedAt: school.verifiedAt,
      }));

      return {
        data: mappedSchools,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error: any) {
      console.error('❌ Error getting all schools:', error);
      throw error;
    }
  }

  /**
   * List all agents with filters
   */
  async listAgents(page: number = 1, limit: number = 20, filters?: any) {
    try {
      const offset = (page - 1) * limit;
      const where: any = { role: 'AGENT' };

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

      const [agents, count] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        data: agents,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get agent details
   */
  async getAgent(agentId: string) {
    try {
      const agent = await prisma.user.findUnique({
        where: { id: agentId },
      });

      if (!agent) throw new NotFoundException('Agent not found');
      return agent;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new agent
   */
  async createAgent(data: { email: string; firstName?: string; lastName?: string; specialization?: string }) {
    try {
      const tempPassword = this.generateTempPassword();
      const hashedPassword = await PasswordHelper.hashPassword(tempPassword);

      const agent = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          passwordHash: hashedPassword,
          role: 'AGENT',
          status: 'ACTIVE',
          firstLogin: true,
        },
      });

      // Send invitation email (optional)
      // await this.emailService.sendInvitationEmail(data.email, tempPassword);

      return agent;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update agent
   */
  async updateAgent(agentId: string, data: any) {
    try {
      const agent = await prisma.user.update({
        where: { id: agentId },
        data,
      });
      return agent;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentId: string, status: string) {
    try {
      const agent = await prisma.user.update({
        where: { id: agentId },
        data: { status },
      });
      return agent;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId: string) {
    try {
      await prisma.user.delete({
        where: { id: agentId },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * List all support staff
   */
  async listSupportStaff(page: number = 1, limit: number = 20, filters?: any) {
    try {
      const offset = (page - 1) * limit;
      const where: any = { role: 'SUPPORT_AGENT' };

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

      const [staff, count] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        data: staff,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get support staff details
   */
  async getSupportStaff(staffId: string) {
    try {
      const staff = await prisma.user.findUnique({
        where: { id: staffId },
      });

      if (!staff) throw new NotFoundException('Support staff member not found');
      return staff;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create support staff
   */
  async createSupportStaff(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    permissionLevel?: string;
  }) {
    try {
      const tempPassword = this.generateTempPassword();
      const hashedPassword = await PasswordHelper.hashPassword(tempPassword);

      const staff = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          passwordHash: hashedPassword,
          role: 'SUPPORT_AGENT',
          status: 'ACTIVE',
          firstLogin: true,
        },
      });

      return staff;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update support staff
   */
  async updateSupportStaff(staffId: string, data: any) {
    try {
      const staff = await prisma.user.update({
        where: { id: staffId },
        data,
      });
      return staff;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update staff permission level
   */
  async updateStaffPermissionLevel(staffId: string, permissionLevel: string) {
    try {
      const staff = await prisma.user.update({
        where: { id: staffId },
        data: { status: permissionLevel }, // Can be extended to use a separate permission table
      });
      return staff;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update staff status
   */
  async updateStaffStatus(staffId: string, status: string) {
    try {
      const staff = await prisma.user.update({
        where: { id: staffId },
        data: { status },
      });
      return staff;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete support staff
   */
  async deleteSupportStaff(staffId: string) {
    try {
      await prisma.user.delete({
        where: { id: staffId },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk invite users
   */
  async bulkInviteUsers(emails: string[], role: string, options?: { department?: string; message?: string }) {
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
              role,
              status: 'ACTIVE',
              firstLogin: true,
            },
          });
          results.success++;

          // Send invitation email (optional)
          // await this.emailService.sendInvitationEmail(email, tempPassword, { role, department: options?.department });
        } catch (error: any) {
          results.failed++;
          results.errors.push({ email, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate a temporary password
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

export const superAdminService = new SuperAdminService();
