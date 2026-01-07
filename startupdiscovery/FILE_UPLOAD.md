# File Upload API with AWS S3 - Implementation Guide

## Overview

This document provides a comprehensive guide to the File Upload API implementation using AWS S3 pre-signed URLs. The system allows secure, direct file uploads to cloud storage while maintaining full control over file types, sizes, and metadata tracking.

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
└──────────────┬──────────────────────────────────────────────┘
               │
               ├─→ 1. Request Pre-Signed URL
               │   POST /api/upload
               │   { filename, fileType, fileSize }
               │
┌──────────────┴──────────────────────────────────────────────┐
│                    Next.js Backend                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ lib/s3.ts: S3 Client & Pre-Signed URL Generation     │ │
│  │  - validateFileType()                                 │ │
│  │  - validateFileSize()                                 │ │
│  │  - generateUploadPresignedUrl()                       │ │
│  │  - getPublicS3Url()                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ app/api/upload/route.ts: Upload URL Generation        │ │
│  │  - Validates file metadata                            │ │
│  │  - Checks file type and size                          │ │
│  │  - Returns pre-signed URL                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ app/api/files/route.ts: File Metadata Storage         │ │
│  │  - POST: Create file records in database              │ │
│  │  - GET: List files with pagination                    │ │
│  │  - DELETE: Remove file metadata                       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────────────────────┘
               │
               ├─→ 2. Upload to S3 using pre-signed URL
               │   PUT <uploadUrl>
               │   <file data>
               │
               ├─→ 3. Receive public S3 URL
               │   https://bucket.s3.region.amazonaws.com/key
               │
               ├─→ 4. Store metadata in database
               │   POST /api/files
               │   { filename, fileUrl, fileType, startupId }
               │
               └─→ 5. Access file via public URL
                   GET https://bucket.s3.region.amazonaws.com/key
```

## Security Architecture

### Pre-Signed URLs

Pre-signed URLs are temporary, cryptographically signed URLs that allow direct access to S3 without exposing AWS credentials.

**Advantages:**

- No credentials exposed to client
- Time-limited access (default 1 hour)
- Can restrict HTTP method (PUT only for uploads)
- Can restrict Content-Type and file size
- Server maintains full control over upload parameters

**How it works:**

1. Client requests pre-signed URL from backend
2. Backend validates file metadata (type, size, filename)
3. Backend generates signed URL using AWS SDK
4. URL is returned to client with expiry time
5. Client uploads directly to S3 using this URL
6. S3 verifies signature and allows upload if valid
7. Backend stores file metadata in database

### Access Control

**Upload permissions:**

- Only authenticated users (with valid JWT) can request pre-signed URLs
- File type and size validated server-side
- AWS IAM credentials stored securely in environment variables

**File access:**

- Files uploaded with `ACL: "public-read"` are accessible via public URL
- No authentication required for downloading/viewing files
- Optional: Implement private files with download pre-signed URLs

**Database permissions:**

- File metadata linked to startups
- Users can only see files for startups they own/manage

## Setup Instructions

### 1. AWS S3 Configuration

#### Create S3 Bucket

```bash
# Using AWS CLI
aws s3api create-bucket \
  --bucket startupdiscovery-files \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1
```

#### Configure Bucket Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::startupdiscovery-files/*"
    }
  ]
}
```

#### Create IAM User for Application

1. Go to AWS IAM Console
2. Create new user: `startupdiscovery-app`
3. Attach policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::startupdiscovery-files",
        "arn:aws:s3:::startupdiscovery-files/*"
      ]
    }
  ]
}
```

4. Generate access key and secret
5. Add to `.env.local`

### 2. Environment Configuration

```env
# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=startupdiscovery-files
AWS_S3_UPLOAD_EXPIRY=3600  # Seconds (1 hour)
```

### 3. Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## API Endpoints

### 1. Generate Pre-Signed Upload URL

**Endpoint:** `POST /api/upload`

**Request:**

```json
{
  "filename": "profile.png",
  "fileType": "image/png",
  "fileSize": 2048576
}
```

**Response:**

```json
{
  "success": true,
  "uploadUrl": "https://startupdiscovery-files.s3.ap-south-1.amazonaws.com/uploads/1704705600000-abc123-profile.png?X-Amz-Algorithm=...",
  "key": "uploads/1704705600000-abc123-profile.png",
  "expiresIn": 3600,
  "bucket": "startupdiscovery-files",
  "region": "ap-south-1"
}
```

**Error Responses:**

```json
{
  "success": false,
  "message": "File type 'application/exe' is not allowed"
}
```

**Validation:**

- `filename` and `fileType` required
- File type must be in allowed list (images, documents, videos)
- File size must be ≤ 50MB

### 2. Store File Metadata

**Endpoint:** `POST /api/files`

**Request:**

```json
{
  "filename": "profile.png",
  "fileUrl": "https://startupdiscovery-files.s3.ap-south-1.amazonaws.com/uploads/...",
  "fileType": "image/png",
  "fileSize": 2048576,
  "startupId": 123
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 456,
    "name": "profile.png",
    "url": "https://startupdiscovery-files.s3.ap-south-1.amazonaws.com/uploads/...",
    "type": "IMAGE",
    "size": 2048576,
    "startupId": 123,
    "createdAt": "2024-01-08T10:30:00Z"
  }
}
```

### 3. List Files

**Endpoint:** `GET /api/files?page=1&limit=10`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "type": "IMAGE",
      "url": "https://...",
      "caption": "profile.png",
      "createdAt": "2024-01-08T10:30:00Z",
      "startup": {
        "id": 123,
        "title": "TechStartup",
        "slug": "techstartup"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "hasMore": true
  }
}
```

