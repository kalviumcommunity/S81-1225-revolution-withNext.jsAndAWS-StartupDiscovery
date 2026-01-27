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
  PermissionDeniedError,
  canManageRole,
} from "@/lib/rbac";
import { sanitizeNumber, validateInput } from "@/lib/security";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { z } from "zod";

const updateRoleSchema = z.object({
  userId: z.number().int().positive(),
  newRole: z.enum(["USER", "ADMIN", "MODERATOR"]),
});

/**
 * PATCH /api/protected/roles
 * Update a user's role (Admin only)
 * Body:
 *   - userId: number - User ID to update
 *   - newRole: UserRole - New role to assign
 */
export async function PATCH(req: Request) {
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
    const validatedData = updateRoleSchema.parse(body);

    // Sanitize userId input
    const sanitizedUserId = sanitizeNumber(validatedData.userId);
    if (sanitizedUserId === null) {
      return sendError("Invalid user ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Validate role is in allowed set
    const validation = validateInput(validatedData.newRole, {
      required: true,
      pattern: /^(USER|ADMIN|MODERATOR)$/,
    });

    if (!validation.valid) {
      return sendError(validation.message, ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Get IP for audit logging
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    const userRole = decoded.role as UserRole;

    // Check permission (Admin only)
    try {
      enforcePermission(
        {
          userId: decoded.userId,
          userEmail: decoded.email,
          userRole,
          ipAddress,
          userAgent,
        },
        Action.MANAGE_ROLES,
        "user",
        validatedData.userId
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to manage roles",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    // Check if user can manage this specific role
    const newRole = validatedData.newRole as UserRole;
    if (!canManageRole(userRole, newRole)) {
      return sendError(
        "You cannot assign a role equal to or higher than your own",
        ERROR_CODES.FORBIDDEN,
        403
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: sanitizedUserId },
    });

    if (!targetUser) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Prevent downgrading the last admin
    if (targetUser.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount === 1) {
        return sendError(
          "Cannot demote the last admin user",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: { role: validatedData.newRole },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sendSuccess(
      { user: updatedUser },
      `User role updated to ${newRole} successfully`,
      200
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(error);
    }

    if (error instanceof Error) {
      console.error("Error updating user role:", error.message);
    }

    return sendError(
      "Failed to update user role",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * GET /api/protected/roles
 * Get all users and their roles (Admin/Moderator only)
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

    // Check permission (Admin/Moderator only)
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
        "user"
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

    // Get all users with their roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            startups: true,
            comments: true,
          },
        },
      },
      orderBy: {
        role: "asc",
      },
    });

    return sendSuccess(
      {
        users: users.map((user: any) => ({
          ...user,
          startupCount: user._count.startups,
          commentCount: user._count.comments,
        })),
        total: users.length,
      },
      "Users retrieved successfully",
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error retrieving users:", error.message);
    }

    return sendError(
      "Failed to retrieve users",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
