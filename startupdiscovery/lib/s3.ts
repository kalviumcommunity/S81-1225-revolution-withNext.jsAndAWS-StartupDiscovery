/**
 * AWS S3 Client Configuration and Utilities
 * Provides S3 client initialization and pre-signed URL generation
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Logger } from "./logger";

const logger = new Logger("S3Client");

// Get environment variables with fallback values
function getS3Config() {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    region: process.env.AWS_REGION || "ap-south-1",
    bucketName: process.env.AWS_BUCKET_NAME || "startupdiscovery-files",
    uploadExpiry: parseInt(process.env.AWS_S3_UPLOAD_EXPIRY || "3600", 10),
  };
}

// Singleton S3 client instance
let s3Client: S3Client | null = null;

/**
 * Get or create S3 client instance
 */
function getS3Client(): S3Client {
  if (s3Client) {
    return s3Client;
  }

  const config = getS3Config();

  if (!config.accessKeyId || !config.secretAccessKey) {
    logger.warn(
      "AWS credentials not configured. S3 operations will fail in production.",
      {
        hasAccessKey: !!config.accessKeyId,
        hasSecretKey: !!config.secretAccessKey,
      }
    );
  }

  s3Client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  logger.info("S3 client initialized", { region: config.region });
  return s3Client;
}

/**
 * Generate a pre-signed URL for file upload
 * Used to allow direct uploads to S3 without exposing credentials
 */
export async function generateUploadPresignedUrl(
  filename: string,
  fileType: string,
  fileSize?: number
): Promise<string> {
  try {
    const config = getS3Config();
    const client = getS3Client();

    // Generate unique key with timestamp to avoid collisions
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const key = `uploads/${timestamp}-${randomString}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      ContentType: fileType,
      ...(fileSize && { ContentLength: fileSize }),
      // Allow public read access
      ACL: "public-read",
      // Add metadata for tracking
      Metadata: {
        "uploaded-at": new Date().toISOString(),
        "original-filename": filename,
      },
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: config.uploadExpiry,
    });

    logger.info("Pre-signed upload URL generated", {
      key,
      fileType,
      expiresIn: config.uploadExpiry,
    });

    return uploadUrl;
  } catch (error) {
    logger.error(
      "Failed to generate pre-signed URL",
      error instanceof Error ? error : undefined,
      {
        error: error instanceof Error ? error.message : String(error),
        filename,
        fileType,
      }
    );
    throw error;
  }
}

/**
 * Generate a pre-signed URL for file download/access
 */
export async function generateDownloadPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const config = getS3Config();
    const client = getS3Client();

    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(client, command, {
      expiresIn,
    });

    logger.info("Pre-signed download URL generated", { key, expiresIn });
    return downloadUrl;
  } catch (error) {
    logger.error(
      "Failed to generate download URL",
      error instanceof Error ? error : undefined,
      {
        error: error instanceof Error ? error.message : String(error),
        key,
      }
    );
    throw error;
  }
}

/**
 * Get public S3 file URL for a key
 */
export function getPublicS3Url(key: string): string {
  const config = getS3Config();
  return `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
}

/**
 * Validate file type against allowed types
 */
export function isAllowedFileType(fileType: string): boolean {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // Videos
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ];

  return allowedTypes.includes(fileType);
}

/**
 * Validate file size (default 50MB)
 */
export function isAllowedFileSize(
  fileSize: number,
  maxSizeMB: number = 50
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize > 0 && fileSize <= maxSizeBytes;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Close S3 client connection
 */
export async function closeS3Client(): Promise<void> {
  if (s3Client) {
    s3Client.destroy();
    s3Client = null;
    logger.info("S3 client connection closed");
  }
}

/**
 * S3 URL components interface for parsing URLs
 */
export interface S3UrlComponents {
  bucket: string;
  region: string;
  key: string;
}

/**
 * Parse S3 URL to extract components
 */
export function parseS3Url(url: string): S3UrlComponents | null {
  try {
    // Handle both virtual-hosted-style and path-style URLs
    // Virtual-hosted: https://bucket.s3.region.amazonaws.com/key
    // Path-style: https://s3.region.amazonaws.com/bucket/key

    if (url.includes(".s3.")) {
      // Virtual-hosted style
      const match = url.match(
        /https:\/\/([a-z0-9.-]+)\.s3\.([a-z0-9-]+)\.amazonaws\.com\/(.*)/
      );
      if (match) {
        return {
          bucket: match[1],
          region: match[2],
          key: decodeURIComponent(match[3]),
        };
      }
    } else {
      // Path-style
      const match = url.match(
        /https:\/\/s3\.([a-z0-9-]+)\.amazonaws\.com\/([a-z0-9.-]+)\/(.*)/
      );
      if (match) {
        return {
          bucket: match[2],
          region: match[1],
          key: decodeURIComponent(match[3]),
        };
      }
    }

    return null;
  } catch (error) {
    logger.error(
      "Failed to parse S3 URL",
      error instanceof Error ? error : undefined,
      {
        url,
      }
    );
    return null;
  }
}
