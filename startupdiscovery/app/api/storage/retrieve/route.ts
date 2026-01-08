/**
 * API Route: Retrieve File Metadata
 * GET /api/storage/retrieve
 *
 * Gets file metadata and download URL for accessing stored files
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getS3ObjectMetadata,
  getAzureBlobMetadata,
} from "@/lib/storage/uploadUtils";
import { applySecureHeaders } from "@/lib/security/secureHeaders";
import { loadStorageConfig } from "@/lib/storage/storageClient";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Extract file key parameter
    const { searchParams } = req.nextUrl;
    const fileKey = searchParams.get("key");

    if (!fileKey) {
      const response = NextResponse.json(
        { error: "Missing required parameter: key" },
        { status: 400 }
      );
      return applySecureHeaders(response);
    }

    // Validate file key format
    if (fileKey.includes("..") || fileKey.includes("/")) {
      const response = NextResponse.json(
        { error: "Invalid file key format" },
        { status: 400 }
      );
      return applySecureHeaders(response);
    }

    // Get storage config
    const config = loadStorageConfig();

    // Retrieve file metadata based on provider
    let metadata;
    if (config.provider === "aws") {
      metadata = await getS3ObjectMetadata(fileKey);
    } else if (config.provider === "azure") {
      metadata = await getAzureBlobMetadata(fileKey);
    } else {
      const response = NextResponse.json(
        { error: `Unsupported storage provider: ${config.provider}` },
        { status: 500 }
      );
      return applySecureHeaders(response);
    }

    // Extract filename from key
    const fileName = fileKey.split("/").pop() || fileKey;

    const responseData = {
      fileName,
      fileKey,
      size: metadata.size,
      contentType: metadata.contentType,
      downloadUrl: metadata.url,
      uploadedAt: metadata.lastModified.toISOString(),
      provider: config.provider,
    };

    const response = NextResponse.json(responseData, { status: 200 });
    return applySecureHeaders(response);
  } catch (error: unknown) {
    console.error("File retrieval error:", error);

    // Handle not found errors
    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve file";

    if (
      errorMessage.includes("NoSuchKey") ||
      errorMessage.includes("BlobNotFound")
    ) {
      const response = NextResponse.json(
        {
          error: "File not found",
          code: "FILE_NOT_FOUND",
        },
        { status: 404 }
      );
      return applySecureHeaders(response);
    }

    const response = NextResponse.json(
      {
        error: errorMessage,
        code: "RETRIEVAL_ERROR",
      },
      { status: 500 }
    );
    return applySecureHeaders(response);
  }
}

// Options handler for CORS preflight
export async function OPTIONS(_req: NextRequest): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 200 });
  return applySecureHeaders(response);
}
