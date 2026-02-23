import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { config } from '@config/environment';

const s3 = new AWS.S3({
  accessKeyId: config.aws?.accessKeyId,
  secretAccessKey: config.aws?.secretAccessKey,
  region: config.aws?.region,
});

/**
 * Upload the logo to S3 and return the URL
 */
export async function uploadLogoToS3(): Promise<string> {
  try {
    if (!config.aws?.s3Bucket) {
      console.warn('⚠️ AWS S3 bucket not configured - using local logo URL');
      return 'https://raw.githubusercontent.com/your-org/ResultsPro/main/public/logo.png';
    }

    // Path to logo (relative to backend process working directory)
    const logoPath = path.resolve(process.cwd(), '../public/logo.png');
    
    if (!fs.existsSync(logoPath)) {
      console.warn('⚠️ Logo file not found at', logoPath);
      return 'https://raw.githubusercontent.com/your-org/ResultsPro/main/public/logo.png';
    }

    // Read logo file
    const logoBuffer = fs.readFileSync(logoPath);

    // Upload to S3
    const key = 'assets/logo.png';
    const params: AWS.S3.PutObjectRequest = {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: logoBuffer,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
      ServerSideEncryption: 'AES256',
    };

    console.log('📤 Uploading logo to S3...');
    await s3.putObject(params).promise();
    console.log('✓ Logo uploaded to S3');

    // Verify logo was actually uploaded
    try {
      console.log('🔍 Verifying logo exists in S3...');
      await s3.headObject({
        Bucket: config.aws.s3Bucket,
        Key: key,
      }).promise();
      console.log('✓ Logo verified in S3');
    } catch (headError: any) {
      console.error('⚠️ Logo verification failed:', headError.message);
      throw new Error(`Logo upload verification failed: ${headError.message}`);
    }

    // Generate a presigned URL for the logo (valid for 1 year = 31536000 seconds)
    console.log('🔗 Generating presigned URL for logo...');
    const presignedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Expires: 31536000, // 1 year
    });

    console.log('✓ Logo uploaded to S3 with presigned URL');
    return presignedUrl;
  } catch (error) {
    console.error('✗ Failed to upload logo to S3:', error);
    // Return fallback URL
    return 'https://raw.githubusercontent.com/your-org/ResultsPro/main/public/logo.png';
  }
}

/**
 * Initialize logo URL on application startup
 */
export async function initializeLogoUrl(): Promise<string> {
  try {
    const logoUrl = await uploadLogoToS3();
    return logoUrl;
  } catch (error) {
    console.error('Failed to initialize logo URL:', error);
    return 'https://raw.githubusercontent.com/your-org/ResultsPro/main/public/logo.png';
  }
}
