/**
 * RBAC (Role-Based Access Control) Module
 * Centralized exports for all RBAC functionality
 */

// Roles and permissions
export {
  UserRole,
  Action,
  rolePermissions,
  roleHierarchy,
  roleDescriptions,
  getRolePermissions,
  hasPermission,
  getManagedRoles,
  canManageRole,
} from "./roles";

// Audit logging
export {
  type AuditLog,
  logAuditEvent,
  getAuditLogs,
  getAuditSummary,
  clearAuditLogs,
  exportAuditLogs,
  getHighRiskActivities,
} from "./auditLog";

// Permission checking
export {
  type PermissionCheckContext,
  type PermissionCheckResult,
  checkPermission,
  isOwner,
  checkOwnerPermission,
  enforcePermission,
  enforceOwnerPermission,
  PermissionDeniedError,
  checkAllPermissions,
  checkAnyPermission,
} from "./permissions";
