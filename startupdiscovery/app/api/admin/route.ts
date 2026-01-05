import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin
 * Admin dashboard data - shows system statistics and user management info
 * Only accessible to ADMIN role users
 */
export async function GET(req: Request) {
  try {
    // Get user info from middleware headers
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== "ADMIN") {
      return sendError(
        "Unauthorized access to admin panel",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Get admin statistics
    const [totalUsers, adminCount, moderatorCount, userCount, totalStartups] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { role: "MODERATOR" } }),
        prisma.user.count({ where: { role: "USER" } }),
        prisma.startup.count(),
      ]);

    // Get recent users
    const recentUsers = await prisma.user.findMany({
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
      take: 10,
    });

    return sendSuccess(
      {
        statistics: {
          totalUsers,
          usersByRole: {
            ADMIN: adminCount,
            MODERATOR: moderatorCount,
            USER: userCount,
          },
          totalStartups,
        },
        recentUsers,
        timestamp: new Date().toISOString(),
      },
      "Admin dashboard data retrieved successfully",
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Admin dashboard error:", error.message);
    }

    return sendError(
      "Failed to retrieve admin dashboard data",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * POST /api/admin/users/:userId/role
 * Change user role - admin only
 */
export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userRole = req.headers.get("x-user-role");

    if (userRole !== "ADMIN") {
      return sendError(
        "Unauthorized. Only admins can manage user roles.",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    const body = await req.json();
    const { newRole } = body;

    if (!newRole || !["USER", "ADMIN", "MODERATOR"].includes(newRole)) {
      return sendError(
        "Invalid role provided",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    const userId = parseInt(params.userId, 10);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
      },
    });

    return sendSuccess(updatedUser, `User role updated to ${newRole}`, 200);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Role update error:", error.message);
    }

    return sendError(
      "Failed to update user role",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
