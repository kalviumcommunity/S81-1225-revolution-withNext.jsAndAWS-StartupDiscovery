import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import {
  UserRole,
  Action,
  enforcePermission,
  enforceOwnerPermission,
  PermissionDeniedError,
} from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
  startupId: z.number().int().positive(),
});

/**
 * POST /api/protected/comments
 * Create a new comment on a startup (User role and above)
 */
export async function POST(req: Request) {
  try {
    // Extract and verify access token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : req.headers.get("cookie")?.split("accessToken=")[1]?.split(";")[0];

    if (!token) {
      return sendError(
        "Authentication required",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return sendError(
        "Invalid or expired token",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    const body = await req.json();
    const validatedData = createCommentSchema.parse(body);

    // Get IP for audit logging
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Check permission
    try {
      enforcePermission(
        {
          userId: decoded.userId,
          userEmail: decoded.email,
          userRole: decoded.role as UserRole,
          ipAddress,
          userAgent,
        },
        Action.CREATE_COMMENT,
        "comment"
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to create comments",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    // Verify startup exists
    const startup = await prisma.startup.findUnique({
      where: { id: validatedData.startupId },
    });

    if (!startup) {
      return sendError("Startup not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        startupId: validatedData.startupId,
        userId: decoded.userId,
      },
    });

    return sendSuccess({ comment }, "Comment created successfully", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(error);
    }

    if (error instanceof Error) {
      console.error("Error creating comment:", error.message);
    }

    return sendError(
      "Failed to create comment",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * DELETE /api/protected/comments/[id]
 * Delete a comment (Own comment or Moderator+)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and verify access token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : req.headers.get("cookie")?.split("accessToken=")[1]?.split(";")[0];

    if (!token) {
      return sendError(
        "Authentication required",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return sendError(
        "Invalid or expired token",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    const commentId = parseInt(params.id);
    if (isNaN(commentId)) {
      return sendError("Invalid comment ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Get IP for audit logging
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Get comment to check ownership
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return sendError("Comment not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Check permission (owner can delete or moderator+)
    try {
      enforceOwnerPermission(
        {
          userId: decoded.userId,
          userEmail: decoded.email,
          userRole: decoded.role as UserRole,
          ipAddress,
          userAgent,
        },
        Action.DELETE_COMMENT,
        "comment",
        commentId,
        comment.userId
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to delete this comment",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return sendSuccess(
      { message: "Comment deleted successfully" },
      "Comment deleted",
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting comment:", error.message);
    }

    return sendError(
      "Failed to delete comment",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
