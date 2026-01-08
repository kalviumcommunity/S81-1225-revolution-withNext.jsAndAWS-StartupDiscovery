# Object Storage Configuration (S3 / Azure Blob Storage)

## Overview

This guide covers setting up cloud object storage for secure file uploads with presigned URLs (AWS S3) or SAS tokens (Azure Blob Storage).

**Completion Date**: January 8, 2026  
**Status**: ✅ Implementation Complete

---

## Part 1: AWS S3 Setup

### Step 1: Create S3 Bucket

1. **Open AWS Console** → S3 Dashboard
2. **Click "Create Bucket"**
3. **Configuration**:
   - Bucket Name: `kalvium-startup-storage` (must be globally unique)
   - Region: Your closest region
   - Block All Public Access: **Enable** (✓ all checkboxes)
   - Versioning: **Enable** (optional, for file history)
   - Click "Create Bucket"

### Step 2: Configure Bucket Settings

1. **Lifecycle Rules** (Optional but Recommended):
   - Properties tab → Lifecycle rules
   - Rule: Archive objects after 30 days (to Glacier)
   - Rule: Delete old versions after 90 days

2. **Enable Encryption**:
   - Properties → Default encryption
   - Select "SSE-S3" (or SSE-KMS for more control)

3. **Enable Versioning** (Already done during creation)

### Step 3: Create IAM User with S3 Permissions

1. **Open IAM Dashboard**
2. **Create User**:
   - Name: `kalvium-s3-uploader`
   - Access Type: Programmatic access

3. **Attach Policy**:
   - Click "Attach policies directly"
   - Create inline policy with JSON:

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
        "arn:aws:s3:::kalvium-startup-storage",
        "arn:aws:s3:::kalvium-startup-storage/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "s3:GetBucketLocation",
      "Resource": "arn:aws:s3:::kalvium-startup-storage"
    }
  ]
}
```

4. **Retrieve Credentials**:
   - Copy Access Key ID
   - Copy Secret Access Key
   - **STORE SAFELY** - Don't commit to git!

### Step 4: Test with AWS CLI (Optional)

```bash
# Configure AWS CLI
aws configure
# Enter Access Key ID
# Enter Secret Access Key
# Enter region (e.g., us-east-1)

# Test upload
aws s3 cp test-file.txt s3://kalvium-startup-storage/test-file.txt

# Test download
aws s3 cp s3://kalvium-startup-storage/test-file.txt downloaded-file.txt

# List objects
aws s3 ls s3://kalvium-startup-storage/
```

---

## Part 2: Azure Blob Storage Setup

### Step 1: Create Storage Account

1. **Open Azure Portal**
2. **Create Resource** → Storage Account
3. **Configuration**:
   - Subscription: Your subscription
   - Resource Group: Create new or select existing
   - Storage Account Name: `kalviumstartup` (lowercase, 3-24 chars, numbers/letters)
   - Region: Closest region
   - Performance: Standard
   - Redundancy: Locally-redundant storage (LRS)
   - Click "Review + Create"

### Step 2: Create Blob Container

1. **Go to Storage Account** → Containers
2. **New Container**:
   - Name: `uploads`
   - Public Access Level: **Private**
   - Click "Create"

### Step 3: Generate Access Keys or SAS Token

**Option A: Connection String** (simpler but less secure):

1. **Settings** → Access Keys
2. Copy "Connection String" (primary)
3. Add to `.env.local`:

```
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..."
```

**Option B: SAS Token** (more secure, recommended):

1. **Settings** → Shared access signature\*\*
2. **Configuration**:
   - Allowed services: Blob
   - Allowed resource types: Container, Object
   - Allowed permissions: Read, Write, Delete, List
   - Expiration: 1 month
   - Click "Generate SAS and connection string"
3. Copy "Blob service SAS URL"
4. Add to `.env.local`:

```
AZURE_BLOB_SAS_URL="https://kalviumstartup.blob.core.windows.net/?sv=..."
```

### Step 4: Test with Azure CLI (Optional)

```bash
# Install Azure CLI
# https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Upload file
az storage blob upload --account-name kalviumstartup \
  --container-name uploads --name test-file.txt --file test-file.txt

# Download file
az storage blob download --account-name kalviumstartup \
  --container-name uploads --name test-file.txt --file downloaded-file.txt

# List blobs
az storage blob list --account-name kalviumstartup --container-name uploads
```

---

## Part 3: Implementation

### File Structure

```
lib/
├── storage/
│   ├── index.ts              # Main exports
│   ├── uploadUtils.ts        # Presigned/SAS URL generation
│   ├── fileValidation.ts     # File type/size validation
│   └── storageClient.ts      # Storage client initialization

app/api/storage/
├── upload-url/route.ts       # Generate presigned URL
├── retrieve/route.ts         # Get file with metadata
├── download/route.ts         # Download file
└── delete/route.ts           # Delete file (protected)

