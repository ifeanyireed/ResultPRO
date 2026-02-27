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

    // Generate presigned URL for immediate preview (7 days expiration)
    // Store the S3 key for later regeneration if needed
    const s3Url = await s3.getSignedUrlPromise('getObject', {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Expires: 604800, // 7 days instead of 24 hours
    });

    console.log('✓ Generated presigned URL for signature (7 day expiration)');

    res.json({
      success: true,
      s3Url,
      s3Key: key, // Return S3 key for regenerating presigned URLs if needed
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
/**
 * Generate a fresh presigned URL for an existing signature
 * This allows retrieving signatures even after the initial presigned URL expires
 */
export async function getSignaturePresignedUrl(req: Request, res: Response) {
  try {
    const { s3Key } = req.query;

    if (!s3Key || typeof s3Key !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'S3 key is required',
      });
    }

    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - no schoolId found',
      });
    }

    // Verify the S3 key belongs to the requesting school
    if (!s3Key.includes(`signatures/${schoolId}/`)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - you do not have access to this signature',
      });
    }

    if (!config.aws?.s3Bucket) {
      return res.status(500).json({
        success: false,
        error: 'S3 bucket not configured',
      });
    }

    // Verify the signature still exists in S3
    try {
      console.log('🔍 Verifying signature exists in S3:', s3Key);
      await s3.headObject({
        Bucket: config.aws.s3Bucket,
        Key: s3Key,
      }).promise();
      console.log('✓ Signature found in S3');
    } catch (headError: any) {
      return res.status(404).json({
        success: false,
        error: 'Signature not found in S3',
      });
    }

    // Generate a fresh presigned URL (7 days expiration)
    const freshSignedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: config.aws.s3Bucket,
      Key: s3Key,
      Expires: 604800, // 7 days
    });

    console.log('✓ Generated fresh presigned URL for signature');

    res.json({
      success: true,
      s3Url: freshSignedUrl,
      s3Key,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate presigned URL',
    });
  }
}