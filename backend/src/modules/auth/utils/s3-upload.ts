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
      await s3.putObject(params).promise();
      
      // Return the S3 URL
      const url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
      console.log(`✓ File uploaded to S3: ${url}`);
      
      return url;
    } catch (error) {
      console.error('✗ S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
