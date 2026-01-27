/**
 * API Route: Storage Info/Status
 * GET /api/storage/status
 *
 * Returns storage configuration and status information
 */

import { NextResponse } from "next/server";
import { getStorageInfo, loadStorageConfig } from "@/lib/storage/storageClient";
import { applySecureHeaders } from "@/lib/security/secureHeaders";
import { formatFileSize } from "@/lib/storage/fileValidation";

export async function GET(): Promise<NextResponse> {
  try {
    // Get storage info
    const storageInfo = getStorageInfo();
    const config = loadStorageConfig();

    const responseData = {
      status: "configured",
      provider: storageInfo.provider,
      configured: storageInfo.configured,
      config: {
        maxFileSize: formatFileSize(config.maxFileSize),
        maxFileSizeBytes: config.maxFileSize,
        allowedMimeTypes: config.allowedMimeTypes,
        presignedUrlExpiry: `${config.presignedUrlExpiry} seconds`,
      },
      details: storageInfo,
      timestamp: new Date().toISOString(),
    };

    const response = NextResponse.json(responseData, { status: 200 });
    return applySecureHeaders(response);
  } catch (error: unknown) {
    console.error("Storage status error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to get storage status";

    const responseData = {
      status: "error",
      error: message,
      timestamp: new Date().toISOString(),
    };

    const response = NextResponse.json(responseData, { status: 500 });
    return applySecureHeaders(response);
  }
}

// Options handler for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 200 });
  return applySecureHeaders(response);
}
