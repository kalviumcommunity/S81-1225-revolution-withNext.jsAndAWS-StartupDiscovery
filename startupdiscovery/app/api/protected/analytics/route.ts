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
 * GET /api/protected/analytics
 * Get system analytics (Admin only)
 * Includes:
 *   - User statistics
 *   - Startup statistics
 *   - Comment statistics
 *   - Role distribution
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

    // Check permission (Admin only)
    try {
      enforcePermission(
        {
          userId: decoded.userId,
          userEmail: decoded.email,
          userRole: decoded.role as UserRole,
          ipAddress,
          userAgent,
        },
        Action.VIEW_ANALYTICS,
        "analytics"
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to view analytics",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    // Gather analytics data
    const totalUsers = await prisma.user.count();
    const totalStartups = await prisma.startup.count();
    const totalComments = await prisma.comment.count();

    // Role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    });

    // Startups per user (top 5)
    const startupsPerUser = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        _count: {
          select: { startups: true },
        },
      },
      orderBy: {
        startups: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Comments per user (top 5)
    const commentsPerUser = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        comments: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Comments per startup (top 5)
    const commentsPerStartup = await prisma.startup.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        comments: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // User creation trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Startup creation trend (last 30 days)
    const recentStartups = await prisma.startup.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return sendSuccess(
      {
        summary: {
          totalUsers,
          totalStartups,
          totalComments,
          recentUsers30Days: recentUsers,
          recentStartups30Days: recentStartups,
        },
        roleDistribution: roleDistribution.map((item: { role: string; _count: number }) => ({
          role: item.role,
          count: item._count,
        })),
        topStartupCreators: startupsPerUser.map(
          (user): { userId: string; email: string; startupCount: number } => ({
            userId: user.id,
            email: user.email,
            startupCount: user._count.startups,
          })
        ),
        topCommenters: commentsPerUser.map(
          (user): { userId: string; email: string; commentCount: number } => ({
            userId: user.id,
            email: user.email,
            commentCount: user._count.comments,
          })
        ),
        topCommentedStartups: commentsPerStartup.map(
          (startup): { startupId: string; title: string; commentCount: number } => ({
            startupId: startup.id,
            title: startup.title,
            commentCount: startup._count.comments,
          })
        ),
      },
      "Analytics retrieved successfully",
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error retrieving analytics:", error.message);
    }

    return sendError(
      "Failed to retrieve analytics",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
