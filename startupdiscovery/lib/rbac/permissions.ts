/**
 * Permission Checker Utilities
 * Core functions for checking access control
 */

import { UserRole, Action, hasPermission } from "./roles";
import { logAuditEvent } from "./auditLog";

export interface PermissionCheckContext {
  userId: number | string;
  userEmail: string;
  userRole: UserRole;
  ipAddress?: string;
  userAgent?: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a user has permission to perform an action
 */
export function checkPermission(
  context: PermissionCheckContext,
  action: Action,
  resourceType: string,
  resourceId?: string | number
): PermissionCheckResult {
  const hasAccess = hasPermission(context.userRole, action);

  // Log the access attempt
  logAuditEvent({
    userId: context.userId,
    userEmail: context.userEmail,
    userRole: context.userRole,
    action,
    resource: resourceType,
    resourceId,
    result: hasAccess ? "ALLOWED" : "DENIED",
    reason: hasAccess
      ? undefined
      : `Role ${context.userRole} does not have ${action} permission`,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    timestamp: new Date(),
  });

  return {
    allowed: hasAccess,
    reason: hasAccess
      ? undefined
      : `Insufficient permissions for action: ${action}`,
  };
}

/**
 * Check ownership (for operations like updating own profile or deleting own posts)
 * Returns true if the user is the owner of the resource
 */
export function isOwner(
  userId: number | string,
  resourceOwnerId: number | string
): boolean {
  return userId === resourceOwnerId;
}

/**
 * Check if user has permission AND is the owner (for update/delete of own resources)
 */
export function checkOwnerPermission(
  context: PermissionCheckContext,
  action: Action,
  resourceType: string,
  resourceId: string | number,
  resourceOwnerId: number | string
): PermissionCheckResult {
  // First check base permission
  const baseCheck = checkPermission(context, action, resourceType, resourceId);

  if (!baseCheck.allowed) {
    return baseCheck;
  }

  // For certain actions, also check ownership
  const ownershipRequiredActions = [
    Action.UPDATE_USER,
    Action.UPDATE_STARTUP,
    Action.UPDATE_COMMENT,
  ];

  if (ownershipRequiredActions.includes(action)) {
    const isUserOwner = isOwner(context.userId, resourceOwnerId);

    // Admins and moderators can always manage
    if (
      context.userRole === UserRole.ADMIN ||
      context.userRole === UserRole.MODERATOR
    ) {
      return { allowed: true };
    }

    // Others must be the owner
    if (!isUserOwner) {
      logAuditEvent({
        userId: context.userId,
        userEmail: context.userEmail,
        userRole: context.userRole,
        action,
        resource: resourceType,
        resourceId,
        result: "DENIED",
        reason: `User is not the owner of this resource`,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date(),
      });

      return {
        allowed: false,
        reason: `You can only ${action} your own ${resourceType}`,
      };
    }
  }

  return baseCheck;
}

/**
 * Enforce permission check - throws error if not allowed
 * Used in API routes
 */
export function enforcePermission(
  context: PermissionCheckContext,
  action: Action,
  resourceType: string,
  resourceId?: string | number
): void {
  const result = checkPermission(context, action, resourceType, resourceId);

  if (!result.allowed) {
    throw new PermissionDeniedError(result.reason || "Permission denied");
  }
}

/**
 * Enforce owner permission check - throws error if not allowed
 * Used in API routes for updating own resources
 */
export function enforceOwnerPermission(
  context: PermissionCheckContext,
  action: Action,
  resourceType: string,
  resourceId: string | number,
  resourceOwnerId: number | string
): void {
  const result = checkOwnerPermission(
    context,
    action,
    resourceType,
    resourceId,
    resourceOwnerId
  );

  if (!result.allowed) {
    throw new PermissionDeniedError(result.reason || "Permission denied");
  }
}

/**
 * Custom error for permission denied
 */
export class PermissionDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

/**
 * Utility to check multiple permissions (all must be allowed)
 */
export function checkAllPermissions(
  context: PermissionCheckContext,
  actions: Action[],
  resourceType: string
): PermissionCheckResult {
  for (const action of actions) {
    const result = checkPermission(context, action, resourceType);
    if (!result.allowed) {
      return result;
    }
  }

  return { allowed: true };
}

/**
 * Utility to check any permission (at least one must be allowed)
 */
export function checkAnyPermission(
  context: PermissionCheckContext,
  actions: Action[],
  resourceType: string
): PermissionCheckResult {
  for (const action of actions) {
    const result = checkPermission(context, action, resourceType);
    if (result.allowed) {
      return result;
    }
  }

  return {
    allowed: false,
    reason: `User does not have any of the required permissions`,
  };
}
