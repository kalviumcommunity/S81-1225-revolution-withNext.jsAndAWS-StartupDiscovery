# Middleware & RBAC Authorization - Quick Reference

## Quick Start

### What Is Middleware?

Middleware intercepts **every request** to your Next.js API to:

1. Extract and validate JWT tokens
2. Check user roles
3. Allow or deny access based on permissions

### File Structure

```
middleware.ts              # ← All request validation happens here
├── Extract JWT token
├── Verify signature & expiration
├── Check user role
└── Allow/deny access

app/api/admin/route.ts     # ← Admin-only routes
app/api/users/route.ts     # ← Protected routes (any authenticated user)
app/api/auth/signup        # ← Public routes (no auth required)
```

---

## Route Permissions Overview

```
┌─────────────────────────────────────────┐
│ PUBLIC ROUTES (No Authentication)       │
├─────────────────────────────────────────┤
│ POST /api/auth/signup                   │
│ POST /api/auth/login                    │
│ GET  /api/health                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PROTECTED ROUTES (Any Authenticated)    │
├─────────────────────────────────────────┤
│ GET    /api/users                       │
│ POST   /api/users                       │
│ GET    /api/tasks                       │
│ GET    /api/projects                    │
│                                          │
│ Required Roles: USER, MODERATOR, ADMIN  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ADMIN ROUTES (Admin Only)               │
├─────────────────────────────────────────┤
│ GET    /api/admin                       │
│ PATCH  /api/admin/users/:id/role        │
│                                          │
│ Required Roles: ADMIN                   │
└─────────────────────────────────────────┘
```

---

## User Roles

| Role          | Level | Permissions                                                               |
| ------------- | ----- | ------------------------------------------------------------------------- |
| **USER**      | 1     | ✅ Access own data<br/>✅ View users list<br/>❌ Access admin panel       |
| **MODERATOR** | 2     | ✅ All USER permissions<br/>✅ Moderate content<br/>❌ Access admin panel |
| **ADMIN**     | 3     | ✅ All permissions<br/>✅ Access admin panel<br/>✅ Manage user roles     |

---

## Testing

### Run the full test suite:

```bash
# In PowerShell
cd startupdiscovery
.\test-middleware.ps1
```

### Or manually test with curl:

```bash
# 1. Signup user
TOKEN=$(curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"User","email":"user@test.com","password":"TestPass123!"
  }' | jq -r '.data.token')

# 2. Access protected route (should work)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK, user list

# 3. Access admin route (should fail)
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer $TOKEN"
# Expected: 403 Forbidden - Access denied
```

---

## Middleware Configuration

### Adding New Protected Routes

In `middleware.ts`, add to `ROUTE_PERMISSIONS`:

```typescript
// For routes only authenticated users can access
{ pattern: /^\/api\/myroute/, requiredRoles: ['USER', 'ADMIN', 'MODERATOR'] }

// For admin-only routes
{ pattern: /^\/api\/admin\/newfeature/, requiredRoles: ['ADMIN'] }

// For specific roles
{ pattern: /^\/api\/premium/, requiredRoles: ['ADMIN', 'MODERATOR'] }

// Public route (no roles = public)
{ pattern: /^\/api\/public/, requiredRoles: [] }
```

### Adding New Roles

1. **Update Prisma schema:**

   ```prisma
   enum UserRole {
     USER
     ADMIN
     MODERATOR
     EDITOR    // ← New role
   }
   ```

2. **Run migration:**

   ```bash
   npx prisma migrate dev --name add_editor_role
   ```

3. **Update middleware config:**
   ```typescript
   { pattern: /^\/api\/users/, requiredRoles: ['USER', 'EDITOR', 'ADMIN', 'MODERATOR'] }
   ```

---

## Error Responses

### 401 - Missing Token

```json
{
  "success": false,
  "message": "Authentication required",
  "error": {
    "code": "MISSING_TOKEN",
    "details": "Authorization header with Bearer token is required"
  }
}
```

### 401 - Invalid Token

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": {
    "code": "INVALID_TOKEN",
    "details": "Token is invalid, expired, or tampered with"
  }
}
```

### 403 - Insufficient Permissions

```json
{
  "success": false,
  "message": "Access denied",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "details": "Your role 'USER' is not permitted to access this resource. Required roles: ADMIN"
  }
}
```

---

## How Middleware Works

### Step-by-Step Flow

```
1. Request arrives: GET /api/admin with token

2. Middleware checks:
   ├─ Is route in ROUTE_PERMISSIONS?  → YES
   ├─ Does route require auth?         → YES (ADMIN only)
   ├─ Is Authorization header present? → YES
   ├─ Can extract "Bearer" token?      → YES

