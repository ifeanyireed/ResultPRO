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
      ? `<img src="${this.logoUrl}" alt="Results Pro Logo" style="max-width: 50px; height: auto; margin-bottom: 12px; display: block;" />`
      : '';
  }

  private static getHeaderContent(title: string): string {
    return `
      <div style="margin-bottom: 8px;">
        ${this.getLogoHtml()}
        <h1 style="color: white; font-size: 28px; margin: 0 0 8px 0; font-weight: 600; letter-spacing: -0.5px;">Results Pro</h1>
      </div>
      <h2 style="color: #60a5fa; font-size: 16px; margin: 0 0 12px 0; font-weight: 500; letter-spacing: -0.3px;">Effortless results management</h2>
      <h3 style="color: #d1d5db; font-size: 18px; margin: 0; font-weight: 600; letter-spacing: -0.3px;">${title}</h3>
    `;
  }

  private static getTemplateContent(title: string, content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background: #000000; min-height: 100vh;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
        <!-- Dark Glass-morphism Card -->
        <div style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 30px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(199, 220, 255, 0.35) inset, 0 0 20px 0 rgba(198, 204, 255, 0.20) inset, 0 1px 22px 0 rgba(255, 255, 255, 0.10), 0 4px 4px 0 rgba(0, 0, 0, 0.05), 0 10px 10px 0 rgba(0, 0, 0, 0.10);">
            <!-- Header with Logo & Gradient Background -->
            <div style="position: relative; padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.07); background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(26, 26, 26, 0.4) 100%); overflow: hidden;">
                <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 64, 175, 0.05) 100%); pointer-events: none;"></div>
                <div style="position: relative; z-index: 1;">
                    ${this.getHeaderContent(title)}
                </div>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px; color: #e5e7eb; line-height: 1.6;">
                ${content}
            </div>

            <!-- Footer -->
            <div style="background: rgba(255, 255, 255, 0.01); padding: 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.07);">
                <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 12px;">
                    Results Pro - School Management System
                </p>
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
                    <a href="https://scholars.ng" style="color: #60a5fa; text-decoration: none; font-size: 12px; transition: color 0.2s;">Website</a>
                    <span style="color: rgba(255, 255, 255, 0.2);">•</span>
                    <a href="https://scholars.ng/support" style="color: #60a5fa; text-decoration: none; font-size: 12px; transition: color 0.2s;">Support</a>
                    <span style="color: rgba(255, 255, 255, 0.2);">•</span>
                    <a href="https://scholars.ng/contact" style="color: #60a5fa; text-decoration: none; font-size: 12px; transition: color 0.2s;">Contact</a>
                </div>
                <p style="margin: 0; color: #6b7280; font-size: 11px;">
                    © 2026 Results Pro. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  static generateVerificationEmail(otp: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #e5e7eb;">
            Thank you for registering with <strong style="color: #60a5fa;">Results Pro</strong>!
        </p>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #d1d5db;">
            Please use the verification code below to confirm your email address.
        </p>
        
        <!-- OTP Display -->
        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 64, 175, 0.2) 100%); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">
                Verification Code
            </p>
            <p style="margin: 0; color: #60a5fa; font-size: 48px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
            </p>
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 13px; color: #d1d5db;">
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
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #e5e7eb;">
            🎉 <strong>Great news!</strong> Your school account has been verified and approved.
        </p>
        
        <div style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #86efac;">
                ✓ Account Approved
            </p>
            <p style="margin: 0; font-size: 13px; color: #86efac;">
                <strong>School Name:</strong> ${schoolName}
            </p>
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #d1d5db;">
            You can now access your dashboard and set up your school profile, academic sessions, classes, and more.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 15px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); transition: transform 0.2s;">
                Access Dashboard →
            </a>
        </div>
        
        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            If you have any questions, please <a href="mailto:support@scholars.ng" style="color: #60a5fa; text-decoration: none;">contact our support team</a>.
        </p>
    `;
    return this.getTemplateContent('Account Approved! 🎉', content);
  }

  static generatePasswordResetEmail(resetLink: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #e5e7eb;">
            We received a request to reset your password for Results Pro.
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #d1d5db;">
            Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 15px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); transition: transform 0.2s;">
                Reset Password →
            </a>
        </div>
        
        <p style="margin: 0 0 15px 0; font-size: 13px; color: #9ca3af;">
            Or copy this link: <br>
            <code style="background: rgba(255, 255, 255, 0.05); padding: 8px 12px; border-radius: 6px; font-size: 11px; word-break: break-all; border: 1px solid rgba(255, 255, 255, 0.1);">${resetLink}</code>
        </p>
        
        <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0; font-size: 13px; color: #fca5a5;">
                <strong>⚠️ Security:</strong> If you didn't request this reset, please ignore this email or contact us immediately.
            </p>
        </div>
    `;
    return this.getTemplateContent('Reset Your Password', content);
  }

  static generateWelcomeEmail(schoolName: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #e5e7eb;">
            👋 Welcome to Results Pro!
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #d1d5db;">
            Your registration for <strong>${schoolName}</strong> has been submitted successfully. Our admin team will review your information and verify your school.
        </p>
        
        <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #60a5fa; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #60a5fa;">
                ℹ️ What happens next?
            </p>
            <ol style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 13px;">
                <li style="margin-bottom: 8px;">Our team will verify your school details and documents</li>
                <li style="margin-bottom: 8px;">You'll receive an approval email within 24-48 hours</li>
                <li>You can then log in to your dashboard and set up your school</li>
            </ol>
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #d1d5db;">
            In the meantime, you can explore our features and documentation at <a href="https://scholars.ng" style="color: #60a5fa; text-decoration: none;">scholars.ng</a>
        </p>
        
        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
            Questions? Check out our <a href="https://scholars.ng/help" style="color: #60a5fa; text-decoration: none;">Help Center</a> or <a href="https://scholars.ng/contact" style="color: #60a5fa; text-decoration: none;">contact support</a>.
        </p>
    `;
    return this.getTemplateContent('Welcome to Results Pro! 👋', content);
  }

  static generateSchoolApprovalEmail(email: string, adminName: string, tempPassword: string, loginUrl: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #e5e7eb;">
            👉 Hello <strong>${adminName}</strong>,
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #d1d5db;">
            🎉 Your school registration has been verified and approved by our admin team! You can now log in to your dashboard and begin setting up your school.
        </p>
        
        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 64, 175, 0.15) 100%); border-radius: 15px; padding: 20px; margin: 30px 0; border: 1px solid rgba(59, 130, 246, 0.3);">
            <p style="margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; color: #60a5fa; font-weight: 600; letter-spacing: 1px;">
                Your Login Credentials
            </p>
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 15px; margin-bottom: 10px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #9ca3af;">
                    <strong>Email:</strong>
                </p>
                <code style="background: rgba(255, 255, 255, 0.02); padding: 8px 12px; border-radius: 6px; font-size: 13px; word-break: break-all; display: block; border: 1px solid rgba(255, 255, 255, 0.1); color: #e5e7eb;">${email}</code>
            </div>
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 15px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #9ca3af;">
                    <strong>Temporary Password:</strong>
                </p>
                <code style="background: rgba(255, 255, 255, 0.02); padding: 8px 12px; border-radius: 6px; font-size: 13px; word-break: break-all; display: block; border: 1px solid rgba(255, 255, 255, 0.1); color: #e5e7eb;">${tempPassword}</code>
            </div>
        </div>
        
        <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #fbbf24; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0; font-size: 13px; color: #fcd34d;">
                <strong>⚠️ Important:</strong> Please change this password immediately after your first login for security.
            </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 15px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);">
                Login to Dashboard →
            </a>
        </div>
        
        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            If you have any questions, <a href="mailto:support@scholars.ng" style="color: #60a5fa; text-decoration: none;">contact our support team</a>.
        </p>
    `;
    return this.getTemplateContent('School Approved! 🎉', content);
  }

  static generateRejectionEmail(schoolName: string, reason: string): string {
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #e5e7eb;">
            Thank you for your interest in Results Pro.
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #d1d5db;">
            We have reviewed your school registration for <strong>${schoolName}</strong>.
        </p>
        
        <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #fca5a5; font-weight: 600; letter-spacing: 1px;">
                Review Status
            </p>
            <p style="margin: 0; font-size: 14px; color: #d1d5db; line-height: 1.6;">
                ${reason}
            </p>
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #d1d5db;">
            You are welcome to resubmit your application with updated information.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://scholars.ng/register" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 15px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);">
                Resubmit Application →
            </a>
        </div>
        
        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            If you believe this is in error, please <a href="mailto:support@scholars.ng" style="color: #60a5fa; text-decoration: none;">contact our support team</a>.
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
        <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #e5e7eb;">
            New Verification Documents Received 📄
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #d1d5db;">
            A school has submitted verification documents for review.
        </p>
        
        <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #60a5fa; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="margin: 0 0 12px 0; font-size: 13px;">
                <strong style="color: #d1d5db;">School Name:</strong>
                <span style="color: #9ca3af;">${schoolName}</span>
            </p>
            <p style="margin: 0 0 12px 0; font-size: 13px;">
                <strong style="color: #d1d5db;">Contact Email:</strong>
                <span style="color: #9ca3af;">${contactEmail}</span>
            </p>
            <p style="margin: 0 0 12px 0; font-size: 13px;">
                <strong style="color: #d1d5db;">Document Type:</strong>
                <span style="color: #9ca3af;">${documentTypeLabel}</span>
            </p>
            <p style="margin: 0; font-size: 13px;">
                <strong style="color: #d1d5db;">Submitted At:</strong>
                <span style="color: #9ca3af;">${new Date().toLocaleString()}</span>
            </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${documentUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 15px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);">
                Review Documents →
            </a>
        </div>
        
        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            Please review the submitted documents and take appropriate action to approve or request additional information.
        </p>
    `;
    return this.getTemplateContent('Verification Documents Received', content);
  }

  static generateAgentInvitationEmail(email: string, tempPassword: string, department?: string): string {
    const loginUrl = 'https://app.scholars.ng/auth/login';
    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #e5e7eb;">
            Welcome to <strong style="color: #60a5fa;">Results Pro</strong>!
        </p>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #d1d5db;">
            You have been invited to join our platform as an <strong>Agent</strong>${department ? ` in the <strong>${department}</strong> department` : ''}. We're excited to have you on board!
        </p>
        
        <!-- Login Credentials -->
        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 64, 175, 0.2) 100%); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 15px; padding: 24px; margin: 30px 0;">
            <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
                Your Login Credentials
            </p>
            <p style="margin: 0 0 12px 0; font-size: 13px;">
                <strong style="color: #d1d5db;">Email:</strong>
                <span style="color: #9ca3af; font-family: 'Courier New', monospace; word-break: break-all;">${email}</span>
            </p>
            <p style="margin: 0; font-size: 13px;">
                <strong style="color: #d1d5db;">Temporary Password:</strong>
                <span style="color: #9ca3af; font-family: 'Courier New', monospace;">${tempPassword}</span>
            </p>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 15px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);">
                Log In to Results Pro →
            </a>
        </div>
        
        <!-- Instructions -->
        <div style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid rgba(59, 130, 246, 0.5); border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 12px 0; color: #d1d5db; font-size: 13px; font-weight: 600;">
                📋 Next Steps
            </p>
            <ol style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 13px;">
                <li style="margin: 8px 0;">Visit the login page using the button above</li>
                <li style="margin: 8px 0;">Enter your email and the temporary password provided above</li>
                <li style="margin: 8px 0;">You'll be prompted to change your password on first login</li>
                <li style="margin: 8px 0;">Start managing your agent dashboard</li>
            </ol>
        </div>
        
        <p style="margin: 0 0 12px 0; color: #9ca3af; font-size: 12px;">
            💡 <strong>Tip:</strong> Keep your password secure and never share it with anyone.
        </p>
        
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            Questions? Contact our support team at <a href="mailto:support@resultspro.ng" style="color: #60a5fa; text-decoration: none;">support@resultspro.ng</a>
        </p>
    `;
    return this.getTemplateContent('Welcome to Results Pro', content);
  }
}
