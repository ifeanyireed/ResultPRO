/**
 * Professional Email Templates for Results Pro
 * Uses the same design language as the auth forms
 */

export class EmailTemplateService {
  private static logoUrl: string | null = null;

  // Set the logo URL from S3
  static setLogoUrl(url: string): void {
    this.logoUrl = url;
  }

  private static getLogoHtml(): string {
    return this.logoUrl 
      ? `<img src="${this.logoUrl}" alt="Results Pro Logo" style="max-width: 50px; height: auto; margin-bottom: 0;" />`
      : '<h1 style="color: #3b82f6; margin: 0;">Results Pro</h1>';
  }

  private static getTemplateContent(title: string, content: string, useGradient: boolean = false): string {
    const backgroundColor = useGradient ? '#f9fafb' : '#ffffff';
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); min-height: 100vh;">
    <div style="max-width: 600px; margin: 40px auto; background: ${backgroundColor}; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
            ${this.getLogoHtml()}
            <h1 style="color: white; font-size: 28px; margin: 20px 0 0 0; font-weight: 600; letter-spacing: -0.5px;">${title}</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; color: #1f2937; line-height: 1.6;">
            ${content}
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 12px;">
                Results Pro - School Management System
            </p>
            <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
                <a href="https://scholars.ng" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Website</a>
                <span style="color: #d1d5db;">•</span>
                <a href="https://scholars.ng/support" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Support</a>
                <span style="color: #d1d5db;">•</span>
                <a href="https://scholars.ng/contact" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Contact</a>
            </div>
            <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © 2026 Results Pro. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  static generateVerificationEmail(otp: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px;">
            Thank you for registering with <strong>Results Pro</strong>!
        </p>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280;">
            Please use the verification code below to confirm your email address.
        </p>
        
        <!-- OTP Display -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.8); font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">
                Verification Code
            </p>
            <p style="margin: 0; color: white; font-size: 48px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
            </p>
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 13px; color: #6b7280;">
            ⏱️ This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.
        </p>
        
        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            If you didn't request this verification, please ignore this email.
        </p>
    `;
    return this.getTemplateContent('Email Verification', content);
  }

  static generateApprovalEmail(schoolName: string, loginUrl: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px;">
            🎉 <strong>Great news!</strong> Your school account has been verified and approved.
        </p>
        
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #166534;">
                ✓ Account Approved
            </p>
            <p style="margin: 0; font-size: 13px; color: #15803d;">
                <strong>School Name:</strong> ${schoolName}
            </p>
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #1f2937;">
            You can now access your dashboard and set up your school profile, academic sessions, classes, and more.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2); transition: transform 0.2s;">
                Access Dashboard →
            </a>
        </div>
        
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
            If you have any questions, please <a href="mailto:support@scholars.ng" style="color: #3b82f6; text-decoration: none;">contact our support team</a>.
        </p>
    `;
    return this.getTemplateContent('Account Approved! 🎉', content);
  }

  static generatePasswordResetEmail(resetLink: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px;">
            We received a request to reset your password for Results Pro.
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280;">
            Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2); transition: transform 0.2s;">
                Reset Password →
            </a>
        </div>
        
        <p style="margin: 0 0 15px 0; font-size: 13px; color: #6b7280;">
            Or copy this link: <br>
            <code style="background: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-size: 11px; word-break: break-all;">${resetLink}</code>
        </p>
        
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; font-size: 13px; color: #7f1d1d;">
                <strong>⚠️ Security:</strong> If you didn't request this reset, please ignore this email or contact us immediately.
            </p>
        </div>
    `;
    return this.getTemplateContent('Reset Your Password', content);
  }

  static generateWelcomeEmail(schoolName: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px;">
            👋 Welcome to Results Pro!
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #1f2937;">
            Your registration for <strong>${schoolName}</strong> has been submitted successfully. Our admin team will review your information and verify your school.
        </p>
        
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e40af;">
                ℹ️ What happens next?
            </p>
            <ol style="margin: 0; padding-left: 20px; color: #1f2937; font-size: 13px;">
                <li style="margin-bottom: 8px;">Our team will verify your school details and documents</li>
                <li style="margin-bottom: 8px;">You'll receive an approval email within 24-48 hours</li>
                <li>You can then log in to your dashboard and set up your school</li>
            </ol>
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280;">
            In the meantime, you can explore our features and documentation at <a href="https://scholars.ng" style="color: #3b82f6; text-decoration: none;">scholars.ng</a>
        </p>
        
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
            Questions? Check out our <a href="https://scholars.ng/help" style="color: #3b82f6; text-decoration: none;">Help Center</a> or <a href="https://scholars.ng/contact" style="color: #3b82f6; text-decoration: none;">contact support</a>.
        </p>
    `;
    return this.getTemplateContent('Welcome to Results Pro! 👋', content);
  }

  static generateSchoolApprovalEmail(adminName: string, tempPassword: string, loginUrl: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px;">
            👉 Hello <strong>${adminName}</strong>,
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #1f2937;">
            🎉 Your school registration has been verified and approved by our admin team! You can now log in to your dashboard and begin setting up your school.
        </p>
        
        <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; color: #166534; font-weight: 600; letter-spacing: 1px;">
                Your Login Credentials
            </p>
            <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280;">
                    <strong>Email:</strong>
                </p>
                <code style="background: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-size: 13px; word-break: break-all;">${adminName}</code>
            </div>
            <div style="background: white; border-radius: 8px; padding: 15px;">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280;">
                    <strong>Temporary Password:</strong>
                </p>
                <code style="background: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-size: 13px; word-break: break-all;">${tempPassword}</code>
            </div>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
                <strong>⚠️ Important:</strong> Please change this password immediately after your first login for security.
            </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);">
                Login to Dashboard →
            </a>
        </div>
        
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
            If you have any questions, <a href="mailto:support@scholars.ng" style="color: #3b82f6; text-decoration: none;">contact our support team</a>.
        </p>
    `;
    return this.getTemplateContent('School Approved! 🎉', content);
  }

  static generateRejectionEmail(schoolName: string, reason: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px;">
            Thank you for your interest in Results Pro.
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #1f2937;">
            We have reviewed your school registration for <strong>${schoolName}</strong>.
        </p>
        
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #7f1d1d; font-weight: 600; letter-spacing: 1px;">
                Review Status
            </p>
            <p style="margin: 0; font-size: 14px; color: #1f2937; line-height: 1.6;">
                ${reason}
            </p>
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #1f2937;">
            You are welcome to resubmit your application with updated information.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://scholars.ng/register" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);">
                Resubmit Application →
            </a>
        </div>
        
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
            If you believe this is in error, please <a href="mailto:support@scholars.ng" style="color: #3b82f6; text-decoration: none;">contact our support team</a>.
        </p>
    `;
    return this.getTemplateContent('Registration Status Update', content);
  }

  static generateVerificationDocumentsNotification(
    schoolName: string,
    contactEmail: string,
    documentType: string,
    documentUrl: string
  ): string {
    const documentTypeLabel = documentType === 'CAC' ? 'Corporate Affairs Commission (CAC)' : 'Utility Bill';
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            New Verification Documents Received 📄
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280;">
            A school has submitted verification documents for review.
        </p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0 0 12px 0; font-size: 13px;">
                <strong style="color: #1f2937;">School Name:</strong>
                <span style="color: #374151;">${schoolName}</span>
            </p>
            <p style="margin: 0 0 12px 0; font-size: 13px;">
                <strong style="color: #1f2937;">Contact Email:</strong>
                <span style="color: #374151;">${contactEmail}</span>
            </p>
            <p style="margin: 0 0 12px 0; font-size: 13px;">
                <strong style="color: #1f2937;">Document Type:</strong>
                <span style="color: #374151;">${documentTypeLabel}</span>
            </p>
            <p style="margin: 0; font-size: 13px;">
                <strong style="color: #1f2937;">Submitted At:</strong>
                <span style="color: #374151;">${new Date().toLocaleString()}</span>
            </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${documentUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);">
                Review Documents →
            </a>
        </div>
        
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
            Please review the submitted documents and take appropriate action to approve or request additional information.
        </p>
    `;
    return this.getTemplateContent('Verification Documents Received', content);
  }
}
