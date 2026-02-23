import AWS from 'aws-sdk';
import { config } from '@config/environment';

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: config.aws?.accessKeyId,
  secretAccessKey: config.aws?.secretAccessKey,
  region: config.aws?.region,
});

export class S3Upload {
  /**
   * Upload file to S3
   */
  static async uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    schoolId: string,
    documentType: string
  ): Promise<string> {
    if (!config.aws?.s3Bucket) {
      throw new Error('AWS S3 bucket not configured');
    }

    const timestamp = Date.now();
    const key = `documents/${schoolId}/${documentType}/${timestamp}-${file.originalname}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: 'AES256',
      Metadata: {
        schoolId,
        documentType,
        uploadedAt: new Date().toISOString(),
      },
    };

    try {
      console.log(`📤 Uploading file to S3: ${key}`);
      const uploadResult = await s3.putObject(params).promise();
      console.log('✓ File uploaded successfully:', uploadResult.ETag);

      // Verify file was actually uploaded by checking if it exists
      try {
        console.log('🔍 Verifying file exists in S3...');
        await s3.headObject({
          Bucket: config.aws.s3Bucket,
          Key: key,
        }).promise();
        console.log('✓ File verified in S3');
      } catch (headError: any) {
        console.error('⚠️ File verification failed:', headError.message);
        throw new Error(`File upload verification failed: ${headError.message}`);
      }

      // Generate a presigned URL valid for 1 year (31536000 seconds)
      // This is a long validity so presigned URLs stored in DB remain valid
      console.log('🔗 Generating presigned URL...');
      const presignedUrl = await s3.getSignedUrlPromise('getObject', {
        Bucket: config.aws.s3Bucket,
        Key: key,
        Expires: 31536000, // 1 year
      });

      console.log(`✓ File uploaded to S3 with presigned URL: ${key}`);
      
      return presignedUrl;
    } catch (error) {
      console.error('❌ S3 upload error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to upload file to S3: ${errorMessage}`);
    }
  }

  /**
   * Delete file from S3
   */
  static async deleteFile(documentUrl: string): Promise<void> {
    if (!config.aws?.s3Bucket) {
      throw new Error('AWS S3 bucket not configured');
    }

    try {
      // Extract key from URL
      const url = new URL(documentUrl);
      const key = url.pathname.substring(1); // Remove leading /

      await s3.deleteObject({
        Bucket: config.aws.s3Bucket,
        Key: key,
      }).promise();

      console.log(`✓ File deleted from S3: ${key}`);
    } catch (error) {
      console.error('✗ S3 delete error:', error);
      // Don't throw - deletion is best effort
    }
  }
}
