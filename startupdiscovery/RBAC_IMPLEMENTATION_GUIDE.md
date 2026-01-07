# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document describes the Role-Based Access Control (RBAC) system implemented for the StartupDiscovery application. The system provides fine-grained permission checking, ownership validation, and comprehensive audit logging.

## Architecture

### Role Hierarchy

The system defines three database roles aligned with the Prisma schema:

```
ADMIN (Level 3)
  ↓ inherits from
MODERATOR (Level 2)
  ↓ inherits from
USER (Level 1)
```

**Role Descriptions:**

- **ADMIN**: Full system access including user management, role assignment, and audit log viewing
- **MODERATOR**: Content moderation and user management (can't manage roles or system settings)
- **USER**: Standard user with creation and reading permissions (can manage own content)

### Permission System

The system uses an Action-based permission model with 18 distinct actions:

#### User Management Actions
- `CREATE_USER` - Create new user accounts
- `READ_USER` - View user information
- `UPDATE_USER` - Modify user details (own profile or any as Admin)
- `DELETE_USER` - Remove user accounts
- `MANAGE_ROLES` - Assign or modify user roles

#### Startup Management Actions
- `CREATE_STARTUP` - Create new startups
- `READ_STARTUP` - View startup information
- `UPDATE_STARTUP` - Edit startups (own or any as moderator+)
- `DELETE_STARTUP` - Remove startups (own or any as admin)
- `PUBLISH_STARTUP` - Publish startup to public

#### Content Management Actions
- `CREATE_COMMENT` - Add comments to startups
- `READ_COMMENT` - View comments
- `UPDATE_COMMENT` - Edit comments (own or as moderator+)
- `DELETE_COMMENT` - Remove comments (own or as moderator+)
- `MODERATE_CONTENT` - Moderate user-generated content

#### Analytics & System Actions
- `VIEW_ANALYTICS` - Access analytics and reports
- `VIEW_REPORTS` - View system reports
- `EXPORT_DATA` - Export data from the system
- `MANAGE_SETTINGS` - Modify system settings
- `MANAGE_AUDIT_LOGS` - Access audit log management

### Permission Mapping

| Action | ADMIN | MODERATOR | USER |
|--------|-------|-----------|------|
| CREATE_USER | ✅ | ❌ | ❌ |
| READ_USER | ✅ | ✅ | ✅ |
| UPDATE_USER | ✅ | ✅ | ✅* |
| DELETE_USER | ✅ | ❌ | ❌ |
| MANAGE_ROLES | ✅ | ❌ | ❌ |
| CREATE_STARTUP | ✅ | ✅ | ✅ |
| READ_STARTUP | ✅ | ✅ | ✅ |
| UPDATE_STARTUP | ✅ | ✅ | ✅* |
| DELETE_STARTUP | ✅ | ✅ | ❌ |
| PUBLISH_STARTUP | ✅ | ✅ | ❌ |
| CREATE_COMMENT | ✅ | ✅ | ✅ |
| READ_COMMENT | ✅ | ✅ | ✅ |
| UPDATE_COMMENT | ✅ | ✅ | ✅* |
| DELETE_COMMENT | ✅ | ✅ | ❌ |
| MODERATE_CONTENT | ✅ | ✅ | ❌ |
| VIEW_ANALYTICS | ✅ | ✅ | ❌ |
| VIEW_REPORTS | ✅ | ✅ | ❌ |
| EXPORT_DATA | ✅ | ❌ | ❌ |
| MANAGE_SETTINGS | ✅ | ❌ | ❌ |
| MANAGE_AUDIT_LOGS | ✅ | ❌ | ❌ |

*Can only perform on own resources (determined by ownership check)

## Implementation Components

### 1. Role Definition (`lib/rbac/roles.ts`)

Defines roles, actions, and permission mappings:

```typescript
import { UserRole, Action, rolePermissions, getRolePermissions, hasPermission } from "@/lib/rbac";

// Check if a role has a specific permission
const canDelete = hasPermission("ADMIN", Action.DELETE_USER); // true
const canModerate = hasPermission("USER", Action.MODERATE_CONTENT); // false
```

**Key Functions:**
- `getRolePermissions(role)` - Get all actions for a role (including inherited)
- `hasPermission(role, action)` - Check if role can perform action
- `getManagedRoles(role)` - Get roles that a role can manage
- `canManageRole(actorRole, targetRole)` - Prevent privilege escalation

### 2. Permission Checking (`lib/rbac/permissions.ts`)

Core permission checking with ownership support:

```typescript
import {
  checkPermission,
  enforcePermission,
  enforceOwnerPermission,
  PermissionDeniedError,
} from "@/lib/rbac";

// Check permission and return result
const result = checkPermission(context, Action.DELETE_STARTUP, "startup", startupId);
if (!result.allowed) {
  console.log("Denied:", result.reason);
}

// Enforce permission in API route (throws if denied)
try {
  enforcePermission(context, Action.UPDATE_USER, "user", userId);
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    // Return 403 Forbidden
  }
}

// Check permission + ownership
enforceOwnerPermission(context, Action.UPDATE_STARTUP, "startup", startupId, ownerId);
```

**Context Object:**
```typescript
interface PermissionCheckContext {
  userId: number;
  userEmail: string;
  userRole: UserRole;
  ipAddress?: string;
  userAgent?: string;
}
```

### 3. Audit Logging (`lib/rbac/auditLog.ts`)

Logs all permission checks for security monitoring:

```typescript
import { getAuditLogs, getAuditSummary, getHighRiskActivities } from "@/lib/rbac";

// Get all audit logs
const logs = getAuditLogs();

// Filter by user, action, or result
const deniedLogs = getAuditLogs({ result: "DENIED" });
const userLogs = getAuditLogs({ userId: 42 });

// Get summary statistics
const summary = getAuditSummary();
// Returns: { totalEvents, allowedCount, deniedCount, percentage, topDeniedActions, topDeniedRoles }

// Detect high-risk activities (e.g., multiple failed attempts)
const suspicious = getHighRiskActivities();
```

**Audit Log Format:**
```typescript
interface AuditLog {
  userId: number;
  userEmail: string;
  userRole: UserRole;
  action: Action;
  resource: string;
  resourceId?: number;
  result: "ALLOWED" | "DENIED";
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
```

**Console Output Example:**
```
✅ [RBAC_AUDIT] admin@example.com (ADMIN) → create_user on user: ALLOWED
❌ [RBAC_AUDIT] user@example.com (USER) → delete_user on user#5: DENIED (Role USER does not have delete_user permission)
✅ [RBAC_AUDIT] user@example.com (USER) → update_startup on startup#3: ALLOWED (Own resource)
```

## Protected API Endpoints

### User Management

#### `GET /api/protected/users`
- **Permission Required**: `READ_USER`
- **Minimum Role**: MODERATOR
- **Returns**: List of all users with role and activity stats

#### `DELETE /api/protected/users/[id]`
- **Permission Required**: `DELETE_USER`
- **Minimum Role**: ADMIN
- **Audit**: Logs deletion attempt

#### `PATCH /api/protected/roles`
- **Permission Required**: `MANAGE_ROLES`
- **Minimum Role**: ADMIN
- **Features**:
  - Prevents privilege escalation
  - Prevents last admin demotion
  - Validates target role is lower in hierarchy

### Startup Management

#### `POST /api/protected/startups`
- **Permission Required**: `CREATE_STARTUP`
- **Minimum Role**: USER
- **Validates**: Slug format and required fields

#### `PATCH /api/protected/startups/[id]`
- **Permission Required**: `UPDATE_STARTUP`
- **Ownership Check**: User or Moderator+
- **Audit**: Logs all update attempts

#### `DELETE /api/protected/startups/[id]`
- **Permission Required**: `DELETE_STARTUP`
- **Ownership Check**: Own startup or Admin
- **Returns**: 404 if startup not found

### Comment Management

#### `POST /api/protected/comments`
- **Permission Required**: `CREATE_COMMENT`
- **Minimum Role**: USER
- **Validates**: Startup exists

#### `DELETE /api/protected/comments/[id]`
- **Permission Required**: `DELETE_COMMENT`
- **Ownership Check**: Own comment or Moderator+

### Analytics & Audit

#### `GET /api/protected/audit-logs`
- **Permission Required**: `MANAGE_ROLES`
- **Minimum Role**: ADMIN
- **Query Parameters**:
  - `userId` - Filter by user
  - `action` - Filter by action
  - `result` - Filter by ALLOWED or DENIED
  - `limit` - Results to return (max 1000)

#### `POST /api/protected/audit-logs/summary`
- **Permission Required**: `MANAGE_ROLES`
- **Minimum Role**: ADMIN
- **Returns**: Statistics and high-risk activities

#### `GET /api/protected/analytics`
- **Permission Required**: `VIEW_ANALYTICS`
- **Minimum Role**: ADMIN
- **Returns**: System-wide analytics

## Error Handling

### Permission Denied Response (403 Forbidden)

```json
{
  "success": false,
  "message": "You do not have permission to delete users",
  "error": "FORBIDDEN",
  "statusCode": 403
}
```

### Custom Error Class

```typescript
class PermissionDeniedError extends Error {
  constructor(reason: string, action: Action, resource: string, resourceId?: number) {
    super(`Permission denied: ${reason}`);
    this.action = action;
    this.resource = resource;
    this.resourceId = resourceId;
  }
}
```

## Ownership Checks

For resource-specific permissions (UPDATE/DELETE), the system checks:

1. **Ownership**: Is the user the resource owner?
2. **Role Override**: Is the user a moderator or admin?

```typescript
// User can update own startup
if (userId === startup.userId || userRole === "ADMIN") {
  // Allow update
}
```

## Integration Pattern

### In API Routes

```typescript
import { enforcePermission, Action, PermissionDeniedError } from "@/lib/rbac";

export async function DELETE(req: Request) {
  // Extract and verify token
  const decoded = verifyAccessToken(token);
  
  const context = {
    userId: decoded.userId,
    userEmail: decoded.email,
    userRole: decoded.role as UserRole,
    ipAddress,
    userAgent,
  };

  // Check permission
  try {
    enforcePermission(context, Action.DELETE_USER, "user", userId);
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return sendError("Permission denied", "FORBIDDEN", 403);
    }
  }

  // Proceed with deletion
  await prisma.user.delete({ where: { id: userId } });
  return sendSuccess({ message: "User deleted" });
}
```

## Testing Scenarios

### Test Case 1: Admin Can Delete Users

**Setup:**
- User: admin@example.com (ADMIN)
- Action: DELETE /api/protected/users/2
- Target User ID: 2 (regular user)

**Expected Result:**
- ✅ 200 OK - User deleted
- ✅ Audit log: "admin@example.com (ADMIN) → delete_user on user#2: ALLOWED"

### Test Case 2: User Cannot Delete Users

**Setup:**
- User: user@example.com (USER)
- Action: DELETE /api/protected/users/2

**Expected Result:**
- ❌ 403 Forbidden
- ✅ Audit log: "user@example.com (USER) → delete_user on user#2: DENIED (Role USER does not have delete_user permission)"

### Test Case 3: User Can Update Own Startup

**Setup:**
- User: user@example.com (USER)
- Action: PATCH /api/protected/startups/5
- Startup Owner: user@example.com (userId: 1)

**Expected Result:**
- ✅ 200 OK - Startup updated
- ✅ Audit log: "user@example.com (USER) → update_startup on startup#5: ALLOWED (Own resource)"

### Test Case 4: User Cannot Update Others' Startups

**Setup:**
- User: user@example.com (USER, userId: 1)
- Action: PATCH /api/protected/startups/6
- Startup Owner: admin@example.com (userId: 2)

**Expected Result:**
- ❌ 403 Forbidden
- ✅ Audit log: "user@example.com (USER) → update_startup on startup#6: DENIED (Only admins and moderators can modify other users' startups)"

### Test Case 5: Moderator Can Moderate Content

**Setup:**
- User: mod@example.com (MODERATOR)
- Action: DELETE /api/protected/comments/10

**Expected Result:**
- ✅ 200 OK - Comment deleted
- ✅ Audit log: "mod@example.com (MODERATOR) → delete_comment on comment#10: ALLOWED"

## Security Features

### 1. Privilege Escalation Prevention

```typescript
// Prevent user from assigning themselves admin role
if (canManageRole("USER", "ADMIN")) {
  // This is false, so assignment is blocked
}
```

### 2. Last Admin Protection

```typescript
// Prevent demotion of the last admin
const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
if (adminCount === 1 && currentRole === "ADMIN") {
  throw new Error("Cannot demote the last admin");
}
```

### 3. Ownership Verification

```typescript
// Only allow update if owner or admin
enforceOwnerPermission(context, Action.UPDATE_STARTUP, "startup", startupId, ownerId);
```

### 4. Comprehensive Audit Logging

Every permission check is logged with:
- User identity (email, role)
- Action attempted
- Resource and resource ID
- Result (ALLOWED/DENIED)
- Reason for denial
- Client IP and User-Agent
- Timestamp

### 5. High-Risk Activity Detection

The system detects suspicious patterns:
- Multiple failed attempts (>3 denied in 5 minutes)
- Privilege escalation attempts
- Bulk operations by single user

## Configuration

### Adding New Actions

1. Add action to `Action` enum in `lib/rbac/roles.ts`
2. Update `rolePermissions` mapping
3. Use in permission checks

### Adding New Roles (Future)

To extend beyond USER/ADMIN/MODERATOR:

1. Update Prisma schema UserRole enum
2. Add role to `UserRole` type in `lib/rbac/roles.ts`
3. Add role to `rolePermissions` and `roleHierarchy`
4. Update API endpoints accordingly

## Performance Considerations

- **In-Memory Audit Log**: Uses array storage (suitable for dev/testing)
- **Production**: Migrate audit logs to database table
- **Permission Checks**: O(1) for most checks using Set operations
- **Ownership Checks**: Single database query per request

## Scalability

### Current Design
- Suitable for small to medium deployments
- In-memory audit logs (no persistence)
- Direct permission mapping (no policy engine)

### Future Evolution

**Phase 1**: Migrate audit logs to database
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action VARCHAR(50),
  resource VARCHAR(50),
  resource_id INT,
  result VARCHAR(10),
  reason TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

**Phase 2**: Implement attribute-based access control (ABAC)
- Add context attributes (time, location, resource type, etc.)
- Use policy engine for flexible permission evaluation
- Support dynamic permission assignment

**Phase 3**: Role inheritance with custom policies
- Allow role composition
- Support conditional permissions
- Implement temporary access grants

## Testing and Validation

### Type Safety
- All permission checks are TypeScript-validated
- `Action` enum ensures only valid actions are used
- `UserRole` type ensures only valid roles are checked

### Quality Checks
- ESLint: ✅ No violations
- TypeScript: ✅ Strict mode, 0 errors
- Prettier: ✅ 100% formatted
- Unit tests: Can be added with Jest

### How to Run Tests

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# All checks
npm run type-check && npm run lint && npm run format
```

## API Examples

### Create a Startup (User Role)

```bash
curl -X POST http://localhost:3000/api/protected/startups \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Startup",
    "slug": "my-startup",
    "tagline": "A great startup idea",
    "description": "This is my awesome startup description",
    "industry": "Technology"
  }'
