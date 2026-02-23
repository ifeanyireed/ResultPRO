import nodemailer from 'nodemailer';
import { config } from './environment';
import { sendMailViaSES } from './mail-ses';

let transporter: any;
let mailService: 'ses' | 'smtp' | 'test' = 'smtp';

const IS_TESTING = process.env.NODE_ENV === 'development' && 
                  (process.env.MAIL_TEST_MODE === 'true' || config.mail.user === 'your-email@gmail.com');

export function initializeMailer() {
  // Determine mail service based on configuration
  if (config.mail.service === 'aws-ses') {
    mailService = 'ses';
    console.log('📧 Email Service: AWS SES (production)');
    // SES is initialized lazily in mail-ses.ts
    return null;
  }

  // In testing mode with placeholder credentials, use a mock transporter
  if (IS_TESTING) {
    mailService = 'test';
    transporter = {
      sendMail: async (options: any) => {
        console.log('\n📧 [TEST MODE] Email would be sent:');
        console.log('   To:', options.to);
        console.log('   Subject:', options.subject);
        console.log('   From:', options.from);
        return { messageId: 'test-' + Date.now() };
      }
    };
    console.log('📧 Email Service: TEST MODE (console logging)');
    return transporter;
  }

  // Use SMTP (Gmail or other)
  mailService = 'smtp';
  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465, // true for 465, false for other ports like 587
    auth: {
      user: config.mail.user,
      pass: config.mail.password,
    },
    logger: true,
    debug: true,
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
  });
  console.log(`📧 Email Service: SMTP (${config.mail.host}:${config.mail.port})`);
  console.log(`📧 SMTP User: ${config.mail.user}`);

  return transporter;
}

export async function sendMail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    let result;

    if (mailService === 'ses') {
      // Send via AWS SES
      result = await sendMailViaSES(to, subject, html, text);
    } else {
      // Send via SMTP or test mode
      if (!transporter) {
        initializeMailer();
      }

      result = await transporter.sendMail({
        from: `${config.mail.from.name} <${config.mail.from.email}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      });

      if (mailService === 'test') {
        console.log('✓ [TEST MODE] Email logged (not actually sent)');
      } else {
        console.log('✓ Email sent successfully:', result.messageId);
      }
    }

    return result;
  } catch (error) {
    console.error('✗ Error sending email:', error);
    throw error;
  }
}

export function getMailer() {
  if (!transporter) {
    initializeMailer();
  }
  return transporter;
}