### 4. Delete File Metadata

**Endpoint:** `DELETE /api/files/:id`

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Upload Flow - Complete Example

### Step 1: Request Pre-Signed URL

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "startup-logo.png",
    "fileType": "image/png",
    "fileSize": 1048576
  }'
```

**Response:**

```json
{
  "success": true,
  "uploadUrl": "https://startupdiscovery-files.s3.ap-south-1.amazonaws.com/uploads/1704705600000-abc123-startup-logo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "key": "uploads/1704705600000-abc123-startup-logo.png",
  "expiresIn": 3600
}
```

### Step 2: Upload File to S3

```bash
curl -X PUT "https://startupdiscovery-files.s3.ap-south-1.amazonaws.com/uploads/1704705600000-abc123-startup-logo.png?X-Amz-Algorithm=..." \
  -H "Content-Type: image/png" \
  --upload-file ./startup-logo.png
```

S3 responds with **200 OK** if upload is successful.

### Step 3: Store File Metadata

```bash
curl -X POST http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "startup-logo.png",
    "fileUrl": "https://startupdiscovery-files.s3.ap-south-1.amazonaws.com/uploads/1704705600000-abc123-startup-logo.png",
    "fileType": "image/png",
    "fileSize": 1048576,
    "startupId": 123
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 789,
    "name": "startup-logo.png",
    "url": "https://startupdiscovery-files.s3.ap-south-1.amazonaws.com/uploads/1704705600000-abc123-startup-logo.png",
    "type": "IMAGE",
    "size": 1048576,
    "startupId": 123,
    "createdAt": "2024-01-08T10:45:00Z"
  }
}
```

### Step 4: Access File

```bash
# Open in browser or download
curl -o startup-logo.png \
  https://startupdiscovery-files.s3.ap-south-1.amazonaws.com/uploads/1704705600000-abc123-startup-logo.png
```

## File Type and Size Validation

### Allowed File Types

```typescript
const allowedTypes = [
  // Images
  "image/jpeg", // .jpg, .jpeg
  "image/png", // .png
  "image/gif", // .gif
  "image/webp", // .webp
  "image/svg+xml", // .svg

  // Documents
  "application/pdf", // .pdf
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx

  // Videos
  "video/mp4", // .mp4
  "video/quicktime", // .mov
  "video/webm", // .webm
];
```

### File Size Limits

- **Default maximum:** 50MB
- **Images:** ≤ 50MB (typically much smaller)
- **Documents:** ≤ 50MB
- **Videos:** ≤ 50MB (consider streaming for larger files)

**Configuration:**

```typescript
// In lib/s3.ts
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// In app/api/upload/route.ts
if (!isAllowedFileSize(fileSize, 50)) {
  return NextResponse.json(
    {
      success: false,
      message: `File size must be less than 50MB`,
    },
    { status: 400 }
  );
}
```

## Database Schema

### Media Model (Extended)

```prisma
model Media {
  id        Int       @id @default(autoincrement())
  type      MediaType           // IMAGE, VIDEO, DOCUMENT
  url       String              // S3 public URL
  caption   String?             // Original filename
  order     Int       @default(0)
  createdAt DateTime  @default(now())

  startupId Int
  startup   Startup @relation(fields: [startupId], references: [id], onDelete: Cascade)

  @@index([startupId])
  @@index([order])
  @@map("media")
}

