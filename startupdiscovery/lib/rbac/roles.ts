/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines user roles, their permissions, and hierarchies
 */

export enum UserRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  EDITOR = "EDITOR",
  USER = "USER",
  VIEWER = "VIEWER",
}

/**
 * Resource Actions that can be performed
 */
export enum Action {
  // User management
  CREATE_USER = "create_user",
  READ_USER = "read_user",
  UPDATE_USER = "update_user",
  DELETE_USER = "delete_user",
  MANAGE_ROLES = "manage_roles",

  // Startup management
  CREATE_STARTUP = "create_startup",
  READ_STARTUP = "read_startup",
  UPDATE_STARTUP = "update_startup",
  DELETE_STARTUP = "delete_startup",
  PUBLISH_STARTUP = "publish_startup",

  // Content management
  CREATE_COMMENT = "create_comment",
  READ_COMMENT = "read_comment",
  UPDATE_COMMENT = "update_comment",
  DELETE_COMMENT = "delete_comment",
  MODERATE_CONTENT = "moderate_content",

  // Analytics and reporting
  VIEW_ANALYTICS = "view_analytics",
  VIEW_REPORTS = "view_reports",
  EXPORT_DATA = "export_data",

  // System operations
  VIEW_AUDIT_LOG = "view_audit_log",
  MANAGE_SETTINGS = "manage_settings",
  VIEW_ADMIN_PANEL = "view_admin_panel",
}

/**
 * Permission mapping: Role -> Array of Actions
 * Defines what each role is allowed to do
 */
export const rolePermissions: Record<UserRole, Action[]> = {
  [UserRole.ADMIN]: [
    // Admin can do everything
    Action.CREATE_USER,
    Action.READ_USER,
    Action.UPDATE_USER,
    Action.DELETE_USER,
    Action.MANAGE_ROLES,
    Action.CREATE_STARTUP,
    Action.READ_STARTUP,
    Action.UPDATE_STARTUP,
    Action.DELETE_STARTUP,
    Action.PUBLISH_STARTUP,
    Action.CREATE_COMMENT,
    Action.READ_COMMENT,
    Action.UPDATE_COMMENT,
    Action.DELETE_COMMENT,
    Action.MODERATE_CONTENT,
    Action.VIEW_ANALYTICS,
    Action.VIEW_REPORTS,
    Action.EXPORT_DATA,
    Action.VIEW_AUDIT_LOG,
    Action.MANAGE_SETTINGS,
    Action.VIEW_ADMIN_PANEL,
  ],

  [UserRole.MODERATOR]: [
    // Moderator can manage content and users
    Action.READ_USER,
    Action.UPDATE_USER,
    Action.CREATE_STARTUP,
    Action.READ_STARTUP,
    Action.UPDATE_STARTUP,
    Action.PUBLISH_STARTUP,
    Action.CREATE_COMMENT,
    Action.READ_COMMENT,
    Action.UPDATE_COMMENT,
    Action.DELETE_COMMENT,
    Action.MODERATE_CONTENT,
    Action.VIEW_ANALYTICS,
    Action.VIEW_AUDIT_LOG,
  ],

  [UserRole.EDITOR]: [
    // Editor can create and manage own content
    Action.READ_USER,
    Action.UPDATE_USER, // Only own profile
    Action.CREATE_STARTUP,
    Action.READ_STARTUP,
    Action.UPDATE_STARTUP, // Only own startups
    Action.CREATE_COMMENT,
    Action.READ_COMMENT,
    Action.UPDATE_COMMENT, // Only own comments
    Action.VIEW_ANALYTICS, // Limited analytics
  ],

  [UserRole.USER]: [
    // Regular user can view and create
    Action.READ_USER,
    Action.UPDATE_USER, // Only own profile
    Action.CREATE_STARTUP,
    Action.READ_STARTUP,
    Action.CREATE_COMMENT,
    Action.READ_COMMENT,
    Action.UPDATE_COMMENT, // Only own comments
  ],

  [UserRole.VIEWER]: [
    // Viewer is read-only
    Action.READ_USER,
    Action.READ_STARTUP,
    Action.READ_COMMENT,
  ],
};

/**
 * Role hierarchy for inheritance
 * Higher level roles inherit permissions from lower levels
 */
export const roleHierarchy: Record<UserRole, UserRole[]> = {
  [UserRole.ADMIN]: [
    UserRole.ADMIN,
    UserRole.MODERATOR,
    UserRole.EDITOR,
    UserRole.USER,
    UserRole.VIEWER,
  ],
  [UserRole.MODERATOR]: [
    UserRole.MODERATOR,
    UserRole.EDITOR,
    UserRole.USER,
    UserRole.VIEWER,
  ],
  [UserRole.EDITOR]: [UserRole.EDITOR, UserRole.USER, UserRole.VIEWER],
  [UserRole.USER]: [UserRole.USER, UserRole.VIEWER],
  [UserRole.VIEWER]: [UserRole.VIEWER],
};

/**
 * Role descriptions for UI display
 */
export const roleDescriptions: Record<UserRole, string> = {
  [UserRole.ADMIN]:
    "Full system access. Can manage users, content, settings, and view audit logs.",
  [UserRole.MODERATOR]:
    "Content moderation. Can manage users, moderate content, and view analytics.",
  [UserRole.EDITOR]:
    "Content creation. Can create and edit own startups and comments.",
  [UserRole.USER]:
    "Standard user. Can create content, comment, and update own profile.",
  [UserRole.VIEWER]: "Read-only access. Can only view public content.",
};

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Action[] {
  return rolePermissions[role] || [];
}

/**
 * Check if a role has permission for an action
 */
export function hasPermission(role: UserRole, action: Action): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(action);
}

/**
 * Get all roles that a user with a specific role can manage
 * Used for role assignment operations
 */
export function getManagedRoles(role: UserRole): UserRole[] {
  return roleHierarchy[role] || [];
}

/**
 * Check if a role can manage another role
 */
export function canManageRole(
  actorRole: UserRole,
  targetRole: UserRole
): boolean {
  const managedRoles = getManagedRoles(actorRole);
  return managedRoles.includes(targetRole);
}
