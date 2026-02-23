// @ts-ignore
import AWS from 'aws-sdk';
import { config } from './environment';

let ses: any;

/**
 * Initialize AWS SES for email sending
 * Requires AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in environment
 */
export function initializeSES() {
  ses = new AWS.SES({
    region: config.aws.region,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  });

  // Verify SES is configured
  console.log('✓ AWS SES initialized for region:', config.aws.region);
  return ses;
}

/**
 * Send email via AWS SES
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML email body
 * @param text - Plain text email body (optional)
 */
export async function sendMailViaSES(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<any> {
  try {
    if (!ses) {
      initializeSES();
    }

    const params: AWS.SES.SendEmailRequest = {
      Source: `${config.mail.from.name} <${config.mail.from.email}>`,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
          Text: {
            Data: text || html.replace(/<[^>]*>/g, ''),
            Charset: 'UTF-8',
          },
        },
      },
    };

    const result = await ses.sendEmail(params).promise();
    console.log('✓ Email sent via AWS SES - MessageId:', result.MessageId);
    return result;
  } catch (error: any) {
    console.error('✗ AWS SES Error:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });

    // Common SES errors
    if (error.code === 'MessageRejected') {
      console.error('  → Email was rejected. Check if sender email is verified.');
    } else if (error.code === 'ConfigurationSetDoesNotExist') {
      console.error('  → Configuration set not found.');
    } else if (error.code === 'InvalidParameterValue') {
      console.error('  → Invalid parameter. Check email format.');
    }

    throw error;
  }
}

/**
 * Get SES sending statistics
 * Useful for monitoring quota and bounce rates
 */
export async function getSESStatistics() {
  try {
    if (!ses) {
      initializeSES();
    }

    const result = await ses.getSendStatistics().promise();
    return result;
  } catch (error) {
    console.error('✗ Error getting SES statistics:', error);
    throw error;
  }
}

/**
 * Get SES send quota
 * Shows how many emails can be sent daily
 */
export async function getSESSendQuota() {
  try {
    if (!ses) {
      initializeSES();
    }

    const result = await ses.getSendQuota().promise();
    console.log('📊 SES Send Quota:', {
      max24HourSend: result.Max24HourSend,
      maxSendRate: result.MaxSendRate,
      sent24Hour: result.Sent24Hour,
      remaining: result.Max24HourSend! - result.Sent24Hour!,
    });
    return result;
  } catch (error) {
    console.error('✗ Error getting SES quota:', error);
    throw error;
  }
}

/**
 * List verified email addresses in SES
 */
export async function getVerifiedEmails() {
  try {
    if (!ses) {
      initializeSES();
    }

    const result = await ses.listVerifiedEmailAddresses().promise();
    console.log('📧 Verified Emails in SES:', result.VerifiedEmailAddresses);
    return result.VerifiedEmailAddresses || [];
  } catch (error) {
    console.error('✗ Error getting verified emails:', error);
    throw error;
  }
}

/**
 * Verify an email address in SES (for Sandbox mode)
 * Production mode doesn't need this for sending to any recipient
 */
export async function verifyEmailInSES(email: string) {
  try {
    if (!ses) {
      initializeSES();
    }

    const result = await ses
      .verifyEmailIdentity({ EmailAddress: email })
      .promise();

    console.log('✓ Verification email sent to:', email);
    return result;
  } catch (error) {
    console.error('✗ Error verifying email:', error);
    throw error;
  }
}
