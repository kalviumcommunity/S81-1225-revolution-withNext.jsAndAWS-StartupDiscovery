/**
 * File Upload API - Generate Pre-Signed URL
 * POST /api/upload
 *
 * Request body:
 * {
 *   "filename": "profile.png",
 *   "fileType": "image/png",
 *   "fileSize": 1024000
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "uploadUrl": "https://...",
 *   "key": "uploads/1234567-abcdef-filename.png",
 *   "expiresIn": 3600
 * }
 */

import { NextResponse, NextRequest } from "next/server";
import { Logger } from "@/lib/logger";
import { withErrorHandler } from "@/lib/errorHandler";
import {
  generateUploadPresignedUrl,
  isAllowedFileType,
  isAllowedFileSize,
} from "@/lib/s3";

const logger = new Logger("FileUploadAPI");

// Configuration
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "video/mp4",
];

/**
 * POST /api/upload
 * Generate a pre-signed URL for direct S3 upload
 */
export const POST = withErrorHandler(async (req: Request) => {
  const request = req as NextRequest;
  const requestId = request.headers.get("x-request-id") || "";

  // Parse request body
  const body = await request.json();
  const { filename, fileType, fileSize } = body;

    logger.info("File upload request received", {
      filename,
      fileType,
      fileSize,
      requestId,
    });

    // Validate inputs
    if (!filename || !fileType) {
      logger.warn("Invalid upload request - missing fields", {
        hasFilename: !!filename,
        hasFileType: !!fileType,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: filename and fileType",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isAllowedFileType(fileType)) {
      logger.warn("File type not allowed", { fileType });
      return NextResponse.json(
        {
          success: false,
          message: `File type '${fileType}' is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size if provided
    if (fileSize && !isAllowedFileSize(fileSize, 50)) {
      logger.warn("File size exceeds limit", {
        fileSize,
        maxSize: MAX_FILE_SIZE,
      });
      return NextResponse.json(
        {
          success: false,
          message: `File size must be less than 50MB. Received: ${(fileSize / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    // Generate pre-signed URL
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const key = `uploads/${timestamp}-${randomString}-${filename}`;

    const uploadUrl = await generateUploadPresignedUrl(
      filename,
      fileType,
      fileSize
    );

    logger.info("Pre-signed URL generated successfully", {
      key,
      fileType,
      requestId,
    });

    return NextResponse.json(
      {
        success: true,
        uploadUrl,
        key,
        expiresIn: 3600,
        bucket: process.env.AWS_BUCKET_NAME,
        region: process.env.AWS_REGION,
      },
      { status: 200 }
    );
});

/**
 * OPTIONS /api/upload
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
