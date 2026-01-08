/**
 * API Route: Delete File
 * DELETE /api/storage/delete
 *
 * Deletes a file from cloud storage (requires authentication)
 */

import { NextRequest, NextResponse } from "next/server";
import { deleteStorageObject } from "@/lib/storage/uploadUtils";
import { applySecureHeaders } from "@/lib/security/secureHeaders";

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Extract authentication from JWT token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      return applySecureHeaders(response);
    }

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

    // Delete file from storage
    await deleteStorageObject(fileKey);

    const responseData = {
      success: true,
      message: "File deleted successfully",
      fileKey,
    };

    const response = NextResponse.json(responseData, { status: 200 });
    return applySecureHeaders(response);
  } catch (error: unknown) {
    console.error("File deletion error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to delete file";

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

    // Check for permission errors
    if (
      message.includes("AccessDenied") ||
      message.includes("Forbidden") ||
      message.includes("authorization")
    ) {
      const response = NextResponse.json(
        {
          error: "Permission denied",
          code: "PERMISSION_DENIED",
        },
        { status: 403 }
      );
      return applySecureHeaders(response);
    }

    const response = NextResponse.json(
      {
        error: message,
        code: "DELETION_ERROR",
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
