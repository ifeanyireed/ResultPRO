import { sendMail } from '@config/mail';
import { EmailTemplateService } from './email-template.service';

export class EmailService {
  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    const subject = 'Results Pro - Email Verification';
    const html = EmailTemplateService.generateVerificationEmail(otp);
    await sendMail(email, subject, html);
  }

  async sendApprovalEmail(email: string, schoolName: string, loginUrl: string): Promise<void> {
    const subject = 'Results Pro - Your School Account is Approved!';
    const html = EmailTemplateService.generateApprovalEmail(schoolName, loginUrl);
    await sendMail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const subject = 'Results Pro - Password Reset';
    const html = EmailTemplateService.generatePasswordResetEmail(resetLink);
    await sendMail(email, subject, html);
  }

  async sendWelcomeEmail(email: string, schoolName: string): Promise<void> {
    const subject = 'Welcome to Results Pro!';
    const html = EmailTemplateService.generateWelcomeEmail(schoolName);
    await sendMail(email, subject, html);
  }

  async sendSchoolApprovalEmail(
    email: string,
    adminName: string,
    tempPassword: string
  ): Promise<void> {
    const subject = 'Results Pro - Your School Has Been Approved!';
    const loginUrl = 'https://app.scholars.ng/auth/login';
    const html = EmailTemplateService.generateSchoolApprovalEmail(email, adminName, tempPassword, loginUrl);
    await sendMail(email, subject, html);
  }

  async sendSchoolRejectionEmail(email: string, schoolName: string, reason: string): Promise<void> {
    const subject = 'Results Pro - School Registration Update';
    const html = EmailTemplateService.generateRejectionEmail(schoolName, reason);
    await sendMail(email, subject, html);
  }

  async sendVerificationDocumentsNotification(
    schoolName: string,
    contactEmail: string,
    documentType: string,
    documentUrl: string
  ): Promise<void> {
    const subject = `New Verification Documents Submitted - ${schoolName}`;
    const html = EmailTemplateService.generateVerificationDocumentsNotification(
      schoolName,
      contactEmail,
      documentType,
      documentUrl
    );
    await sendMail('resultspro@scholars.ng', subject, html);
  }
}

export const emailService = new EmailService();
