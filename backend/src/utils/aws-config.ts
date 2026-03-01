import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';

dotenv.config();

export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
export const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'results-pro-email-inbox';
export const AWS_SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || 'noreply@resultspro.ng';

// Validate AWS credentials
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.warn('⚠️  AWS credentials not found in environment variables');
  console.warn('   Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to enable email features');
}

// Initialize S3 Client for inbox storage and retrieval
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize SES Client for email sending
export const sesClient = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Email configuration options
 */
export const emailConfig = {
  // Rate limiting: 100ms delay between email sends to avoid SES throttling
  rateLimitMs: process.env.EMAIL_RATE_LIMIT_MS ? parseInt(process.env.EMAIL_RATE_LIMIT_MS) : 100,
  
  // Maximum retry attempts for failed emails
  maxRetries: process.env.EMAIL_MAX_RETRIES ? parseInt(process.env.EMAIL_MAX_RETRIES) : 3,
  
  // Email sending timeout in milliseconds
  sendTimeoutMs: process.env.EMAIL_SEND_TIMEOUT_MS ? parseInt(process.env.EMAIL_SEND_TIMEOUT_MS) : 30000,
  
  // Batch size for processing emails
  batchSize: process.env.EMAIL_BATCH_SIZE ? parseInt(process.env.EMAIL_BATCH_SIZE) : 50,
  
  // SES Configuration Set for tracking (optional, set in .env)
  configurationSet: process.env.AWS_SES_CONFIGURATION_SET || undefined,
  
  // Default reply-to email
  replyToEmail: process.env.AWS_SES_REPLY_TO_EMAIL || 'support@resultspro.ng',
  
  // Unsubscribe URL template - use %TOKEN% placeholder
  unsubscribeUrlTemplate: process.env.UNSUBSCRIBE_URL_TEMPLATE || 'https://api.resultspro.ng/api/email/unsubscribe?token=%TOKEN%',
};

/**
 * Environment validation
 */
export const validateAwsConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!AWS_ACCESS_KEY_ID) {
    errors.push('AWS_ACCESS_KEY_ID is required');
  }
  if (!AWS_SECRET_ACCESS_KEY) {
    errors.push('AWS_SECRET_ACCESS_KEY is required');
  }
  if (!AWS_S3_BUCKET) {
    errors.push('AWS_S3_BUCKET is required');
  }
  if (!AWS_SES_FROM_EMAIL) {
    errors.push('AWS_SES_FROM_EMAIL is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Helper function to generate unsubscribe link
 */
export const generateUnsubscribeLink = (unsubscribeToken: string): string => {
  return emailConfig.unsubscribeUrlTemplate.replace('%TOKEN%', unsubscribeToken);
};

export default {
  s3Client,
  sesClient,
  emailConfig,
  validateAwsConfig,
  generateUnsubscribeLink,
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_SES_FROM_EMAIL,
};
