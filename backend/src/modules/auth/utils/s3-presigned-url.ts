import AWS from 'aws-sdk';
import { config } from '@config/environment';

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: config.aws?.accessKeyId,
  secretAccessKey: config.aws?.secretAccessKey,
  region: config.aws?.region,
});

export class S3PresignedUrl {
  /**
   * Generate a presigned URL for accessing a document
   * Presigned URLs allow temporary access without making the object permanently public
   * Default expiration: 24 hours (86400 seconds)
   * 
   * IMPORTANT: This function now verifies the file exists before generating URL
   * to prevent presigned URLs for non-existent files
   */
  static async generatePresignedUrl(
    documentUrl: string,
    expirationSeconds: number = 86400
  ): Promise<string> {
    if (!config.aws?.s3Bucket) {
      throw new Error('AWS S3 bucket not configured');
    }

    try {
      // Extract key from S3 URL
      const url = new URL(documentUrl);
      const key = url.pathname.substring(1); // Remove leading /

      console.log(`🔍 Verifying document exists before generating presigned URL: ${key}`);
      
      // Verify the file exists in S3 before generating presigned URL
      try {
        await s3.headObject({
          Bucket: config.aws.s3Bucket,
          Key: key,
        }).promise();
        console.log('✓ Document verified in S3');
      } catch (headError: any) {
        console.error(`❌ Document not found in S3: ${key}`, headError.code, headError.message);
        throw new Error(`Document not found in S3. File may have been deleted or never uploaded. Key: ${key}`);
      }

      const params = {
        Bucket: config.aws.s3Bucket,
        Key: key,
        Expires: expirationSeconds,
      };

      console.log(`🔗 Generating presigned URL for verified document...`);
      const presignedUrl = await s3.getSignedUrlPromise('getObject', params);
      console.log(`✓ Presigned URL generated successfully`);
      return presignedUrl;
    } catch (error) {
      console.error('✗ Failed to generate presigned URL:', error instanceof Error ? error.message : error);
      throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate presigned URLs for multiple documents at once
   */
  static async generatePresignedUrls(
    documentUrls: string[],
    expirationSeconds: number = 86400
  ): Promise<Record<string, string>> {
    const urls: Record<string, string> = {};

    for (const docUrl of documentUrls) {
      try {
        urls[docUrl] = await this.generatePresignedUrl(docUrl, expirationSeconds);
      } catch (error) {
        console.error(`Failed to generate URL for ${docUrl}:`, error);
        urls[docUrl] = docUrl; // Fallback to original URL
      }
    }

    return urls;
  }
}