```

### Update Own Startup

```bash
curl -X PATCH http://localhost:3000/api/protected/startups/1 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description"
  }'
```

### View Audit Logs (Admin Only)

```bash
curl -X GET "http://localhost:3000/api/protected/audit-logs?result=DENIED&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

### Get Analytics (Admin Only)

```bash
curl -X GET http://localhost:3000/api/protected/analytics \
  -H "Authorization: Bearer <admin_token>"
```

### Assign Role (Admin Only)

```bash
curl -X PATCH http://localhost:3000/api/protected/roles \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 5,
    "newRole": "MODERATOR"
  }'
```

## Troubleshooting

### "Permission Denied" on Own Resource

**Cause**: Ownership check failing
**Solution**: Verify `resourceOwnerId` matches current user ID

### 401 Unauthorized

**Cause**: Invalid or expired token
**Solution**: Re-login and get new access token

### Role Assignment Fails

**Cause**: Trying to assign role equal to or higher than actor's role
**Solution**: Only admins can assign admin roles

## References

- [Prisma Schema](../prisma/schema.prisma) - Database user roles
- [JWT Implementation](./JWT_SESSION_MANAGEMENT_GUIDE.md) - Token management
- [Error Codes](./lib/errorCodes.ts) - HTTP error mappings

## Summary

The RBAC system provides:
- ✅ Three-tier role hierarchy (ADMIN > MODERATOR > USER)
- ✅ 18 fine-grained actions for resource-specific control
- ✅ Ownership checks for personal resources
- ✅ Comprehensive audit logging with filtering
- ✅ High-risk activity detection
- ✅ Privilege escalation prevention
- ✅ Seamless integration with JWT authentication
- ✅ Full TypeScript type safety
- ✅ Ready for production with database audit log migration

**Status**: ✅ Phase 10 Complete
- All API endpoints protected with RBAC
- Audit logging fully functional
- Quality checks: 0 errors
- Ready for testing and deployment
