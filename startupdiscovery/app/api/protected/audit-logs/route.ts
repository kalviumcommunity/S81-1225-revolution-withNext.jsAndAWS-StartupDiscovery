import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import {
  UserRole,
  Action,
  enforcePermission,
  PermissionDeniedError,
  getAuditLogs,
  getAuditSummary,
  getHighRiskActivities,
} from "@/lib/rbac";
import { verifyAccessToken } from "@/lib/auth";

/**
 * GET /api/protected/audit-logs
 * Get all audit logs (Admin/Moderator only)
 * Query params:
 *   - userId?: number - Filter by user ID
 *   - action?: string - Filter by action
 *   - result?: "ALLOWED" | "DENIED" - Filter by result
 *   - limit?: number - Number of records to return (default: 100)
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
        Action.MANAGE_ROLES,
        "audit_logs"
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to view audit logs",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    // Parse query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId")
      ? parseInt(url.searchParams.get("userId")!)
      : undefined;
    const actionParam = url.searchParams.get("action");
    const action = actionParam as Action | undefined;
    const result =
      (url.searchParams.get("result") as "ALLOWED" | "DENIED") || undefined;
    const limit = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit")!)
      : 100;

    // Get audit logs with filters
    const logs = getAuditLogs({
      userId,
      action,
      result,
    });

    // Return limited results
    const limitedLogs = logs.slice(0, Math.max(1, Math.min(limit, 1000)));

    return sendSuccess(
      {
        logs: limitedLogs,
        total: logs.length,
        returned: limitedLogs.length,
      },
      "Audit logs retrieved successfully",
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error retrieving audit logs:", error.message);
    }

    return sendError(
      "Failed to retrieve audit logs",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * POST /api/protected/audit-logs/summary
 * Get audit log summary statistics (Admin/Moderator only)
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
        Action.MANAGE_ROLES,
        "audit_logs"
      );
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        return sendError(
          "You do not have permission to view audit logs",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
      throw error;
    }

    // Get summary statistics
    const summary = getAuditSummary();

    // Get high-risk activities
    const highRiskActivities = getHighRiskActivities();

    return sendSuccess(
      {
        summary,
        highRiskActivities,
      },
      "Audit summary retrieved successfully",
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error retrieving audit summary:", error.message);
    }

    return sendError(
      "Failed to retrieve audit summary",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
