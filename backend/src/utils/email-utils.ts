import * as crypto from 'crypto';
import { prisma } from '../config/database';
import { generateUnsubscribeLink } from './aws-config';

/**
 * Generate a unique unsubscribe token
 */
export const generateUnsubscribeToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a new email subscriber
 */
export const createSubscriber = async (email: string, name?: string, source: string = 'MANUAL') => {
  const unsubscribeToken = generateUnsubscribeToken();

  const subscriber = await prisma.emailSubscriber.create({
    data: {
      email,
      name,
      unsubscribeToken,
      source,
    },
  });

  return subscriber;
};

/**
 * Get subscriber by email
 */
export const getSubscriberByEmail = async (email: string) => {
  return prisma.emailSubscriber.findUnique({
    where: { email },
  });
};

/**
 * Get subscriber by ID
 */
export const getSubscriberById = async (id: string) => {
  return prisma.emailSubscriber.findUnique({
    where: { id },
  });
};

/**
 * Get subscriber by unsubscribe token
 */
export const getSubscriberByToken = async (token: string) => {
  return prisma.emailSubscriber.findUnique({
    where: { unsubscribeToken: token },
  });
};

/**
 * Deactivate subscriber (unsubscribe)
 */
export const unsubscribeSubscriber = async (subscriberId: string, reason?: string) => {
  const subscriber = await prisma.emailSubscriber.update({
    where: { id: subscriberId },
    data: {
      isActive: false,
      status: 'INACTIVE',
      unsubscribedAt: new Date(),
    },
  });

  // Create unsubscribe token record for GDPR compliance
  await prisma.unsubscribeToken.create({
    data: {
      subscriberId,
      reason: reason || 'USER_REQUEST',
      usedAt: new Date(),
      isValid: true,
    },
  });

  return subscriber;
};

/**
 * Activate/reactivate subscriber
 */
export const reactivateSubscriber = async (subscriberId: string) => {
  return prisma.emailSubscriber.update({
    where: { id: subscriberId },
    data: {
      isActive: true,
      status: 'ACTIVE',
      unsubscribedAt: null,
    },
  });
};

/**
 * Get all active subscribers
 */
export const getActiveSubscribers = async () => {
  return prisma.emailSubscriber.findMany({
    where: {
      isActive: true,
      status: 'ACTIVE',
    },
  });
};

/**
 * Create email campaign
 */
export const createCampaign = async (
  name: string,
  subject: string,
  body: string,
  htmlBody?: string,
  templateId?: string
) => {
  const campaign = await prisma.emailCampaign.create({
    data: {
      name,
      subject,
      body,
      htmlBody,
      templateId,
      status: 'DRAFT',
    },
  });

  return campaign;
};

/**
 * Get campaign by ID
 */
export const getCampaignById = async (id: string) => {
  return prisma.emailCampaign.findUnique({
    where: { id },
    include: {
      sends: {
        select: {
          id: true,
          status: true,
          sentAt: true,
          openedAt: true,
          subscriber: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Update campaign status
 */
export const updateCampaignStatus = async (
  campaignId: string,
  status: string,
  additionalData?: Record<string, any>
) => {
  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status,
      ...additionalData,
    },
  });
};

/**
 * Record campaign send attempt
 */
export const recordCampaignSend = async (
  campaignId: string,
  subscriberId: string,
  sesMessageId?: string,
  status: string = 'SENT'
) => {
  const send = await prisma.campaignSend.create({
    data: {
      campaignId,
      subscriberId,
      sesMessageId,
      status,
      sentAt: new Date(),
    },
  });

  // Update campaign sent count
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      sentCount: {
        increment: 1,
      },
    },
  });

  return send;
};

/**
 * Update campaign send status
 */
export const updateCampaignSendStatus = async (
  campaignSendId: string,
  status: string,
  additionalData?: Record<string, any>
) => {
  return prisma.campaignSend.update({
    where: { id: campaignSendId },
    data: {
      status,
      ...additionalData,
    },
  });
};

/**
 * Log email metadata (from S3 inbox)
 */
