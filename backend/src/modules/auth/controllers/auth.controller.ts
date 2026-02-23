import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { S3Upload } from '../utils/s3-upload';
import { RegisterDTO } from '../dtos/register.dto';
import { VerifyEmailDTO } from '../dtos/verify-email.dto';
import { LoginDTO } from '../dtos/login.dto';
import { ResendOtpDTO } from '../dtos/resend-otp.dto';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new school
   */
  static async register(req: Request, res: Response) {
    try {
      const dto: RegisterDTO = req.body;

      // Validate required fields
      if (!dto.schoolName || !dto.email || !dto.phone || !dto.fullAddress || !dto.state || !dto.password) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await authService.register(dto);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Registration error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        stack: error.stack?.split('\n')[0]
      });
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Registration failed. Please try again.',
        code: error.code || 'REGISTRATION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * POST /api/auth/verify-email
   * Verify email with OTP
   */
  static async verifyEmail(req: Request, res: Response) {
    try {
      const dto: VerifyEmailDTO = req.body;

      if (!dto.email || !dto.otp) {
        return res.status(400).json({
          success: false,
          error: 'Email and OTP are required',
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await authService.verifyEmail(dto.email, dto.otp);

      res.json({
        success: true,
        message: 'Email verified successfully. Your school is pending admin approval.',
        data: result,
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Email verification failed',
        code: error.code || 'VERIFICATION_ERROR',
      });
    }
  }

  /**
   * POST /api/auth/resend-verification
   * Resend verification OTP
   */
  static async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await authService.resendOtp(email);

      res.json({
        success: true,
        message: 'Verification code sent to your email',
        data: result,
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to resend verification code',
        code: error.code || 'RESEND_ERROR',
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  static async login(req: Request, res: Response) {
    try {
      const dto: LoginDTO = req.body;

      if (!dto.email || !dto.password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await authService.login(dto.email, dto.password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      // Detailed error logging for debugging
      console.error('❌ Login Error Details:', {
        email: req.body.email,
        message: error.message,
        code: error.code,
        status: error.status,
        errorName: error.name,
        originalMessage: error.original?.message,
        stack: error.stack?.split('\n').slice(0, 2).join('\n')
      });

      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Login failed. Please try again.',
        code: error.code || 'LOGIN_ERROR',
      });
    }
  }

  /**
   * POST /api/auth/refresh-token
   * Refresh access token using refresh token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required',
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Email verification failed',
        code: error.code || 'VERIFICATION_ERROR',
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Logout (client-side mainly, server-side can invalidate tokens)
   */
  static async logout(req: Request, res: Response) {
    try {
      // In a real application, you'd invalidate the token here
      // For now, we'll just return success

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/auth/upload-document
   * Upload verification document to S3
   */
  static async uploadDocument(req: Request, res: Response) {
    try {
      const { schoolId, documentType } = req.body;
      const file = (req as any).file;

      if (!schoolId || !documentType || !file) {
        return res.status(400).json({
          success: false,
          message: 'School ID, document type, and file are required',
          code: 'VALIDATION_ERROR',
        });
      }

      // Upload to S3
      const documentUrl = await S3Upload.uploadFile(file, schoolId, documentType);

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          documentUrl,
          fileName: file.originalname,
          fileSize: file.size,
        },
      });
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to upload document',
        code: error.code || 'UPLOAD_ERROR',
      });
    }
  }

  /**
   * POST /api/auth/submit-verification-documents
   * Submit school verification documents
   */
  static async submitVerificationDocuments(req: Request, res: Response) {
    try {
      const { schoolId } = req.body;
      const { documentType, documentUrl } = req.body;

      if (!schoolId || !documentType || !documentUrl) {
        return res.status(400).json({
          success: false,
          message: 'School ID, document type, and document URL are required',
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await authService.submitVerificationDocuments(schoolId, {
        documentType: documentType as 'CAC' | 'UTILITY_BILL' | 'OTHER',
        documentUrl,
      });

      res.json({
        success: true,
        message: result.message,
        data: {
          nextStep: result.nextStep,
          expectedWaitTime: result.expectedWaitTime,
        },
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to submit verification documents',
        code: error.code || 'SUBMISSION_ERROR',
      });
    }
  }

  /**
   * GET /api/auth/school-status/:schoolId
   * Get school approval status
   */
  static async getSchoolStatus(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: 'School ID is required',
          code: 'VALIDATION_ERROR',
        });
      }

      const result = await authService.getSchoolStatus(schoolId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to get school status',
        code: error.code || 'STATUS_ERROR',
      });
    }
  }
}