components/
└── UploadComponent.tsx       # Example upload UI
```

---

## Part 4: Presigned URL Flow (AWS S3)

### Server-Side: Generate Presigned URL

**API Route** `/api/storage/upload-url`:

```typescript
export async function GET(req: NextRequest) {
  const { fileName, fileType } = req.nextUrl.searchParams;

  // Validate file
  if (!isValidFile(fileName, fileType)) {
    return Response.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    // Generate presigned URL
    const uploadUrl = await generatePresignedUrl(fileName, fileType);

    return Response.json({
      uploadUrl,
      expiresIn: 60, // 60 seconds
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Client-Side: Upload File

```typescript
// components/UploadComponent.tsx

async function uploadFile(file: File) {
  // 1. Validate locally
  if (!validateFile(file)) {
    alert("Invalid file type or size");
    return;
  }

  // 2. Request presigned URL from server
  const urlRes = await fetch(
    `/api/storage/upload-url?fileName=${file.name}&fileType=${file.type}`
  );
  const { uploadUrl } = await urlRes.json();

  // 3. Upload directly to S3 using presigned URL
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (uploadRes.ok) {
    // 4. File uploaded successfully
    const fileUrl = uploadUrl.split("?")[0]; // Remove query params
    console.log("File uploaded to:", fileUrl);
  }
}
```

---

## Part 5: SAS URL Flow (Azure Blob Storage)

### Server-Side: Generate SAS URL

```typescript
export async function GET(req: NextRequest) {
  const { fileName, fileType } = req.nextUrl.searchParams;

  // Validate
  if (!isValidFile(fileName, fileType)) {
    return Response.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    // Generate SAS URL
    const uploadUrl = await generateSasUrl(fileName);

    return Response.json({
      uploadUrl,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Client-Side: Upload to Azure Blob

```typescript
async function uploadToAzure(file: File, sasUrl: string) {
  const uploadUrl = `${sasUrl}&comp=block`;

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": file.type,
    },
  });

  return uploadRes.ok;
}
```

---

## Part 6: File Validation

### Supported File Types

```typescript
// Whitelist of allowed MIME types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Maximum file sizes
const MAX_FILE_SIZES = {
  "image/jpeg": 5 * 1024 * 1024, // 5MB
  "image/png": 5 * 1024 * 1024, // 5MB
  "application/pdf": 20 * 1024 * 1024, // 20MB
};
```

### Validation Function

```typescript
export function validateFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed: ${file.type}`,
    };
  }

  // Check size
  const maxSize = MAX_FILE_SIZES[file.type];
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large (max ${maxSize / 1024 / 1024}MB)`,
    };
  }

  // Check filename
  if (!/^[a-zA-Z0-9._\-]+$/.test(file.name)) {
    return {
      valid: false,
      error: "Invalid filename characters",
    };
  }

  return { valid: true };
}
```

---

## Part 7: Security Best Practices

### 1. **Least Privilege Access**

- ✅ Create dedicated IAM user for uploads (AWS)
- ✅ Use SAS tokens with minimal permissions (Azure)
- ❌ Never expose root/admin credentials
- ✅ Rotate credentials regularly

### 2. **Presigned/SAS URL Security**

- ✅ Keep expiration time short (60-3600 seconds)
- ✅ Include file type and size in validation
- ✅ Sign URLs server-side only
- ❌ Never expose credentials in frontend code

### 3. **Storage Access Control**

- ✅ Block all public access
- ✅ Require authentication for downloads
- ✅ Use HTTPS only (enforced by default)
- ✅ Enable versioning for accidental deletion recovery

### 4. **File Validation**

- ✅ Validate MIME type server-side
- ✅ Check file size limits
- ✅ Sanitize filenames
- ✅ Scan for malware (optional: use antivirus service)

### 5. **Cost Optimization**

- ✅ Set lifecycle policies (archive after 30 days)
- ✅ Delete old file versions (retention: 90 days)
- ✅ Monitor storage usage with alerts
- ✅ Use appropriate storage tier (Standard vs Archive)

---

## Part 8: Lifecycle Policies

### AWS S3 Lifecycle Rules

```json
{
  "Rules": [
    {
      "Id": "ArchiveOldFiles",
      "Status": "Enabled",
      "Filter": { "Prefix": "" },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    },
    {
      "Id": "DeleteOldVersions",
      "Status": "Enabled",
      "NoncurrentVersionTransitions": [
        {
          "NoncurrentDays": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 90
      }
    }
  ]
}
```

### Azure Blob Lifecycle Rules

```json
{
  "rules": [
    {
      "name": "archive-old-blobs",
      "enabled": true,
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "tierToArchive": {
              "daysAfterModificationGreaterThan": 30
            },
            "delete": {
              "daysAfterModificationGreaterThan": 365
            }
          },
          "snapshot": {
            "delete": {
              "daysAfterCreationGreaterThan": 90
            }
          }
        },
        "filters": {
          "blobTypes": ["blockBlob"]
        }
      }
    }
  ]
}
```

---

## Part 9: Cost Estimation

### AWS S3

| Component                            | Cost              |
| ------------------------------------ | ----------------- |
| Storage (100 GB @ $0.023/GB)         | $2.30/month       |
| Data Transfer Out (50 GB @ $0.09/GB) | $4.50/month       |
| Requests (1M PUT @ $0.005/1K)        | $5.00/month       |
| Glacier Archive (100 GB @ $0.004/GB) | $0.40/month       |
| **Total**                            | **~$12.20/month** |

**Cost Optimization**:

- Archive old files to Glacier (90% cost reduction)
- Use CloudFront CDN for frequent downloads
- Monitor costs with AWS Budgets

### Azure Blob Storage

| Component                      | Cost             |
| ------------------------------ | ---------------- |
| Storage (100 GB @ $0.024/GB)   | $2.40/month      |
| Read Ops (1M @ $0.40/million)  | $0.40/month      |
| Write Ops (100K @ $5/million)  | $0.50/month      |
| Delete Ops (100K @ $5/million) | $0.50/month      |
| **Total**                      | **~$3.80/month** |

**Cost Optimization**:

- Archive to Archive tier after 30 days (70% savings)
- Delete old snapshots automatically
- Use Blob Inventory for cost analysis

---

## Part 10: API Endpoints

### 1. Generate Upload URL

**Request**:

```
GET /api/storage/upload-url?fileName=profile.jpg&fileType=image/jpeg
```

**Response**:

```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/profile.jpg?...",
  "expiresIn": 60,
  "provider": "aws"
}
```

### 2. Retrieve File

**Request**:

```
GET /api/storage/retrieve?key=profile.jpg
```

**Response**:

```json
{
  "url": "https://s3.amazonaws.com/bucket/profile.jpg",
  "contentType": "image/jpeg",
  "size": 1024000,
  "uploadedAt": "2026-01-08T10:30:00Z"
}
```

### 3. Download File

**Request**:

```
GET /api/storage/download?key=profile.jpg
```

**Response**: File binary data with headers:

```
Content-Type: image/jpeg
Content-Disposition: attachment; filename="profile.jpg"
```

### 4. Delete File (Protected)

**Request**:

```
DELETE /api/storage/delete?key=profile.jpg
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "message": "File deleted"
}
```

---

## Part 11: Troubleshooting

### AWS S3 Issues

**Problem**: "Access Denied" error
**Solution**:

1. Verify IAM policy includes bucket and object actions
2. Check bucket policy (should be empty for private bucket)
3. Verify credentials in `.env.local`

**Problem**: Presigned URL expires too quickly
**Solution**:

1. Increase `Expires` parameter (max 604800 seconds / 7 days)
2. Check server time is synchronized

**Problem**: CORS errors on file upload
**Solution**:

1. Add CORS configuration to bucket:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

### Azure Blob Issues

**Problem**: "Authentication failed"
**Solution**:

1. Verify connection string is correct
2. Check storage account name (lowercase)
3. Verify SAS token hasn't expired

**Problem**: Upload fails with 403 Forbidden
**Solution**:

1. Check SAS permissions include "Write"
2. Verify container exists
3. Check blob name doesn't contain special chars

---

## Part 12: Environment Configuration

### `.env.local` Example

```bash
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJal...
AWS_S3_BUCKET_NAME=kalvium-startup-storage

