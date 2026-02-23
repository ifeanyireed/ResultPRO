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
          documents.push({
            documentType: school.documentVerificationType,
            documentUrl: school.documentVerificationUrl,
            uploadedAt: school.documentVerificationSubmittedAt?.toISOString() || new Date().toISOString(),
          });
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
      const school = await (global as any).School.findByPk(schoolId);

      if (!school) {
        throw new NotFoundException('School not found');
      }

      const admin = await (global as any).SchoolAdminUser.findOne({
        where: { schoolId },
      });

      return {
        school: {
          id: school.id,
          name: school.name,
          registrationNumber: school.registrationNumber,
          email: school.email,
          phone: school.phone,
          contactPerson: school.contactPerson,
          address: school.address,
          city: school.city,
          state: school.state,
          logo: school.logo,
          subscriptionTier: school.subscriptionTier,
          studentCapacity: school.studentCapacity,
          registeredAt: school.createdAt,
        },
        admin: admin
          ? {
              id: admin.id,
              firstName: admin.firstName,
              lastName: admin.lastName,
              email: admin.email,
              phone: admin.phone,
            }
          : null,
        onboardingProgress: school.onboardingStatus,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Approve a school for activation
   */
  async approveSchool(data: ApprovalData) {
    try {
      const { schoolId, remarks } = data;

      const school = await (global as any).School.findByPk(schoolId);

      if (!school) {
        throw new NotFoundException('School not found');
      }

      if (school.onboardingStatus !== 'PENDING_VERIFICATION') {
        throw new ValidationException(
          `School cannot be approved. Current status: ${school.onboardingStatus}`
        );
      }

      // Get admin user
      const admin = await (global as any).SchoolAdminUser.findOne({
        where: { schoolId },
      });

      if (!admin) {
        throw new NotFoundException('School admin user not found');
      }

      // Generate temporary password for admin
      const tempPassword = this.generateTempPassword();
      const hashedPassword = await PasswordHelper.hashPassword(tempPassword);

      // Update admin password
      await admin.update({
        passwordHash: hashedPassword,
        isApproved: true,
        approvedAt: new Date(),
      });

      // Update school status
      await school.update({
        onboardingStatus: 'ACTIVE',
        verifiedAt: new Date(),
        verificationRemarks: remarks || null,
      });

      // Send approval email to admin with temp password
      await this.emailService.sendSchoolApprovalEmail(admin.email, admin.firstName, tempPassword);

      return {
        success: true,
        message: 'School approved successfully',
        school: {
          id: school.id,
          name: school.name,
          status: 'ACTIVE',
        },
      };
    } catch (error: any) {
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

      const school = await (global as any).School.findByPk(schoolId);

      if (!school) {
        throw new NotFoundException('School not found');
      }

      if (school.onboardingStatus !== 'PENDING_VERIFICATION') {
        throw new ValidationException(
          `School cannot be rejected. Current status: ${school.onboardingStatus}`
        );
      }

      // Get admin contact
      const admin = await (global as any).SchoolAdminUser.findOne({
        where: { schoolId },
      });

      // Update school status
      await school.update({
        onboardingStatus: 'REJECTED',
        rejectionReason: reason,
        rejectedAt: new Date(),
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
          id: school.id,
          name: school.name,
          status: 'REJECTED',
        },
      };
    } catch (error: any) {
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

      const { count, rows } = await (global as any).School.findAndCountAll({
        where,
        offset,
        limit,
        order: [['createdAt', 'DESC']],
      });

      const schools = rows.map((school: any) => ({
        id: school.id,
        name: school.name,
        email: school.email,
        status: school.onboardingStatus,
        subscriptionTier: school.subscriptionTier,
        registeredAt: school.createdAt,
        verifiedAt: school.verifiedAt,
      }));

      return {
        data: schools,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error: any) {
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
