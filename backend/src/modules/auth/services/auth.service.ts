import { AuthRepository } from '../repositories/auth.repository';
import { prisma } from '@config/database';
import { PasswordHelper } from '@utils/helpers/password.helper';
import { JwtHelper } from '@utils/helpers/jwt.helper';
import { SlugHelper } from '@utils/helpers/slug.helper';
import { EmailValidator } from '@utils/validators/email.validator';
import { PhoneValidator } from '@utils/validators/phone.validator';
import { emailService } from '@modules/common/services/email.service';
import { otpService } from '@modules/common/services/otp.service';
import { ConflictException } from '@modules/common/exceptions/conflict.exception';
import { NotFoundException } from '@modules/common/exceptions/not-found.exception';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  /**
   * Register a new school
   */
  async register(data: {
    schoolName: string;
    email: string;
    phone: string;
    fullAddress: string;
    state: string;
    lga: string;
    password: string;
  }) {
    try {
      // Normalize email
      const normalizedEmail = EmailValidator.normalizeEmail(data.email);

      // Validate email
      if (!EmailValidator.validate(normalizedEmail)) {
        throw new ConflictException('Invalid email format', 'INVALID_EMAIL');
      }

      // Validate phone
      if (!PhoneValidator.validateNigeria(data.phone)) {
        throw new ConflictException('Invalid Nigerian phone number', 'INVALID_PHONE');
      }

      // Validate password
      if (!data.password || data.password.length < 8) {
        throw new ConflictException('Password must be at least 8 characters long', 'INVALID_PASSWORD');
      }

      // Check if email already registered (use normalized email)
      if (await this.repository.isEmailRegistered(normalizedEmail)) {
        throw new ConflictException('This email is already registered. Please use a different email or login to your existing account.', 'DUPLICATE_EMAIL');
      }

      // Check if school name already exists
      if (await this.repository.isNameExists(data.schoolName)) {
        throw new ConflictException('School name already exists. Please choose a different school name.', 'DUPLICATE_SCHOOL_NAME');
      }

      // Create school slug
      let slug = SlugHelper.generate(data.schoolName);
      while (await this.repository.isSlugExists(slug)) {
        slug = SlugHelper.generateUnique(slug);
      }

      // Create school
      const school = await this.repository.createSchool({
        name: data.schoolName,
        slug,
        contactEmail: normalizedEmail,  // Use normalized email
        contactPhone: PhoneValidator.formatNigeria(data.phone),
        fullAddress: data.fullAddress,
        state: data.state,
        lga: data.lga,
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'NOT_VERIFIED',
        subscriptionTier: 'BASIC',
        maxStudents: 100,
        maxTeachers: 20,
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        accentColor: '#FCD34D',
      });

      // Hash password
      const passwordHash = await PasswordHelper.hashPassword(data.password);

      // Create school admin user (with normalized email)
      const adminUser = await this.repository.createAdminUser({
        schoolId: school.id,
        email: EmailValidator.normalizeEmail(data.email),
        fullName: data.schoolName, // Use school name as full name initially
        passwordHash,
        role: 'SCHOOL_ADMIN',
        status: 'ACTIVE',
        firstLogin: true,
      });

      // Generate OTP
      const otp = await otpService.generateOtp(normalizedEmail);

      // Send verification email
      await emailService.sendVerificationEmail(normalizedEmail, otp);

      return {
        schoolId: school.id,
        email: normalizedEmail,
        verificationSent: true,
        expiresIn: 600, // 10 minutes in seconds
      };
    } catch (error: any) {
      // Handle unique constraint violations from database
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'School name';
        if (field === 'name') {
          console.error('❌ Duplicate school name attempt:', data.schoolName);
          throw new ConflictException('School name already exists. Please choose a different school name.', 'DUPLICATE_SCHOOL_NAME');
        } else if (field === 'contactEmail') {
          console.error('❌ Duplicate email attempt:', data.email);
          throw new ConflictException('This email is already registered. Please use a different email or login to your existing account.', 'DUPLICATE_EMAIL');
        }
      }

      console.error('❌ Auth Service Error:', {
        message: error.message,
        code: error.code,
        status: error.status,
        name: error.name,
        sqlMessage: error.sqlMessage,
        originalError: error.original?.message
      });
      throw error;
    }
  }

  /**
   * Verify email with OTP
   */
  async verifyEmail(email: string, otp: string) {
    const normalizedEmail = EmailValidator.normalizeEmail(email);

    // Verify OTP
    await otpService.verifyOtp(normalizedEmail, otp);

    // Update school verification status
    const school = await this.repository.findSchoolByEmail(normalizedEmail);
    if (!school) {
      throw new NotFoundException('School not found');
    }

    await this.repository.updateSchool(school.id, {
      verificationStatus: 'EMAIL_VERIFIED',
      status: 'AWAITING_VERIFICATION_DOCS',
    });

    // Create onboarding state
    await prisma.onboardingState.create({
      data: {
        schoolId: school.id,
        completedSteps: JSON.stringify([]),
        currentStep: 1,
        isComplete: false,
      },
    });

    return {
      schoolId: school.id,
      status: 'AWAITING_VERIFICATION_DOCS',
      nextStep: 'submit_verification_docs',
    };
  }

  /**
   * Resend OTP
   */
  async resendOtp(email: string) {
    const normalizedEmail = EmailValidator.normalizeEmail(email);

    // First, try to find admin user by email (for when resending after login attempt)
    let adminUser = await this.repository.findAdminUserByEmail(normalizedEmail);
    let school: any;

    if (adminUser) {
      // If admin user exists, get their school
      school = await this.repository.findSchoolById(adminUser.schoolId);
      if (!school) {
        throw new NotFoundException('School not found');
      }
    } else {
      // If no admin user, try to find school by contact email (for new registrations)
      school = await this.repository.findSchoolByEmail(normalizedEmail);
      if (!school) {
        throw new NotFoundException('No account found with this email');
      }
    }

    if (school.verificationStatus === 'EMAIL_VERIFIED') {
      throw new ConflictException('Email already verified', 'ALREADY_VERIFIED');
    }

    // Generate new OTP - use the email that was passed (admin email or school email)
    const otp = await otpService.generateOtp(normalizedEmail);

    // Send verification email to the user's email
    await emailService.sendVerificationEmail(normalizedEmail, otp);

    return {
      expiresIn: 600,
    };
  }

  /**
   * Initiate forgot password flow
   */
  async forgotPassword(email: string) {
    const normalizedEmail = EmailValidator.normalizeEmail(email);

    // Try to find admin user first (school admins)
    let adminUser = await this.repository.findAdminUserByEmail(normalizedEmail);
    
    if (adminUser) {
      // Generate password reset token (valid for 1 hour)
      const resetToken = JwtHelper.generateResetToken({ userId: adminUser.id, email: normalizedEmail });
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 1);

      // Store reset token in database
      await this.repository.updateAdminUserResetToken(adminUser.id, {
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: expiryTime,
      });

      // Send reset email
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/password-reset-confirm?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;
      await emailService.sendPasswordResetEmail(normalizedEmail, resetLink);

      console.log(`✓ Password reset link sent to school admin: ${normalizedEmail}`);
      return {
        message: 'Password reset link sent to your email',
        expiresIn: 3600, // 1 hour in seconds
      };
    }

    // Try to find super admin user
    let superAdminUser = await this.repository.findUserByEmail(normalizedEmail);
    
    if (superAdminUser) {
      // Generate password reset token (valid for 1 hour)
      const resetToken = JwtHelper.generateResetToken({ userId: superAdminUser.id, email: normalizedEmail });
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 1);

      // Store reset token in database
      await this.repository.updateUserResetToken(superAdminUser.id, {
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: expiryTime,
      });

      // Send reset email
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/password-reset-confirm?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;
      await emailService.sendPasswordResetEmail(normalizedEmail, resetLink);

      console.log(`✓ Password reset link sent to super admin: ${normalizedEmail}`);
      return {
        message: 'Password reset link sent to your email',
        expiresIn: 3600, // 1 hour in seconds
      };
    }

    // Don't reveal if email exists or not (security best practice)
    console.log(`⚠️ Password reset requested for non-existent email: ${normalizedEmail}`);
    return {
      message: 'If an account exists with this email, you will receive a password reset link',
      expiresIn: 3600,
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(email: string, token: string, newPassword: string) {
    const normalizedEmail = EmailValidator.normalizeEmail(email);

    // Validate password
    if (!newPassword || newPassword.length < 8) {
      throw new ConflictException('Password must be at least 8 characters long', 'INVALID_PASSWORD');
    }

    // Try to find admin user first
    let adminUser = await this.repository.findAdminUserByEmail(normalizedEmail);
    
    if (adminUser) {
      // Verify token exists, matches, and hasn't expired
      if (!adminUser.passwordResetToken || adminUser.passwordResetToken !== token) {
        throw new ConflictException('Invalid or expired reset token', 'INVALID_TOKEN');
      }

      if (!adminUser.passwordResetTokenExpiry || adminUser.passwordResetTokenExpiry < new Date()) {
        throw new ConflictException('Password reset token has expired. Please request a new one.', 'TOKEN_EXPIRED');
      }

      // Hash new password and update
      const passwordHash = await PasswordHelper.hashPassword(newPassword);
      
      await this.repository.updateAdminPassword(adminUser.id, {
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      });

      console.log(`✓ Password reset successful for school admin: ${normalizedEmail}`);
      return {
        message: 'Password reset successful. Please login with your new password.',
      };
    }

    // Try to find super admin user
    let superAdminUser = await this.repository.findUserByEmail(normalizedEmail);
    
    if (superAdminUser) {
      // Verify token exists, matches, and hasn't expired
      if (!superAdminUser.passwordResetToken || superAdminUser.passwordResetToken !== token) {
        throw new ConflictException('Invalid or expired reset token', 'INVALID_TOKEN');
      }

      if (!superAdminUser.passwordResetTokenExpiry || superAdminUser.passwordResetTokenExpiry < new Date()) {
        throw new ConflictException('Password reset token has expired. Please request a new one.', 'TOKEN_EXPIRED');
      }

      // Hash new password and update
      const passwordHash = await PasswordHelper.hashPassword(newPassword);
      
      await this.repository.updateUserPassword(superAdminUser.id, {
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      });

      console.log(`✓ Password reset successful for super admin: ${normalizedEmail}`);
      return {
        message: 'Password reset successful. Please login with your new password.',
      };
    }

    throw new NotFoundException('No account found with this email');
  }

  /**
   * Create admin user after school approval
   */
  async createAdminUser(schoolId: string, data: {
    email: string;
    fullName?: string;
    phone?: string;
  }) {
    const school = await this.repository.findSchoolById(schoolId);
    if (!school) {
      throw new NotFoundException('School not found');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(2, 10);
    const hashedPassword = await PasswordHelper.hashPassword(tempPassword);

    const adminUser = await this.repository.createAdminUser({
      schoolId: school.id,
      email: EmailValidator.normalizeEmail(data.email),
      passwordHash: hashedPassword,
      fullName: data.fullName,
      phone: data.phone ? PhoneValidator.formatNigeria(data.phone) : null,
      role: 'ADMIN',
      status: 'ACTIVE',
      firstLogin: true,
    });

    return {
      userId: adminUser.id,
      email: adminUser.email,
      tempPassword,
    };
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    const normalizedEmail = EmailValidator.normalizeEmail(email);

    console.log('🔐 Login attempt:', { email, normalizedEmail });

    // Check both system users and school admins
    const user = await this.repository.findUserByEmail(normalizedEmail);
    if (!user) {
      console.error('❌ User not found for email:', normalizedEmail);
      throw new ConflictException('This email is not registered. Please create an account first.', 'USER_NOT_FOUND');
    }

    console.log('✓ User found:', { 
      id: user.id, 
      email: user.email,
      role: user.role,
      userType: (user as any).userType,
      status: user.status,
      hasPasswordHash: !!user.passwordHash
    });

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      console.error('❌ User account not active:', { email: user.email, status: user.status });
      throw new ConflictException('User account is not active. Contact support.', 'ACCOUNT_INACTIVE');
    }

    // Verify password
    console.log('🔒 Verifying password...');
    const isPasswordValid = await PasswordHelper.comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      console.error('❌ Password mismatch for email:', normalizedEmail);
      throw new ConflictException('Incorrect password. Please try again.', 'INVALID_PASSWORD');
    }

    console.log('✓ Password verified for email:', normalizedEmail);

    // Handle system users (super-admin, etc.)
    if ((user as any).userType === 'system') {
      console.log('✓ System user found:', user.email, 'Role:', user.role);

      const token = JwtHelper.generateToken({
        id: user.id,
        schoolId: '' as any,
        email: user.email,
        role: user.role,
      });

      const refreshToken = JwtHelper.generateRefreshToken({
        id: user.id,
        schoolId: '' as any,
        email: user.email,
        role: user.role,
      });

      await this.repository.updateSystemUser(user.id, {
        lastLoginAt: new Date(),
        firstLogin: false,
      });

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          schoolId: null,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        school: null,
      };
    }

    // Handle school admin users
    const adminUser = user as any;
    const school = await this.repository.findSchoolById(adminUser.schoolId);
    if (!school) {
      console.error('❌ School not found for admin user:', adminUser.schoolId);
      throw new NotFoundException('School not found');
    }

    console.log('✓ School found:', { 
      id: school.id, 
      name: school.name,
      status: school.status,
      docsSubmitted: !!school.documentVerificationSubmittedAt
    });

    // Check if PENDING_VERIFICATION but with submitted documents = awaiting admin approval
    const documentsSubmitted = !!school.documentVerificationSubmittedAt;

    if (school.status === 'PENDING_VERIFICATION' && !documentsSubmitted) {
      console.warn('⚠️ School status PENDING_VERIFICATION (email not verified):', normalizedEmail);
      throw new ConflictException('Please verify your email first before logging in.', 'EMAIL_NOT_VERIFIED');
    }

    if (school.status === 'PENDING_VERIFICATION' && documentsSubmitted) {
      // Documents submitted, awaiting admin approval
      const token = JwtHelper.generateToken({
        id: adminUser.id,
        schoolId: adminUser.schoolId,
        email: adminUser.email,
        role: adminUser.role,
      });

      const refreshToken = JwtHelper.generateRefreshToken({
        id: adminUser.id,
        schoolId: adminUser.schoolId,
        email: adminUser.email,
        role: adminUser.role,
      });

      await this.repository.updateAdminUser(adminUser.id, {
        lastLoginAt: new Date(),
        firstLogin: false,
      });

      return {
        token,
        refreshToken,
        user: {
          id: adminUser.id,
          schoolId: adminUser.schoolId,
          email: adminUser.email,
          fullName: adminUser.fullName,
          role: adminUser.role,
          requiresVerification: false,
          documentsSubmitted: true,
          awaitingApproval: true,
        },
        school: {
          id: school.id,
          name: school.name,
          slug: school.slug,
          onboardingStatus: school.onboardingStatus,
          status: school.status,
        },
      };
    }

    if (school.status === 'AWAITING_VERIFICATION_DOCS') {
      // Allow login but flag that they need to submit verification documents
      const token = JwtHelper.generateToken({
        id: adminUser.id,
        schoolId: adminUser.schoolId,
        email: adminUser.email,
        role: adminUser.role,
      });

      const refreshToken = JwtHelper.generateRefreshToken({
        id: adminUser.id,
        schoolId: adminUser.schoolId,
        email: adminUser.email,
        role: adminUser.role,
      });

      await this.repository.updateAdminUser(adminUser.id, {
        lastLoginAt: new Date(),
        firstLogin: false,
      });

      return {
        token,
        refreshToken,
        user: {
          id: adminUser.id,
          schoolId: adminUser.schoolId,
          email: adminUser.email,
          fullName: adminUser.fullName,
          role: adminUser.role,
          requiresVerification: true,
          documentsSubmitted: false,
        },
        school: {
          id: school.id,
          name: school.name,
          slug: school.slug,
          onboardingStatus: school.onboardingStatus,
          status: school.status,
        },
      };
    }

    if (school.status === 'SUSPENDED') {
      throw new ConflictException('School account is suspended. Contact support.', 'SCHOOL_SUSPENDED');
    }

    if (school.status === 'REJECTED') {
      console.error('❌ Login rejected - School status is REJECTED:', { schoolId: school.id, schoolName: school.name });
      throw new ConflictException(
        'Your school application has been rejected. Please contact support for more information.',
        'SCHOOL_REJECTED'
      );
    }

    // Generate tokens for approved schools
    const token = JwtHelper.generateToken({
      id: adminUser.id,
      schoolId: adminUser.schoolId,
      email: adminUser.email,
      role: adminUser.role,
    });

    const refreshToken = JwtHelper.generateRefreshToken({
      id: adminUser.id,
      schoolId: adminUser.schoolId,
      email: adminUser.email,
      role: adminUser.role,
    });

    // Update last login
    await this.repository.updateAdminUser(adminUser.id, {
      lastLoginAt: new Date(),
      firstLogin: false,
    });

    return {
      token,
      refreshToken,
      user: {
        id: adminUser.id,
        schoolId: adminUser.schoolId,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
      },
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        onboardingStatus: school.onboardingStatus,
        status: school.status,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = JwtHelper.verifyRefreshToken(refreshToken);

      const adminUser = await this.repository.findAdminUserById(decoded.id);
      if (!adminUser || adminUser.status !== 'ACTIVE') {
        throw new NotFoundException('User not found');
      }

      const newToken = JwtHelper.generateToken({
        id: adminUser.id,
        schoolId: adminUser.schoolId,
        email: adminUser.email,
        role: adminUser.role,
      });

      return {
        token: newToken,
      };
    } catch (error: any) {
      throw new ConflictException('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Submit school verification documents
   */
  async submitVerificationDocuments(schoolId: string, data: {
    documentType: 'CAC' | 'UTILITY_BILL' | 'OTHER';
    documentUrl: string;
  }) {
    const school = await this.repository.findSchoolById(schoolId);
    if (!school) {
      throw new NotFoundException('School not found');
    }

    if (school.status !== 'AWAITING_VERIFICATION_DOCS') {
      throw new ConflictException(
        'School is not awaiting verification documents. Current status: ' + school.status,
        'INVALID_STATUS'
      );
    }

    // Update school with verification document info
    await this.repository.updateSchool(schoolId, {
      documentVerificationType: data.documentType,
      documentVerificationUrl: data.documentUrl,
      documentVerificationSubmittedAt: new Date(),
      status: 'PENDING_VERIFICATION', // Move to pending while admin reviews
    });

    // Send notification email to Results Pro team
    try {
      await emailService.sendVerificationDocumentsNotification(
        school.name,
        school.contactEmail,
        data.documentType,
        data.documentUrl
      );
      console.log(`✓ Verification notification email sent for school: ${school.name}`);
    } catch (emailError) {
      console.error(`✗ Failed to send verification notification email:`, emailError);
      // Don't throw - the submission was successful, just email failed
    }

    return {
      message: 'Verification documents submitted successfully',
      nextStep: 'wait_for_approval',
      expectedWaitTime: '60 minutes',
    };
  }

  /**
   * Get school approval status
   */
  async getSchoolStatus(schoolId: string) {
    const school = await this.repository.findSchoolById(schoolId);
    if (!school) {
      throw new NotFoundException('School not found');
    }

    return {
      status: school.status,
      schoolName: school.name,
      isApproved: school.status === 'APPROVED',
    };
  }
}

export const authService = new AuthService();
