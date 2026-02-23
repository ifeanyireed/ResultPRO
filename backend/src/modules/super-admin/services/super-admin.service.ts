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
            onboardingStatus: 'ACTIVE',
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
