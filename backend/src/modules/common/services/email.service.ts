import { sendMail } from '@config/mail';

export class EmailService {
  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    const subject = 'Results Pro - Email Verification';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Email Verification</h1>
        <p>Thank you for registering with Results Pro!</p>
        <p>Your verification code is:</p>
        <h2 style="color: #3b82f6; letter-spacing: 5px; font-size: 32px;">${otp}</h2>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Results Pro - School Management System
        </p>
      </div>
    `;

    await sendMail(email, subject, html);
  }

  async sendApprovalEmail(email: string, schoolName: string, loginUrl: string): Promise<void> {
    const subject = 'Results Pro - Your School Account is Approved!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #22c55e;">Account Approved! 🎉</h1>
        <p>Great news! Your school account has been verified and approved.</p>
        <p><strong>School Name:</strong> ${schoolName}</p>
        <p>You can now access your dashboard and set up your school profile, academic sessions, and more.</p>
        <p>
          <a href="${loginUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
            Go to Dashboard
          </a>
        </p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    await sendMail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const subject = 'Results Pro - Password Reset';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Reset Your Password</h1>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    await sendMail(email, subject, html);
  }

  async sendWelcomeEmail(email: string, schoolName: string): Promise<void> {
    const subject = 'Welcome to Results Pro!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Welcome to Results Pro! 👋</h1>
        <p>Hi,</p>
        <p>Your registration for <strong>${schoolName}</strong> has been submitted successfully.</p>
        <p>Our admin team will verify your information and you'll receive an approval email shortly.</p>
        <p>In the meantime, you can explore our features at <a href="https://scholars.ng">scholars.ng</a></p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Results Pro - School Management System
        </p>
      </div>
    `;

    await sendMail(email, subject, html);
  }

  async sendSchoolApprovalEmail(
    email: string,
    adminName: string,
    tempPassword: string
  ): Promise<void> {
    const subject = 'Results Pro - Your School Has Been Approved!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #22c55e;">School Approved! 🎉</h1>
        <p>Hello ${adminName},</p>
        <p>Your school registration has been verified and approved by our admin team!</p>
        <p>You can now log in to your dashboard and begin setting up your school.</p>
        <h3>Your Temporary Login Credentials:</h3>
        <p>
          <strong>Email:</strong> ${email}<br>
          <strong>Temporary Password:</strong> <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code>
        </p>
        <p style="color: #ef4444;">
          <strong>⚠️ Important:</strong> Please change this password immediately after your first login for security.
        </p>
        <p style="margin-top: 20px;">
          <a href="https://app.scholars.ng/school-admin/login" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Login to Dashboard
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          If you have any questions, please contact our support team at support@scholars.ng
        </p>
      </div>
    `;

    await sendMail(email, subject, html);
  }

  async sendSchoolRejectionEmail(email: string, schoolName: string, reason: string): Promise<void> {
    const subject = 'Results Pro - School Registration Update';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Registration Status Update</h1>
        <p>Hello,</p>
        <p>Thank you for your interest in Results Pro. We have reviewed your school registration for <strong>${schoolName}</strong>.</p>
        <h3>Reason for Review:</h3>
        <p>${reason}</p>
        <p>
          If you believe this is in error or have questions, please don't hesitate to contact our support team at 
          <a href="mailto:support@scholars.ng">support@scholars.ng</a>
        </p>
        <p>You are welcome to resubmit your application with updated information.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Results Pro - School Management System
        </p>
      </div>
    `;

    await sendMail(email, subject, html);
  }

  async sendVerificationDocumentsNotification(
    schoolName: string,
    contactEmail: string,
    documentType: string,
    documentUrl: string
  ): Promise<void> {
    const subject = `New Verification Documents Submitted - ${schoolName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">New Verification Documents Received</h1>
        <p>A school has submitted verification documents for review.</p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0;">
          <p><strong>School Name:</strong> ${schoolName}</p>
          <p><strong>Contact Email:</strong> ${contactEmail}</p>
          <p><strong>Document Type:</strong> ${documentType === 'CAC' ? 'Corporate Affairs Commission (CAC)' : 'Utility Bill'}</p>
          <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Document Link:</strong> <a href="${documentUrl}" style="color: #3b82f6; text-decoration: none;">${documentUrl}</a></p>
        </div>

        <p>Please review the submitted documents and take appropriate action.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Results Pro - School Verification System
        </p>
      </div>
    `;

    await sendMail('resultspro@scholars.ng', subject, html);
  }
}

export const emailService = new EmailService();
