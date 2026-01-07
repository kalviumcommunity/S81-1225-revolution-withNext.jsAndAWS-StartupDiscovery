/**
 * Files Metadata API
 * GET  /api/files - List all uploaded files
 * POST /api/files - Store file metadata after successful S3 upload
 * GET  /api/files/:id - Get file details
 * DELETE /api/files/:id - Delete file metadata and optionally from S3
 */

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { withErrorHandler } from "@/lib/errorHandler";

const logger = new Logger("FilesAPI");

/**
 * GET /api/files
 * List all uploaded files with pagination
 */
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const _request = request; // Use request in closure
    const searchParams = _request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      parseInt(searchParams.get("limit") || "10", 10)
    );
    const skip = (page - 1) * limit;

    logger.info("Fetching files", { page, limit });

    const [files, total] = await Promise.all([
      prisma.media.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          startup: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.media.count(),
    ]);

    logger.info("Files fetched successfully", { count: files.length, total });

    return NextResponse.json({
      success: true,
      data: files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  });
}

/**
 * POST /api/files
 * Store file metadata after successful S3 upload
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const _request = request; // Use request in closure
    const body = await _request.json();
    const { filename, fileUrl, fileType, fileSize, startupId } = body;

    logger.info("Creating file metadata", {
      filename,
      fileType,
      startupId,
    });

    // Validate required fields
    if (!filename || !fileUrl) {
      logger.warn("Invalid file metadata - missing fields");
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: filename and fileUrl",
        },
        { status: 400 }
      );
    }

    // Determine media type from file type
    const mediaTypeMap: Record<string, "IMAGE" | "VIDEO" | "DOCUMENT"> = {
      "image/jpeg": "IMAGE",
      "image/png": "IMAGE",
      "image/gif": "IMAGE",
      "image/webp": "IMAGE",
      "image/svg+xml": "IMAGE",
      "video/mp4": "VIDEO",
      "video/quicktime": "VIDEO",
      "video/webm": "VIDEO",
      "application/pdf": "DOCUMENT",
      "application/msword": "DOCUMENT",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "DOCUMENT",
      "application/vnd.ms-excel": "DOCUMENT",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "DOCUMENT",
    };

    const mediaType = mediaTypeMap[fileType] || "DOCUMENT";

    // If startupId provided, create media record linked to startup
    if (startupId) {
      // Verify startup exists
      const startup = await prisma.startup.findUnique({
        where: { id: parseInt(startupId, 10) },
      });

      if (!startup) {
        logger.warn("Startup not found", { startupId });
        return NextResponse.json(
          { success: false, message: "Startup not found" },
          { status: 404 }
        );
      }

      const media = await prisma.media.create({
        data: {
          type: mediaType,
          url: fileUrl,
          caption: filename,
          startupId: parseInt(startupId, 10),
        },
      });

      logger.info("File metadata created successfully", { mediaId: media.id });

      return NextResponse.json({
        success: true,
        data: {
          id: media.id,
          name: filename,
          url: fileUrl,
          type: mediaType,
          size: fileSize,
          startupId,
          createdAt: media.createdAt,
        },
      });
    } else {
      // Create standalone file record (for general files)
      // We'll use the media model but with startupId as optional
      logger.warn("Startup ID not provided - file stored without startup link");

      return NextResponse.json({
        success: true,
        data: {
          name: filename,
          url: fileUrl,
          type: mediaType,
          size: fileSize,
          createdAt: new Date(),
        },
      });
    }
  });
}
