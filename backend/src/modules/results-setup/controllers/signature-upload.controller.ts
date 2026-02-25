import { Request, Response } from 'express';
import AWS from 'aws-sdk';
import { config } from '@config/environment';
import { prisma } from '@config/database';

const s3 = new AWS.S3({
  accessKeyId: config.aws?.accessKeyId,
  secretAccessKey: config.aws?.secretAccessKey,
  region: config.aws?.region,
});

export async function uploadSignature(req: Request, res: Response) {
  try {
    const file = (req as any).file;
    const { signatureType, classId } = req.body; // 'principal' or 'teacher'
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    if (!config.aws?.s3Bucket) {
      return res.status(500).json({
        success: false,
        error: 'S3 bucket not configured',
      });
    }

    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - no schoolId found',
      });
    }

    // Validate signature type
    if (!['principal', 'teacher'].includes(signatureType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid signature type. Must be "principal" or "teacher"',
      });
    }

    // For teacher signatures, classId is required
    if (signatureType === 'teacher' && !classId) {
      return res.status(400).json({
        success: false,
        error: 'Class ID is required for teacher signatures',
      });
    }

    // Generate S3 key
    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = signatureType === 'principal' ? 'principal' : `teachers/${classId}`;
    const key = `signatures/${schoolId}/${folder}/${timestamp}-${sanitizedFileName}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ServerSideEncryption: 'AES256',
      Metadata: {
        schoolId,
        signatureType,
        classId: classId || '',
        uploadedAt: new Date().toISOString(),
      },
    };

    console.log(`📤 Uploading ${signatureType} signature to S3: ${key}`);
    const uploadResult = await s3.putObject(params).promise();
    console.log('✓ Signature uploaded successfully:', uploadResult.ETag);

    // Verify file was uploaded
    try {
      console.log('🔍 Verifying signature exists in S3...');
      await s3.headObject({
        Bucket: config.aws.s3Bucket,
        Key: key,
      }).promise();
      console.log('✓ Signature verified in S3');
    } catch (headError: any) {
      console.error(`❌ Signature not found in S3: ${key}`, headError.code);
      throw new Error(`Failed to verify signature upload. Please try again.`);
    }

    // Generate presigned URL for preview (24 hours)
    const s3Url = await s3.getSignedUrlPromise('getObject', {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Expires: 86400,
    });

    console.log('✓ Generated presigned URL for signature');

    res.json({
      success: true,
      s3Url,
      key,
      signatureType,
      classId: classId || null,
    });
  } catch (error) {
    console.error('Error uploading signature:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload signature',
    });
  }
}
