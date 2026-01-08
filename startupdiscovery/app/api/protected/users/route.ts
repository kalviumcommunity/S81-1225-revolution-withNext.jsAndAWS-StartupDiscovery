import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import {
  UserRole,
  Action,
  enforcePermission,
  PermissionDeniedError,
} from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

/**
 * GET /api/protected/users
 * List all users (Admin/Moderator only)
 */
export async function GET(req: Request) {
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

    // Get IP for audit logging
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Check permission with audit logging
    try {
      enforcePermission(
        {
          userId: decoded.userId,
          userEmail: decoded.email,
          userRole: decoded.role as UserRole,
          ipAddress,
          userAgent,
        },
        Action.READ_USER,
        "users"
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to view users",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    // Fetch users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(
      { users, count: users.length },
      "Users retrieved successfully",
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching users:", error.message);
    }

    return sendError("Failed to fetch users", ERROR_CODES.INTERNAL_ERROR, 500);
  }
}

/**
 * DELETE /api/protected/users/[id]
 * Delete a user (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await params;
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

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return sendError("Invalid user ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Get IP for audit logging
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Check permission with audit logging
    try {
      enforcePermission(
        {
          userId: decoded.userId,
          userEmail: decoded.email,
          userRole: decoded.role as UserRole,
          ipAddress,
          userAgent,
        },
        Action.DELETE_USER,
        "user",
        userId
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to delete users",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    // Delete user
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return sendSuccess({ user: deletedUser }, "User deleted successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
      }
      console.error("Error deleting user:", error.message);
    }

    return sendError("Failed to delete user", ERROR_CODES.INTERNAL_ERROR, 500);
  }
}