export const logEmailMetadata = async (
  s3Key: string,
  s3Bucket: string,
  subject: string,
  fromEmail: string,
  toEmail: string,
  received?: Date,
  bodyPreview?: string,
  hasAttachments: boolean = false,
  attachmentCount: number = 0
) => {
  return prisma.emailMetadata.create({
    data: {
      s3Key,
      s3Bucket,
      subject,
      fromEmail,
      toEmail,
      received,
      bodyPreview,
      hasAttachments,
      attachmentCount,
      readStatus: 'UNREAD',
      archivedStatus: 'NOT_ARCHIVED',
    },
  });
};

/**
 * Mark email as read
 */
export const markEmailAsRead = async (emailMetadataId: string) => {
  return prisma.emailMetadata.update({
    where: { id: emailMetadataId },
    data: {
      readStatus: 'READ',
      readAt: new Date(),
    },
  });
};

/**
 * Archive email
 */
export const archiveEmail = async (emailMetadataId: string) => {
  return prisma.emailMetadata.update({
    where: { id: emailMetadataId },
    data: {
      archivedStatus: 'ARCHIVED',
      archivedAt: new Date(),
    },
  });
};

/**
 * Get email metadata by S3 key
 */
export const getEmailMetadataByS3Key = async (s3Key: string) => {
  return prisma.emailMetadata.findUnique({
    where: { s3Key },
  });
};

/**
 * Create email template
 */
export const createEmailTemplate = async (
  name: string,
  subject: string,
  body: string,
  htmlBody?: string,
  variables?: string[],
  category?: string
) => {
  return prisma.emailTemplate.create({
    data: {
      name,
      subject,
      body,
      htmlBody,
      variables: JSON.stringify(variables || []),
      category,
      isActive: true,
    },
  });
};

/**
 * Get email template by name
 */
export const getEmailTemplateByName = async (name: string) => {
  return prisma.emailTemplate.findUnique({
    where: { name },
  });
};

/**
 * Get all active email templates
 */
export const getActiveEmailTemplates = async () => {
  return prisma.emailTemplate.findMany({
    where: { isActive: true },
  });
};

/**
 * Format email HTML with unsubscribe link and basic styling
 */