3. Token validation:
   ├─ Check signature (not tampered)   → VALID
   ├─ Check expiration (not expired)   → VALID
   ├─ Extract userId, email, role      → SUCCESS (role: USER)

4. Role check:
   ├─ Does route need ADMIN?           → YES
   ├─ Is user ADMIN?                   → NO (user is USER)

5. Result:
   └─ Return 403 Forbidden ❌
```

### Code Flow

```typescript
// In middleware.ts

middleware(request) {
  → getRoutePermission()          // Step 1: Find route config
  → extractToken()                 // Step 2: Get JWT from header
  → verifyJWT()                    // Step 3: Validate signature
  → hasRequiredRole()              // Step 4: Check role
  → NextResponse.next()            // Step 5: Allow or deny
}
```

---

## Principle of Least Privilege

### What Does It Mean?

Users get **minimum access** needed for their role:

```
❌ Bad: "Is user authenticated?" → Allow everything
✅ Good: "Is user authenticated AND has ADMIN role?" → Allow admin features
```

### Why It Matters

1. **Security**: Limits damage if account is compromised

   ```
   If USER account hacked:
   - Can't access /api/admin
   - Can't modify other users
   - Limited to own data
   ```

2. **Compliance**: Meets legal requirements (GDPR, etc.)
3. **Reliability**: Prevents accidental changes
4. **Auditability**: Logs show exactly who accessed what

### Example

```typescript
// ✅ GOOD: User can only modify their own profile
if (targetUserId !== currentUserId && currentRole !== "ADMIN") {
  return 403; // Forbidden
}

// ❌ BAD: Any authenticated user can modify anyone
if (currentRole !== "GUEST") {
  // Allow modification of any user
}
```

---

## Security Checklist

- ✅ JWT signature validated (can't forge tokens)
- ✅ Token expiration checked (old tokens rejected)
- ✅ Role checked against route requirements
- ✅ Errors don't leak sensitive info (user emails, debug data)
- ✅ Middleware runs on all routes (centralized)
- ✅ User context added to request headers
- ✅ Consistent error responses (401/403)

---

## Common Issues

### Issue: "Token is missing" but I sent it

```bash
# ❌ Wrong format
curl -H "Authorization: MyToken abc123"

# ✅ Correct format (Bearer required)
curl -H "Authorization: Bearer abc123"
```

### Issue: "Access denied" but I should have permission

1. Check user role: `jq -r '.data.user.role' < token.json`
2. Verify route config in `middleware.ts`
3. Check if ADMIN user was created (default users are USER role)

### Issue: Middleware not running

Check `middleware.ts` config:

```typescript
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

This pattern might exclude your route. Update if needed.

---

## File Reference

| File                          | Purpose                                    |
| ----------------------------- | ------------------------------------------ |
| `middleware.ts`               | JWT validation & RBAC engine               |
| `app/api/admin/route.ts`      | Admin dashboard (GET)                      |
| `test-middleware.ps1`         | Comprehensive test suite                   |
| `MIDDLEWARE_DOCUMENTATION.md` | Full documentation (this file)             |
| `lib/auth.ts`                 | JWT utilities (generateToken, verifyToken) |

---

## Admin Panel Features

### GET /api/admin

Returns system statistics and recent users (admin only).

**Response:**

```json
{
  "statistics": {
    "totalUsers": 42,
    "usersByRole": { "ADMIN": 2, "MODERATOR": 5, "USER": 35 },
    "totalProjects": 15,
    "totalTasks": 128
  },
  "recentUsers": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "USER",
      "createdAt": "2024-01-05T10:30:00Z"
    }
  ]
}
```

### PATCH /api/admin/users/:userId/role

Change user's role (admin only).

**Request:**

```bash
curl -X PATCH http://localhost:3000/api/admin/users/5/role \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "newRole": "ADMIN" }'
```

**Response:**

```json
{
  "id": 5,
  "email": "user@example.com",
  "role": "ADMIN"
}
```

---

## Next Steps

1. ✅ Review [MIDDLEWARE_DOCUMENTATION.md](./MIDDLEWARE_DOCUMENTATION.md) for deep dive
2. ✅ Run `test-middleware.ps1` to verify setup
3. ✅ Test with curl/Postman
4. ✅ Review middleware code in `middleware.ts`
5. ✅ Consider adding more roles (EDITOR, VIEWER, etc.)

---

**Created:** January 5, 2026  
**Version:** 1.0  
**Status:** Production Ready