enum MediaType {
  IMAGE
  VIDEO
  DOCUMENT
}
```

**Fields:**

- `id`: Unique identifier
- `type`: Media type classification (IMAGE, VIDEO, DOCUMENT)
- `url`: Public S3 URL
- `caption`: Original filename or user caption
- `order`: Display order if multiple files per startup
- `startupId`: Link to startup that owns this file
- `createdAt`: Upload timestamp

## Best Practices

### Security

1. **Validate on Backend**
   - Always validate file type and size server-side
   - Never trust client-provided file extensions
   - Use MIME type validation, not file extensions

2. **Use Pre-Signed URLs**
   - Never expose AWS credentials to clients
   - Always generate temporary signed URLs
   - Set reasonable expiry times (1-24 hours)

3. **Access Control**
   - Authenticate file upload requests (JWT)
   - Link files to user/startup records
   - Implement authorization for file management

4. **Sensitive Data**
   - Don't store sensitive information in files
   - Implement encryption for private files
   - Regular security audits of uploaded content

### Performance

1. **File Size Optimization**
   - Compress images before upload
   - Set reasonable size limits
   - Monitor S3 storage costs

2. **Caching**
   - Leverage S3 CloudFront CDN for public files
   - Set appropriate Cache-Control headers
   - Use Redis caching for file metadata queries

3. **Parallel Uploads**
   - Use multipart uploads for large files
   - Implement progress tracking on client
   - Resume interrupted uploads

### Lifecycle Management

1. **Storage Lifecycle Policy**
   - Delete old/unused files after 90 days
   - Archive to cheaper storage (Glacier) after 1 year
   - Retention policies for compliance

2. **Cleanup**
   - Implement DELETE endpoint to remove files
   - Add database cascading deletes
   - Log all file operations

## Advanced Features

### 1. Private Files with Temporary Access

```typescript
// Generate time-limited download URL
export async function generateDownloadPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}
```

### 2. Image Optimization

```typescript
// Before storing, optimize images
import sharp from "sharp";

const optimized = await sharp(fileBuffer)
  .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer();
```

### 3. Virus Scanning

```typescript
// Scan uploads for malware
import ClamAV from "clamscan";

const clamscan = new ClamAV({
  clamdscan: { host: "localhost", port: 3310 },
});

await clamscan.scanFile(fileBuffer);
```

### 4. Metadata Extraction

```typescript
// Extract metadata (for images)
import exifParser from "exif-parser";

const buffer = Buffer.from(fileData);
const parser = exifParser.create(buffer);
const metadata = parser.getResult();
```

## Monitoring and Debugging

### S3 Metrics

```bash
# View bucket size
aws s3api list-objects-v2 \
  --bucket startupdiscovery-files \
  --query "Contents[*].Size" \
  --output json | jq add

# Check object count
aws s3api list-objects-v2 \
  --bucket startupdiscovery-files \
  --query "length(Contents[])"

# Monitor costs
# AWS Console → Billing → S3 Storage
```

### Application Logs

```typescript
logger.info("File upload request", {
  filename,
  fileType,
  fileSize,
  requestId,
  userId,
  startupId,
});

logger.info("Pre-signed URL generated", {
  key,
  expiresIn,
  requestId,
});

logger.error("Upload failed", {
  error: error.message,
  filename,
  requestId,
});
```

### Database Queries

```prisma
// Find all files for a startup
prisma.media.findMany({
  where: { startupId: 123 },
  orderBy: { createdAt: "desc" },
})

// Find large files
prisma.media.findMany({
  where: { type: "VIDEO" },
  select: { id: true, url: true, createdAt: true },
})

// Count files by type
prisma.media.groupBy({
  by: ["type"],
  _count: true,
})
```

## Troubleshooting

### Common Issues

1. **"Invalid bucket" error**
   - Verify AWS_BUCKET_NAME is correct
   - Check bucket exists in AWS_REGION
   - Verify IAM permissions

2. **"Access Denied" when uploading**
   - Check IAM user has s3:PutObject permission
   - Verify bucket policy allows public uploads
   - Check CORS configuration

3. **Pre-signed URL expires before upload**
   - Increase AWS_S3_UPLOAD_EXPIRY
   - Implement retry logic with new URL generation
   - Show remaining time to user

4. **Files not accessible publicly**
   - Verify ACL is set to "public-read"
   - Check bucket policy allows GetObject
   - Verify correct S3 URL format

## Cost Estimation

### Pricing (US Standard Region)

| Operation           | Cost                | Notes                      |
| ------------------- | ------------------- | -------------------------- |
| PUT (Upload)        | $0.005 per 1,000    | Pre-signed URL costs 1 PUT |
| GET (Download)      | $0.0004 per 1,000   | Accessing file via URL     |
| Storage             | $0.023 per GB/month | Vary by region             |
| Data Transfer (Out) | $0.09 per GB        | Downloads to clients       |

### Example Costs

```
Scenario: 1000 users, 2 files each = 2000 files/month
- Upload cost: 2000 * $0.005 = $10
- Storage: 2000 * 2MB * $0.023 = ~$92/month
- Downloads: Varies by usage

Optimizations:
- Use CloudFront CDN: Reduces transfer cost by 70%
- Compress images: Reduces storage by 60%
- Lifecycle policies: Move to Glacier after 90 days (-80% cost)
```

## Conclusion

The File Upload API with pre-signed URLs provides:

- ✅ Secure, credential-free uploads
- ✅ Server-controlled validation
- ✅ Scalable cloud storage
- ✅ Full audit trail via database
- ✅ Production-ready implementation

For production deployment:

1. Add environment variable validation
2. Implement request rate limiting
3. Add file scanning/antivirus
4. Set up CloudFront CDN
5. Configure lifecycle policies
6. Enable S3 versioning for recovery