export const formatEmailHtml = (
  subject: string,
  body: string,
  unsubscribeToken: string,
  companyName: string = 'ResultsPRO'
): string => {
  const unsubscribeLink = generateUnsubscribeLink(unsubscribeToken);

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
      .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
      .footer a { color: #667eea; text-decoration: none; }
      .unsubscribe-section { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${companyName}</h1>
      </div>
      <div class="content">
        ${body}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <div class="unsubscribe-section">
          <p>You received this email because you're subscribed to our mailing list.</p>
          <p><a href="${unsubscribeLink}">Unsubscribe from this mailing list</a></p>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim();
};

/**
 * Parse subscriber list from CSV content
 */
export const parseSubscribersCsv = (csvContent: string): Array<{ email: string; name?: string }> => {
  const lines = csvContent.trim().split('\n');
  const subscribers: Array<{ email: string; name?: string }> = [];

  // Skip header if present (email, name)
  const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    const email = parts[0]?.trim();
    const name = parts[1]?.trim();

    if (email && email.includes('@')) {
      subscribers.push({ email, name: name || undefined });
    }
  }

  return subscribers;
};

/**
 * Parse email content using mailparser
 */
export const parseEmail = async (emailContent: string): Promise<any> => {
  try {
    // Dynamically import mailparser to avoid bundling issues
    const { simpleParser } = await import('mailparser');
    
    const parsed = await simpleParser(emailContent);
    
    return {
      subject: parsed.subject || 'No Subject',
      text: parsed.text || '',
      html: parsed.html || '',
      from: parsed.from?.text || 'Unknown',
      to: parsed.to?.text || 'Unknown',
      date: parsed.date || new Date(),
      attachments: parsed.attachments?.length || 0,
      headers: {
        messageId: parsed.messageId,
        inReplyTo: parsed.inReplyTo,
        references: parsed.references,
      },
    };
  } catch (error) {
    console.error('Error parsing email:', error);
    throw error;
  }
};

/**
 * Send email campaign to subscribers via SES
 */
export const sendEmailCampaign = async (
  campaignId: string,
  subscribers: Array<{ id: string; email: string; name?: string }>,
  subject: string,
  body: string,
  htmlBody?: string
): Promise<{ sent: number; failed: number; errors: Array<{ email: string; error: string }> }> => {
  const { SendEmailCommand } = await import('@aws-sdk/client-ses');
  const { sesClient, AWS_SES_FROM_EMAIL } = await import('./aws-config');
  const { generateUnsubscribeLink } = await import('./aws-config');

  let sent = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  const rateLimitMs = 100;

  for (let i = 0; i < subscribers.length; i++) {
    const subscriber = subscribers[i];

    try {
      // Generate unsubscribe token
      const unsubscribeToken = generateUnsubscribeToken();
      const unsubscribeLink = generateUnsubscribeLink(unsubscribeToken);

      // Create unsubscribe token in database
      await prisma.unsubscribeToken.create({
        data: {
          token: unsubscribeToken,
          subscriberId: subscriber.id,
          isValid: true,
        },
      });

      // Replace variables
      let emailBody = body
        .replace('{{unsubscribe_link}}', unsubscribeLink)
        .replace('{{subscriber_name}}', subscriber.name || subscriber.email)
        .replace('{{subscriber_email}}', subscriber.email);

      let emailHtml = htmlBody
        ? htmlBody
            .replace('{{unsubscribe_link}}', unsubscribeLink)
            .replace('{{subscriber_name}}', subscriber.name || subscriber.email)
            .replace('{{subscriber_email}}', subscriber.email)
        : undefined;

      // Send via SES
      const sendCommand = new SendEmailCommand({
        Source: AWS_SES_FROM_EMAIL,
        Destination: { ToAddresses: [subscriber.email] },
        Message: {
          Subject: { Data: subject },
          Body: {
            Text: { Data: emailBody },
            Html: emailHtml ? { Data: emailHtml } : undefined,
          },
        },
      });

      const result = await sesClient.send(sendCommand);

      // Record successful send
      await recordCampaignSend(campaignId, subscriber.id, result.MessageId, 'SENT');
      sent++;

      // Rate limiting
      if (i < subscribers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, rateLimitMs));
      }
    } catch (error: any) {
      failed++;
      errors.push({ email: subscriber.email, error: error.message });

      // Record failed send
      try {
        await recordCampaignSend(campaignId, subscriber.id, undefined, 'FAILED');
      } catch (recordError) {
        console.error('Error recording failed send:', recordError);
      }
    }
  }

  return { sent, failed, errors };
};

/**
 * Get inbox emails from S3
 */
export const getInboxEmails = async (limit: number = 20, offset: number = 0): Promise<any[]> => {
  const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
  const { s3Client, AWS_S3_BUCKET } = await import('./aws-config');

  try {
    const command = new ListObjectsV2Command({
      Bucket: AWS_S3_BUCKET,
      MaxKeys: limit,
    });

    const response = await s3Client.send(command);
    const emailKeys = response.Contents?.map((item) => item.Key || '').filter(Boolean) || [];

    // Get metadata for each email
    const emails = await Promise.all(
      emailKeys.map(async (key) => {
        try {
          return await prisma.emailMetadata.findUnique({
            where: { s3Key: key },
          });
        } catch {
          return null;
        }
      })
    );

    return emails.filter(Boolean);
  } catch (error) {
    console.error('Error fetching inbox emails:', error);
    throw error;
  }
};

export default {
  generateUnsubscribeToken,
  createSubscriber,
  getSubscriberByEmail,
  getSubscriberById,
  getSubscriberByToken,
  unsubscribeSubscriber,
  reactivateSubscriber,
  getActiveSubscribers,
  createCampaign,
  getCampaignById,
  updateCampaignStatus,
  recordCampaignSend,
  updateCampaignSendStatus,
  logEmailMetadata,
  markEmailAsRead,
  archiveEmail,
  getEmailMetadataByS3Key,
  createEmailTemplate,
  getEmailTemplateByName,
  getActiveEmailTemplates,
  formatEmailHtml,
  parseSubscribersCsv,
  parseEmail,
  sendEmailCampaign,
  getInboxEmails,
};
