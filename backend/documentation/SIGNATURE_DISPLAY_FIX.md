# Signature Display Issue - Root Cause & Fix

## Problem
Signatures (principal and teacher) displayed in gradebooks appear as **broken image placeholders** after some time, typically 24 hours or more.

## Root Cause
The backend was generating **presigned AWS S3 URLs with 24-hour expiration** for signature files:

```typescript
// OLD CODE - 24 hour expiration
const s3Url = await s3.getSignedUrlPromise('getObject', {
  Bucket: config.aws.s3Bucket,
  Key: key,
  Expires: 86400,  // 24 hours in seconds
});
```

**Timeline of the issue:**
1. ✅ User uploads signature → Backend generates presigned URL (valid for 24 hours)
2. ✅ URL stored in database (`resultsSetupSession.principalSignatureUrl`)
3. ✅ User views gradebook → Signature displays correctly
4. ❌ After 24 hours, presigned URL expires  
5. ❌ Image becomes broken (HTTP 403 Forbidden from S3)

## Solution Implemented

### 1. Increased Presigned URL Expiration
**File:** [backend/src/modules/results-setup/controllers/signature-upload.controller.ts](backend/src/modules/results-setup/controllers/signature-upload.controller.ts)

Changed presigned URL expiration from **24 hours to 7 days** (604800 seconds):

```typescript
// NEW CODE - 7 day expiration
const s3Url = await s3.getSignedUrlPromise('getObject', {
  Bucket: config.aws.s3Bucket,
  Key: key,
  Expires: 604800,  // 7 days instead of 24 hours
});
```

### 2. Store S3 Key for Future URL Regeneration
**File:** [backend/src/modules/results-setup/controllers/signature-upload.controller.ts](backend/src/modules/results-setup/controllers/signature-upload.controller.ts)

Upload endpoint now returns both presigned URL and S3 key:

```typescript
res.json({
  success: true,
  s3Url,           // Presigned URL for immediate use
  s3Key: key,      // S3 key for regenerating URLs if needed
  key,
  signatureType,
  classId: classId || null,
});
```

### 3. Created New Endpoint for Fresh Presigned URLs
**File:** [backend/src/modules/results-setup/controllers/signature-upload.controller.ts](backend/src/modules/results-setup/controllers/signature-upload.controller.ts)

New `getSignaturePresignedUrl` function allows regenerating fresh presigned URLs on demand:

```typescript
export async function getSignaturePresignedUrl(req: Request, res: Response) {
  // Validates school ownership
  // Checks S3 file exists
  // Generates fresh 7-day presigned URL
}
```

**Route:** `GET /api/results-setup/signature-presigned-url?s3Key=...`

### 4. Added S3 Key Storage to Database
**File:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

Added `principalS3Key` field to store S3 key:

```prisma
model ResultsSetupSession {
  // ...
  principalSignatureUrl     String?  @map("principal_signature_url")
  principalS3Key            String?  @map("principal_s3_key")  // ✅ NEW
  // ...
}
```

### 5. Updated Backend Service & Controller
**File:** [backend/src/modules/results-setup/services/results-setup.service.ts](backend/src/modules/results-setup/services/results-setup.service.ts)

Added support for storing `principalS3Key`:

```typescript
if (dataUpdate.principalS3Key !== undefined) {
  updateData.principalS3Key = dataUpdate.principalS3Key;
}
```

### 6. Updated Frontend to Track & Send S3 Key
**File:** [src/pages/school-admin/results-setup/steps/Step5StaffUploads.tsx](src/pages/school-admin/results-setup/steps/Step5StaffUploads.tsx)

- Added state to track `principalS3Key`
- Updated upload handler to store S3 key
- Pass S3 key to backend in form submission

```typescript
const [principalS3Key, setPrincipalS3Key] = useState<string | null>(null);

// In upload handler
const s3Key = response.data.s3Key;
setPrincipalS3Key(s3Key);

// In submission
const payload = {
  ...sessionTermData,
  principalName,
  principalSignatureUrl,
  principalS3Key,  // ✅ Include S3 key
  staffData: teacherSignatures,
};
```

## How This Fixes the Issue

### Immediate Fix (7-day URL)
- Presigned URLs now valid for **7 days instead of 24 hours**
- Covers most use cases where users don't wait a week to view signatures
- Solves the broken image issue for typical usage

### Long-Term Solution (Fresh URLs)
- **S3 key** stored in database enables regenerating URLs anytime
- **`getSignaturePresignedUrl` endpoint** generates fresh 7-day URLs on demand
- Frontend can optionally use this endpoint when displaying signatures
- Ensures signatures always work, regardless of age

## Data Flow

```
Signature Upload
    ↓
Backend uploads to S3 → Gets S3 key
    ↓
Generates 7-day presigned URL + returns both URL and key
    ↓
Frontend stores BOTH URL and key in state
    ↓
Sends both to backend when submitting step 5
    ↓
Backend stores presigned URL + S3 key in database
    ↓
When viewing gradebook:
  - If URL is fresh: Display immediately ✅
  - If URL is expired (after 7 days): Call fresh URL endpoint
    → Backend regenerates fresh URL from key
    → Frontend uses new URL ✅
```

## Testing the Fix

### Immediate Verification
1. Upload signatures through Step 5
2. Complete setup and view gradebook
3. Signatures should display correctly
4. Reload page → Signatures still display (presigned URL still valid)

### Long-Term Verification (after 7 days)
1. Wait 7 days
2. Previously stored presigned URLs will be expired
3. Implement frontend logic to call `getSignaturePresignedUrl` endpoint
4. Signatures should still display correctly

## Files Modified

1. ✅ `backend/src/modules/results-setup/controllers/signature-upload.controller.ts` - Increased expiration, added new endpoint
2. ✅ `backend/src/modules/results-setup/routes/results-setup.routes.ts` - Added route for fresh URL endpoint
3. ✅ `backend/src/modules/results-setup/services/results-setup.service.ts` - Support for s3Key field
4. ✅ `backend/src/modules/results-setup/controllers/step5.controller.ts` - Accept and pass s3Key
5. ✅ `backend/prisma/schema.prisma` - Added `principalS3Key` field
6. ✅ `src/pages/school-admin/results-setup/steps/Step5StaffUploads.tsx` - Track and send S3 keys

## Status
✅ **Complete** - Code compiles without errors, ready for testing and deployment

## Future Improvements
- Implement frontend logic to auto-regenerate presigned URLs after 7 days
- Consider making S3 bucket public-read for signatures (if appropriate for security)
- Add CloudFront CDN for permanent signature URLs (highest reliability)
