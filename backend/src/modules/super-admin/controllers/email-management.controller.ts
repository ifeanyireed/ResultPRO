import { Request, Response } from 'express';
import { prisma } from '@config/database';
import {
  sendEmailCampaign,
  getInboxEmails,
  parseEmail,
  createSubscriber,
  getSubscriberByEmail,
} from '../../../utils/email-utils';
import {
  s3Client,
  sesClient,
  AWS_S3_BUCKET,
  AWS_SES_FROM_EMAIL,
} from '../../../utils/aws-config';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

export class EmailManagementController {
  /**
   * Get all email campaigns
   */
  static async getCampaigns(req: Request, res: Response) {
    try {
      const { skip = 0, take = 20, status } = req.query;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [campaigns, total] = await Promise.all([
        prisma.emailCampaign.findMany({
          where,
          skip: parseInt(skip as string) || 0,
          take: parseInt(take as string) || 20,
          include: {
            sends: {
              select: {
                id: true,
                status: true,
                sentAt: true,
                subscriber: { select: { email: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.emailCampaign.count({ where }),
      ]);

      res.json({
        success: true,
        data: campaigns,
        pagination: {
          total,
          skip: parseInt(skip as string) || 0,
          take: parseInt(take as string) || 20,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get campaign details
   */
  static async getCampaignDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const campaign = await prisma.emailCampaign.findUnique({
        where: { id },
        include: {
          sends: {
            include: {
              subscriber: true,
            },
          },
        },
      });

      if (!campaign) {
        return res
          .status(404)
          .json({ success: false, error: 'Campaign not found' });
      }

      res.json({ success: true, data: campaign });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Create new email campaign
   */
  static async createCampaign(req: Request, res: Response) {
    try {
      const {
        name,
        subject,
        body,
        htmlBody,
        templateId,
        recipientSegment = 'ALL',
      } = req.body;

      if (!name || !subject || !body) {
        return res.status(400).json({
          success: false,
          error: 'name, subject, and body are required',
        });
      }

      const campaign = await prisma.emailCampaign.create({
        data: {
          name,
          subject,
          body,
          htmlBody,
          templateId: templateId || null,
          recipientSegment,
          status: 'DRAFT',
        },
      });

      res.status(201).json({ success: true, data: campaign });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Update campaign
   */
  static async updateCampaign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, subject, body, htmlBody, recipientSegment } = req.body;

      const campaign = await prisma.emailCampaign.findUnique({
        where: { id },
      });

      if (!campaign) {
        return res
          .status(404)
          .json({ success: false, error: 'Campaign not found' });
      }

      if (campaign.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          error: 'Only draft campaigns can be updated',
        });
      }

      const updated = await prisma.emailCampaign.update({
        where: { id },
        data: {
          name: name || campaign.name,
          subject: subject || campaign.subject,
          body: body || campaign.body,
          htmlBody: htmlBody || campaign.htmlBody,
          recipientSegment: recipientSegment || campaign.recipientSegment,
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete campaign
   */
  static async deleteCampaign(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const campaign = await prisma.emailCampaign.findUnique({
        where: { id },
      });

      if (!campaign) {
        return res
          .status(404)
          .json({ success: false, error: 'Campaign not found' });
      }

      if (campaign.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          error: 'Only draft campaigns can be deleted',
        });
      }

      await prisma.emailCampaign.delete({ where: { id } });

      res.json({ success: true, message: 'Campaign deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Send email campaign
   */
  static async sendCampaign(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const campaign = await prisma.emailCampaign.findUnique({
        where: { id },
      });

      if (!campaign) {
        return res
          .status(404)
          .json({ success: false, error: 'Campaign not found' });
      }

      if (campaign.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          error: 'Only draft campaigns can be sent',
        });
      }

      // Get subscribers
      const subscribers =
        campaign.recipientSegment === 'ALL'
          ? await prisma.emailSubscriber.findMany({
              where: { isActive: true },
            })
          : await prisma.emailSubscriber.findMany({
              where: { isActive: true, source: campaign.recipientSegment },
            });

      if (subscribers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No active subscribers to send to',
        });
      }

      // Update campaign status
      await prisma.emailCampaign.update({
        where: { id },
        data: { status: 'SENDING', sentAt: new Date() },
      });

      // Send emails asynchronously
      sendEmailsInBackground(campaign, subscribers).catch((err) => {
        console.error('Email sending error:', err);
      });

      res.json({
        success: true,
        message: `Campaign queued for sending to ${subscribers.length} subscribers`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get inbox emails from S3
   */
  static async getInbox(req: Request, res: Response) {
    try {
      const { skip = 0, take = 20 } = req.query;

      // List emails from S3
      const command = new ListObjectsV2Command({
        Bucket: AWS_S3_BUCKET,
        MaxKeys: parseInt(take as string) || 20,
        ContinuationToken:
          skip && parseInt(skip as string) > 0 ? (skip as string) : undefined,
      });

      const response = await s3Client.send(command);
      const emailKeys =
        response.Contents?.map((item) => item.Key || '').filter(Boolean) || [];

      // For each key, get metadata from database
      const emails = await Promise.all(
        emailKeys.map(async (key) => {
          const metadata = await prisma.emailMetadata.findUnique({
            where: { s3Key: key },
          });
          return metadata;
        })
      );

      res.json({
        success: true,
        data: emails.filter(Boolean),
        pagination: {
          total: response.KeyCount || 0,
          skip: parseInt(skip as string) || 0,
          take: parseInt(take as string) || 20,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Read specific email from S3
   */
  static async readEmail(req: Request, res: Response) {
    try {
      const { emailKey } = req.params;

      // Get email from S3
      const getCommand = new GetObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: emailKey,
      });

      const s3Object = await s3Client.send(getCommand);
      const emailContent = await s3Object.Body?.transformToString();

      if (!emailContent) {
        return res.status(404).json({ success: false, error: 'Email not found' });
      }

      // Parse email using mailparser
      const parsed = await parseEmail(emailContent);

      // Update read status in database
      await prisma.emailMetadata.updateMany({
        where: { s3Key: emailKey },
        data: { readStatus: true },
      });

      res.json({ success: true, data: parsed });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get subscribers
   */
  static async getSubscribers(req: Request, res: Response) {
    try {
      const { skip = 0, take = 20, status = 'all' } = req.query;

      const where: any = {};
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }

      const [subscribers, total] = await Promise.all([
        prisma.emailSubscriber.findMany({
          where,
          skip: parseInt(skip as string) || 0,
          take: parseInt(take as string) || 20,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.emailSubscriber.count({ where }),
      ]);

      res.json({
        success: true,
        data: subscribers,
        pagination: {
          total,
          skip: parseInt(skip as string) || 0,
          take: parseInt(take as string) || 20,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Add subscriber
   */
  static async addSubscriber(req: Request, res: Response) {
    try {
      const { email, name, source = 'MANUAL' } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
        });
      }

      // Check if subscriber already exists
      const existing = await getSubscriberByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Subscriber already exists',
        });
      }

      const subscriber = await createSubscriber(email, name, source);

      res.status(201).json({ success: true, data: subscriber });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Toggle subscriber status
   */
  static async toggleSubscriberStatus(req: Request, res: Response) {
    try {
      const { subscriberId } = req.params;

      const subscriber = await prisma.emailSubscriber.findUnique({
        where: { id: subscriberId },
      });

      if (!subscriber) {
        return res
          .status(404)
          .json({ success: false, error: 'Subscriber not found' });
      }

      const updated = await prisma.emailSubscriber.update({
        where: { id: subscriberId },
        data: { isActive: !subscriber.isActive },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete subscriber
   */
  static async deleteSubscriber(req: Request, res: Response) {
    try {
      const { subscriberId } = req.params;

      const subscriber = await prisma.emailSubscriber.findUnique({
        where: { id: subscriberId },
      });

      if (!subscriber) {
        return res
          .status(404)
          .json({ success: false, error: 'Subscriber not found' });
      }

      await prisma.emailSubscriber.delete({ where: { id: subscriberId } });

      res.json({ success: true, message: 'Subscriber deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Process unsubscribe
   */
  static async processUnsubscribe(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Unsubscribe token is required',
        });
      }

      const unsubscribeToken = await prisma.unsubscribeToken.findUnique({
        where: { token: token as string },
      });

      if (!unsubscribeToken || !unsubscribeToken.isValid) {
        return res.status(404).json({
          success: false,
          error: 'Invalid or expired unsubscribe token',
        });
      }

      // Mark token as used
      await prisma.unsubscribeToken.update({
        where: { id: unsubscribeToken.id },
        data: { isValid: false, usedAt: new Date() },
      });

      // Deactivate subscriber
      await prisma.emailSubscriber.update({
        where: { id: unsubscribeToken.subscriberId },
        data: { isActive: false },
      });

      res.json({ success: true, message: 'Successfully unsubscribed' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get email templates
   */
  static async getTemplates(req: Request, res: Response) {
    try {
      const templates = await prisma.emailTemplate.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Save email template
   */
  static async saveTemplate(req: Request, res: Response) {
    try {
      const { name, subject, body, htmlBody, category, variables } = req.body;

      if (!name || !subject || !body) {
        return res.status(400).json({
          success: false,
          error: 'name, subject, and body are required',
        });
      }

      const template = await prisma.emailTemplate.create({
        data: {
          name,
          subject,
          body,
          htmlBody,
          category,
          variables: JSON.stringify(variables || []),
        },
      });

      res.status(201).json({ success: true, data: template });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

/**
 * Send emails in background
 */
async function sendEmailsInBackground(
  campaign: any,
  subscribers: any[]
) {
  const rateLimitMs = 100; // 100ms between emails

  for (let i = 0; i < subscribers.length; i++) {
    const subscriber = subscribers[i];

    try {
      // Generate unsubscribe link
      const unsubscribeToken = await prisma.unsubscribeToken.create({
        data: { token: Math.random().toString(36), subscriberId: subscriber.id },
      });

      const unsubscribeLink = `${process.env.APP_URL}/api/super-admin/email/unsubscribe?token=${unsubscribeToken.token}`;

      // Replace variables in email body
      let emailBody = campaign.body.replace(
        '{{unsubscribe_link}}',
        unsubscribeLink
      );
      emailBody = emailBody.replace('{{subscriber_name}}', subscriber.name || subscriber.email);

      // Send email via SES
      const sendCommand = new SendEmailCommand({
        Source: AWS_SES_FROM_EMAIL,
        Destination: { ToAddresses: [subscriber.email] },
        Message: {
          Subject: { Data: campaign.subject },
          Body: {
            Html: campaign.htmlBody
              ? campaign.htmlBody.replace('{{unsubscribe_link}}', unsubscribeLink)
              : undefined,
            Text: { Data: emailBody },
          },
        },
      });

      const result = await sesClient.send(sendCommand);

      // Record send in database
      await prisma.campaignSend.create({
        data: {
          campaignId: campaign.id,
          subscriberId: subscriber.id,
          status: 'SENT',
          sentAt: new Date(),
          messageId: result.MessageId,
        },
      });

      // Rate limiting
      if (i < subscribers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, rateLimitMs));
      }
    } catch (error) {
      console.error(
        `Failed to send email to ${subscriber.email}:`,
        error
      );
      
      // Record failed send
      await prisma.campaignSend.create({
        data: {
          campaignId: campaign.id,
          subscriberId: subscriber.id,
          status: 'FAILED',
          sentAt: new Date(),
        },
      }).catch(() => {});
    }
  }

  // Update campaign status to SENT
  await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: { status: 'SENT' },
  });
}
