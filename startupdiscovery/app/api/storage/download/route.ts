/**
 * API Route: Generate Download URL
 * GET /api/storage/download
 *
 * Generates a time-limited download URL for accessing stored files
 */

import { NextRequest, NextResponse } from "next/server";
import { generateDownloadUrl } from "@/lib/storage/uploadUtils";
import { applySecureHeaders } from "@/lib/security/secureHeaders";

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

    // Validate file key format (prevent directory traversal)
    if (fileKey.includes("..") || fileKey.startsWith("/")) {
      const response = NextResponse.json(
        { error: "Invalid file key format" },
        { status: 400 }
      );
      return applySecureHeaders(response);
    }

    // Generate download URL
    const { downloadUrl, expiresIn } = await generateDownloadUrl(fileKey);

    // Extract filename from key
    const fileName = fileKey.split("/").pop() || fileKey;

    const responseData = {
      downloadUrl,
      fileName,
      fileKey,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };

    const response = NextResponse.json(responseData, { status: 200 });
    return applySecureHeaders(response);
  } catch (error: unknown) {
    console.error("Download URL generation error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate download URL";

    // Check for file not found errors
    if (
      message.includes("NoSuchKey") ||
      message.includes("BlobNotFound") ||
      message.includes("not found")
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
        error: message,
        code: "DOWNLOAD_URL_ERROR",
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
