import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import {
  userCreateSchema,
  userUpdateSchema,
  userDeleteSchema,
} from "@/lib/schemas/userSchema";
import { validateAuthHeader } from "@/lib/auth";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";

// Authentication helper with JWT verification and role retrieval
function checkAuth(req: Request): {
  authorized: boolean;
  userId?: number;
  email?: string;
  role?: string;
} {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authorized: false };
  }

  try {
    const userData = validateAuthHeader(authHeader);

    if (!userData) {
      // Invalid or expired JWT token
      return { authorized: false };
    }

    return {
      authorized: true,
      userId: userData.userId,
      email: userData.email,
      role: userData.role, // Include role from token
    };
  } catch {
    return { authorized: false };
  }
}

/**
 * GET /api/users
 * Retrieve all users (requires JWT authentication)
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - role: Filter by role (optional)
 * - search: Search by name or email (optional)
 */
export async function GET(req: Request) {
  // Require authentication to view user list
  const auth = checkAuth(req);
  if (!auth.authorized || !auth.userId) {
    return sendError(
      "Unauthorized. Valid JWT authentication required.",
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 100);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return sendError(
        "Invalid pagination parameters",
        ERROR_CODES.INVALID_PAGINATION,
        400
      );
    }

    // Build Prisma where clause
    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count and paginated results
    const [totalItems, userList] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return sendSuccess(
      {
        users: userList,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Users fetched successfully"
    );
  } catch (error) {
    console.error("Get users error:", error);
    return sendError("Failed to fetch users", ERROR_CODES.INTERNAL_ERROR, 500);
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 * Body: { name: string, email: string, age?: number }
 * Note: Use /api/auth/signup for self-registration with password
 */
export async function POST(req: Request) {
  // Require authentication
  const auth = checkAuth(req);
  if (!auth.authorized || !auth.userId) {
    return sendError(
      "Unauthorized. Authentication required.",
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }

  // Require ADMIN role
  if (auth.role !== "ADMIN") {
    return sendError(
      "Forbidden. Only administrators can create user accounts.",
      ERROR_CODES.FORBIDDEN,
      403
    );
  }

  try {
    const body = await req.json();

    // Validate input with Zod schema
    const data = userCreateSchema.parse(body);

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return sendError(
        "Email already in use",
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        409
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.email.split("@")[0],
        passwordHash: "", // No password for admin-created users
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return sendSuccess({ user: newUser }, "User created successfully", 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(error);
    }
    console.error("Create user error:", error);
    return sendError(
      "Failed to create user",
      ERROR_CODES.INVALID_REQUEST_BODY,
      400
    );
  }
}

/**
 * PUT /api/users
 * Update an existing user
 * Body: { id: number, name?: string, email?: string, age?: number }
 * Users can only update their own profile
 */
export async function PUT(req: Request) {
  // Require authentication
  const auth = checkAuth(req);
  if (!auth.authorized || !auth.userId) {
    return sendError(
      "Unauthorized. Authentication required.",
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }

  try {
    const body = await req.json();

    // Validate input with Zod schema
    const data = userUpdateSchema.parse(body);

    // Users can only update their own profile
    if (data.id !== auth.userId) {
      return sendError(
        "Forbidden. You can only update your own profile.",
        ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        403
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: data.id },
    });

    if (!user) {
      return sendError("User not found", ERROR_CODES.RESOURCE_NOT_FOUND, 404);
    }

    // Check for duplicate email
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return sendError(
          "Email already in use",
          ERROR_CODES.EMAIL_ALREADY_EXISTS,
          409
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.age !== undefined) updateData.age = data.age;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: data.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return sendSuccess({ user: updatedUser }, "User updated successfully");
  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(error);
    }
    console.error("Update user error:", error);
    return sendError(
      "Failed to update user",
      ERROR_CODES.INVALID_REQUEST_BODY,
      400
    );
  }
}

/**
 * DELETE /api/users
 * Delete a user
 * Body: { id: number }
 * Users can only delete their own account
 */
export async function DELETE(req: Request) {
  // Require authentication
  const auth = checkAuth(req);
  if (!auth.authorized || !auth.userId) {
    return sendError(
      "Unauthorized. Authentication required.",
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }

  try {
    const body = await req.json();

    // Validate input with Zod schema
    const data = userDeleteSchema.parse(body);

    // Users can only delete their own account
    if (data.id !== auth.userId) {
      return sendError(
        "Forbidden. You can only delete your own account.",
        ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        403
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: data.id },
    });

    if (!user) {
      return sendError("User not found", ERROR_CODES.RESOURCE_NOT_FOUND, 404);
    }

    // Delete user
    const deletedUser = await prisma.user.delete({
      where: { id: data.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return sendSuccess({ user: deletedUser }, "User deleted successfully");
  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(error);
    }
    console.error("Delete user error:", error);
    return sendError(
      "Failed to delete user",
      ERROR_CODES.INVALID_REQUEST_BODY,
      400
    );
  }
}
