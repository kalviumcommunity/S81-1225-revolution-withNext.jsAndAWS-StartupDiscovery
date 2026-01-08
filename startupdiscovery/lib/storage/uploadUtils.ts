/**
 * Upload utilities for S3 presigned URLs and Azure SAS tokens
 * Handles secure URL generation for cloud storage
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

export type StorageProvider = "aws" | "azure";

export interface PresignedUrlResponse {
  uploadUrl: string;
  expiresIn: number;
  provider: StorageProvider;
  fileKey?: string;
  downloadUrl?: string;
}

// AWS S3 Configuration
let s3Client: S3Client | null = null;

function initializeS3Client(): S3Client {
  if (s3Client) return s3Client;

  const region = process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
    );
  }

  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3Client;
}

// Azure Blob Configuration
function getAzureBlobServiceClient(): BlobServiceClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  if (connectionString) {
    return BlobServiceClient.fromConnectionString(connectionString);
  }

  if (accountName && accountKey) {
    return BlobServiceClient.fromConnectionString(
      `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`
    );
  }

  throw new Error(
    "Azure credentials not configured. Set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY"
  );
}

/**
 * Generate AWS S3 presigned PUT URL for direct file upload
 */
export async function generateS3PresignedUrl(
  fileName: string,
  mimeType: string,
  expiresInSeconds: number = 300
): Promise<PresignedUrlResponse> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME not configured");
  }

  const s3 = initializeS3Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: expiresInSeconds,
  });

  // Generate GET URL for later retrieval
  const getCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  const downloadUrl = await getSignedUrl(s3, getCommand, {
    expiresIn: 86400, // 24 hours for download
  });

  return {
    uploadUrl,
    downloadUrl,
    expiresIn: expiresInSeconds,
    provider: "aws",
    fileKey: fileName,
  };
}

/**
 * Generate Azure Blob SAS URL for direct file upload
 */
export async function generateAzureSasUrl(
  fileName: string,
  expiresInSeconds: number = 3600
): Promise<PresignedUrlResponse> {
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME || "uploads";
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  if (!accountName || !accountKey) {
    throw new Error(
      "Azure credentials not configured (AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY required)"
    );
  }

  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + expiresInSeconds);

  // Generate SAS token using SharedKeyCredential
  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: fileName,
      permissions: BlobSASPermissions.parse("racwd"), // read, add, create, write, delete
      expiresOn: expiryDate,
    },
    credential
  );

  const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;

  // Generate download URL
  const downloadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${generateBlobSASQueryParameters(
    {
      containerName,
      blobName: fileName,
      permissions: BlobSASPermissions.parse("racwd"),
      expiresOn: expiryDate,
    },
    credential
  )}`;

  return {
    uploadUrl: sasUrl,
    downloadUrl,
    expiresIn: expiresInSeconds,
    provider: "azure",
    fileKey: fileName,
  };
}

/**
 * Generate presigned URL for the configured cloud provider
 */
export async function generatePresignedUrl(
  fileName: string,
  mimeType: string,
  expiresInSeconds?: number
): Promise<PresignedUrlResponse> {
  const provider = (process.env.STORAGE_PROVIDER || "aws") as StorageProvider;

  if (provider === "aws") {
    return generateS3PresignedUrl(fileName, mimeType, expiresInSeconds || 300);
  } else if (provider === "azure") {
    return generateAzureSasUrl(fileName, expiresInSeconds || 3600);
  } else {
    throw new Error(`Unsupported storage provider: ${provider}`);
  }
}

/**
 * Get object metadata from AWS S3
 */
export async function getS3ObjectMetadata(fileName: string): Promise<{
  url: string;
  contentType: string;
  size: number;
  lastModified: Date;
}> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME not configured");
  }

  const s3 = initializeS3Client();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  const response = await s3.send(command);

  const downloadUrl = await getSignedUrl(s3, command, {
    expiresIn: 86400,
  });

  return {
    url: downloadUrl,
    contentType: response.ContentType || "application/octet-stream",
    size: response.ContentLength || 0,
    lastModified: response.LastModified || new Date(),
  };
}

/**
 * Get blob metadata from Azure Blob Storage
 */
export async function getAzureBlobMetadata(fileName: string): Promise<{
  url: string;
  contentType: string;
  size: number;
  lastModified: Date;
}> {
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME || "uploads";
  const blobServiceClient = getAzureBlobServiceClient();

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(fileName);

  const properties = await blobClient.getProperties();

  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24); // 24-hour download link

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  if (!accountName || !accountKey) {
    throw new Error("Azure credentials not configured");
  }

  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: fileName,
      permissions: BlobSASPermissions.parse("r"), // read-only
      expiresOn: expiryDate,
    },
    credential
  );

  const url = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;

  return {
    url,
    contentType: properties.contentType || "application/octet-stream",
    size: properties.contentLength || 0,
    lastModified: properties.lastModified || new Date(),
  };
}

/**
 * Delete object from AWS S3
 */
export async function deleteS3Object(fileName: string): Promise<void> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME not configured");
  }

  const s3 = initializeS3Client();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  await s3.send(command);
}

/**
 * Delete blob from Azure Blob Storage
 */
export async function deleteAzureBlob(fileName: string): Promise<void> {
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME || "uploads";
  const blobServiceClient = getAzureBlobServiceClient();

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(fileName);

  await blobClient.delete();
}

/**
 * Delete file from configured storage provider
 */
export async function deleteStorageObject(fileName: string): Promise<void> {
  const provider = (process.env.STORAGE_PROVIDER || "aws") as StorageProvider;

  if (provider === "aws") {
    return deleteS3Object(fileName);
  } else if (provider === "azure") {
    return deleteAzureBlob(fileName);
  } else {
    throw new Error(`Unsupported storage provider: ${provider}`);
  }
}

/**
 * Generate public download URL (read-only)
 */
export async function generateDownloadUrl(fileName: string): Promise<{
  downloadUrl: string;
  expiresIn: number;
}> {
  const provider = (process.env.STORAGE_PROVIDER || "aws") as StorageProvider;

  if (provider === "aws") {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) throw new Error("AWS_S3_BUCKET_NAME not configured");

    const s3 = initializeS3Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    const downloadUrl = await getSignedUrl(s3, command, {
      expiresIn: 86400, // 24 hours
    });

    return {
      downloadUrl,
      expiresIn: 86400,
    };
  } else if (provider === "azure") {
    const containerName = process.env.AZURE_BLOB_CONTAINER_NAME || "uploads";
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (!accountName || !accountKey) {
      throw new Error("Azure credentials not configured");
    }

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    const credential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: fileName,
        permissions: BlobSASPermissions.parse("r"), // read-only
        expiresOn: expiryDate,
      },
      credential
    );

    const downloadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;

    return {
      downloadUrl,
      expiresIn: 86400,
    };
  } else {
    throw new Error(`Unsupported storage provider: ${provider}`);
  }
}
