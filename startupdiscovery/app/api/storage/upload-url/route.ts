/**
 * API Route: Generate Upload URL
 * GET /api/storage/upload-url
 *
 * Generates a presigned URL (AWS S3) or SAS token (Azure Blob)
 * for direct file upload to cloud storage
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validateFile,
  generateSafeFilename,
} from "@/lib/storage/fileValidation";
import { generatePresignedUrl } from "@/lib/storage/uploadUtils";
import { applySecureHeaders } from "@/lib/security/secureHeaders";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Extract and validate query parameters
    const { searchParams } = req.nextUrl;
    const fileName = searchParams.get("fileName");
    const fileType = searchParams.get("fileType");
    const fileSize = searchParams.get("fileSize");

    // Validate required parameters
    if (!fileName) {
      const response = NextResponse.json(
        { error: "Missing required parameter: fileName" },
        { status: 400 }
      );
      return applySecureHeaders(response);
    }

    if (!fileType) {
      const response = NextResponse.json(
        { error: "Missing required parameter: fileType" },
        { status: 400 }
      );
      return applySecureHeaders(response);
    }

    if (!fileSize) {
      const response = NextResponse.json(
        { error: "Missing required parameter: fileSize" },
        { status: 400 }
      );
      return applySecureHeaders(response);
    }

    // Parse file size
    const parsedFileSize = parseInt(fileSize, 10);
    if (isNaN(parsedFileSize) || parsedFileSize <= 0) {
      const response = NextResponse.json(
        { error: "Invalid fileSize: must be a positive number" },
        { status: 400 }
      );
      return applySecureHeaders(response);
    }

    // Validate file
    const validation = validateFile(fileName, fileType, parsedFileSize);
    if (!validation.valid) {
      const response = NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
      return applySecureHeaders(response);
    }

    // Generate safe filename
    const safeFileName = generateSafeFilename(fileName);

    // Generate presigned URL
    const presignedUrl = await generatePresignedUrl(
      safeFileName,
      fileType,
      300 // 5 minute expiry
    );

    const responseData = {
      uploadUrl: presignedUrl.uploadUrl,
      downloadUrl: presignedUrl.downloadUrl,
      expiresIn: presignedUrl.expiresIn,
      provider: presignedUrl.provider,
      fileKey: presignedUrl.fileKey,
    };

    const response = NextResponse.json(responseData, { status: 200 });
    return applySecureHeaders(response);
  } catch (error: unknown) {
    console.error("Upload URL generation error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate upload URL";
    const response = NextResponse.json(
      {
        error: message,
        code: "UPLOAD_URL_ERROR",
      },
      { status: 500 }
    );
    return applySecureHeaders(response);
  }
}

// Options handler for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 200 });
  return applySecureHeaders(response);
}