# Or Azure Blob
AZURE_STORAGE_ACCOUNT_NAME=kalviumstartup
AZURE_STORAGE_ACCOUNT_KEY=DefaultEndpointsProtocol=https...
AZURE_BLOB_CONTAINER_NAME=uploads
AZURE_BLOB_SAS_URL=https://kalviumstartup.blob.core.windows.net/?sv=...

# Storage configuration
STORAGE_PROVIDER=aws # or 'azure'
STORAGE_MAX_FILE_SIZE=5242880 # 5MB in bytes
```

---

## Part 13: Files Created

| File                                  | Purpose                      |
| ------------------------------------- | ---------------------------- |
| `lib/storage/index.ts`                | Main exports                 |
| `lib/storage/uploadUtils.ts`          | Presigned/SAS URL generation |
| `lib/storage/fileValidation.ts`       | File validation              |
| `lib/storage/storageClient.ts`        | Storage client init          |
| `app/api/storage/upload-url/route.ts` | Generate upload URL          |
| `app/api/storage/retrieve/route.ts`   | Get file metadata            |
| `app/api/storage/download/route.ts`   | Download file                |
| `app/api/storage/delete/route.ts`     | Delete file                  |
| `components/UploadComponent.tsx`      | Example upload UI            |
| `OBJECT_STORAGE_SETUP.md`             | This documentation           |

---

## Part 14: Summary

This implementation provides:

✅ Step-by-step AWS S3 and Azure Blob setup  
✅ Secure presigned URL and SAS token generation  
✅ Comprehensive file validation (type, size, format)  
✅ Production-ready API endpoints  
✅ Example frontend upload component  
✅ Lifecycle policies for cost optimization  
✅ Security best practices  
✅ Troubleshooting guide  
✅ Cost estimation

You now have everything needed to implement secure cloud storage uploads!
