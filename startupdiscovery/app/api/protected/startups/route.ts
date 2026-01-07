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

const createStartupSchema = z.object({
  title: z.string().min(3).max(100),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  tagline: z.string().min(5).max(255),
  description: z.string().min(10).max(1000),
  websiteUrl: z.string().url().optional(),
  industry: z.string().optional(),
});

/**
 * POST /api/protected/startups
 * Create a new startup (Editor/User roles and above)
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
    const validatedData = createStartupSchema.parse(body);

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
        Action.CREATE_STARTUP,
        "startup"
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to create startups",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    // Create startup
    const startup = await prisma.startup.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        tagline: validatedData.tagline,
        description: validatedData.description,
        websiteUrl: validatedData.websiteUrl,
        industry: validatedData.industry || "Other",
        userId: decoded.userId,
        status: "DRAFT",
      },
    });

    return sendSuccess({ startup }, "Startup created successfully", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(error);
    }

    if (error instanceof Error) {
      console.error("Error creating startup:", error.message);
    }

    return sendError(
      "Failed to create startup",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * PATCH /api/protected/startups/[id]
 * Update a startup (Own startup or Moderator+)
 */
export async function PATCH(
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

    const startupId = parseInt(params.id);
    if (isNaN(startupId)) {
      return sendError("Invalid startup ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Get IP for audit logging
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Get startup to check ownership
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
    });

    if (!startup) {
      return sendError("Startup not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Check permission (owner can update or moderator+)
    try {
      enforceOwnerPermission(
        {
          userId: decoded.userId,
          userEmail: decoded.email,
          userRole: decoded.role as UserRole,
          ipAddress,
          userAgent,
        },
        Action.UPDATE_STARTUP,
        "startup",
        startupId,
        startup.userId
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to update this startup",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    const body = await req.json();
    const validatedData = createStartupSchema.partial().parse(body);

    // Update startup
    const updatedStartup = await prisma.startup.update({
      where: { id: startupId },
      data: validatedData,
    });

    return sendSuccess(
      { startup: updatedStartup },
      "Startup updated successfully",
      200
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(error);
    }

    if (error instanceof Error) {
      console.error("Error updating startup:", error.message);
    }

    return sendError(
      "Failed to update startup",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * DELETE /api/protected/startups/[id]
 * Delete a startup (Own startup or Moderator+)
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

    const startupId = parseInt(params.id);
    if (isNaN(startupId)) {
      return sendError("Invalid startup ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Get IP for audit logging
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Get startup to check ownership
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
    });

    if (!startup) {
      return sendError("Startup not found", ERROR_CODES.NOT_FOUND, 404);
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
        Action.DELETE_STARTUP,
        "startup",
        startupId,
        startup.userId
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to delete this startup",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    // Delete startup
    await prisma.startup.delete({
      where: { id: startupId },
    });

    return sendSuccess(
      { message: "Startup deleted successfully" },
      "Startup deleted",
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting startup:", error.message);
    }

    return sendError(
      "Failed to delete startup",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
