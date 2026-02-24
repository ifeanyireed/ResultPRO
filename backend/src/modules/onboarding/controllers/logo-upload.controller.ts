import { Request, Response } from 'express';
import AWS from 'aws-sdk';
import { config } from '@config/environment';

const s3 = new AWS.S3({
  accessKeyId: config.aws?.accessKeyId,
  secretAccessKey: config.aws?.secretAccessKey,
  region: config.aws?.region,
});

// Upload logo file to S3 via backend
export const uploadLogo = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!config.aws?.s3Bucket) {
      return res.status(500).json({ error: 'S3 bucket not configured' });
    }

    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({ error: 'Unauthorized - no schoolId found' });
    }

    // Generate S3 key with timestamp and sanitized filename
    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `logos/${schoolId}/${timestamp}-${sanitizedFileName}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: 'AES256',
      Metadata: {
        schoolId,
        uploadedAt: new Date().toISOString(),
      },
    };

    console.log(`📤 Uploading logo to S3: ${key}`);
    const uploadResult = await s3.putObject(params).promise();
    console.log('✓ Logo uploaded successfully:', uploadResult.ETag);

    // Verify file was uploaded by checking if it exists
    try {
      console.log('🔍 Verifying logo exists in S3...');
      await s3.headObject({
        Bucket: config.aws.s3Bucket,
        Key: key,
      }).promise();
      console.log('✓ Logo verified in S3');
    } catch (headError: any) {
      console.error(`❌ Logo not found in S3: ${key}`, headError.code);
      throw new Error(`Failed to verify logo upload. Please try again.`);
    }

    // Generate a presigned URL for longer-term access (24 hours)
    const s3Url = await s3.getSignedUrlPromise('getObject', {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Expires: 86400, // 24 hours
    });

    console.log('✓ Generated presigned URL for logo');

    res.json({
      s3Url,
      key,
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload logo' });
  }
};
