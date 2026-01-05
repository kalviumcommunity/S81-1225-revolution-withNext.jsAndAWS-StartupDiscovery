# Authorization Middleware & RBAC System Documentation

## Overview

This document describes the implementation of Next.js middleware for **Role-Based Access Control (RBAC)** in the StartupDiscovery API. The middleware ensures that users can only access resources and endpoints that their roles permit, implementing the **principle of least privilege**.

## Table of Contents

1. [Architecture](#architecture)
2. [Role Definitions](#role-definitions)
3. [Middleware Implementation](#middleware-implementation)
4. [Route Protection](#route-protection)
5. [Access Control Flow](#access-control-flow)
6. [Admin Routes](#admin-routes)
7. [Testing](#testing)
8. [Security Best Practices](#security-best-practices)
9. [Reflection](#reflection)

---

## Architecture

### Middleware Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Incoming Request                             │
│                                                                   │
│              GET /api/admin                                       │
│              Authorization: Bearer <JWT>                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Middleware.ts Validation                          │
│                                                                   │
│  1. Check if route requires authentication                        │
│  2. Extract JWT from Authorization header                         │
│  3. Verify JWT signature & expiration                             │
│  4. Extract user role from token payload                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐    ┌──────────┐
    │ Missing │    │ Invalid  │    │ Valid    │
    │ Token   │    │ Token    │    │ Token    │
    │ 401     │    │ 401      │    │ ✓        │
    └─────────┘    └──────────┘    └────┬─────┘
                                         │
                                         ▼
                          ┌──────────────────────────┐
                          │ Check User Role Against  │
                          │ Required Roles           │
                          │                          │
                          │ /api/admin needs ADMIN   │
                          │ /api/users needs USER+   │
                          └────────┬──────────┬──────┘
                                   │          │
                          ┌────────▼──┐  ┌───▼─────────┐
                          │ PERMITTED  │  │ DENIED      │
                          │ (add to    │  │ 403         │
                          │ headers)   │  │             │
                          └────────┬───┘  └─────────────┘
                                   │
                                   ▼
                          ┌──────────────────────────┐
                          │ Add User Context to      │
                          │ Request Headers:         │
                          │ - x-user-id              │
                          │ - x-user-email           │
                          │ - x-user-role            │
                          └────────┬──────────────────┘
                                   │
                                   ▼
                          ┌──────────────────────────┐
                          │ Pass to API Route        │
                          │ /api/admin/route.ts      │
                          └──────────────────────────┘
```

### Component Structure

```
Next.js Application
├── middleware.ts (JWT validation & RBAC)
├── app/
│   └── api/
│       ├── auth/
│       │   ├── signup/ (public)
│       │   └── login/ (public)
│       ├── users/
│       │   └── route.ts (authenticated: USER, ADMIN, MODERATOR)
│       ├── admin/
│       │   └── route.ts (admin only: ADMIN)
│       ├── tasks/ (authenticated)
│       └── projects/ (authenticated)
│
├── lib/
│   ├── auth.ts (JWT utilities)
│   ├── responseHandler.ts (error responses)
│   └── errorCodes.ts (error definitions)
│
└── Prisma/
    └── schema.prisma (User model with role)
```

---

## Role Definitions

### User Roles

The system defines three user roles with hierarchical permissions:

```typescript
// From Prisma Schema
enum UserRole {
  USER       // Default user - can access basic resources
  MODERATOR  // Moderator - can moderate content
  ADMIN      // Administrator - can access admin panel
}
```

### Role Hierarchy & Permissions

| Role          | Access   | Permissions                                                                                                                          |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **USER**      | Limited  | ✅ Access own profile<br/>✅ Read /api/users<br/>✅ Create/manage tasks & projects<br/>❌ Access /api/admin<br/>❌ Manage user roles |
| **MODERATOR** | Enhanced | ✅ All USER permissions<br/>✅ Moderate content<br/>✅ View user list<br/>❌ Access /api/admin<br/>❌ Manage system settings         |
| **ADMIN**     | Full     | ✅ All permissions<br/>✅ Access /api/admin<br/>✅ Manage user roles<br/>✅ View system statistics<br/>✅ Delete any resource        |

### Role Assignment

Users are assigned roles during:

1. **Signup** - Automatically assigned `USER` role

   ```typescript
   role: 'USER', // Default role
   ```

2. **Admin Assignment** - Admin can change user roles via API

   ```bash
   PATCH /api/admin/users/:userId/role
   {
     "newRole": "ADMIN" | "MODERATOR" | "USER"
   }
   ```

3. **Database Seeding** - Initial admin creation
   ```typescript
   // Create initial admin user for system
   role: "ADMIN";
   ```

---

## Middleware Implementation

### File: `middleware.ts`

The middleware is responsible for:

- Extracting and validating JWT tokens
- Verifying token signatures and expiration
- Checking user roles against route requirements
- Adding user context to request headers

### Key Functions

#### 1. Token Extraction

```typescript
function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}
```

**Usage:**

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                      └─────────────── Token extracted
```

#### 2. JWT Verification

```typescript
function verifyJWT(
  token: string
): { userId: number; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "object" &&
      "userId" in decoded &&
      "email" in decoded &&
      "role" in decoded
    ) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }

    return null;
  } catch (error) {
    // Invalid, expired, or tampered token
    return null;
  }
}
```

**Verifies:**

- ✅ Signature (ensures token wasn't tampered with)
- ✅ Expiration (token not older than 7 days)
- ✅ Algorithm (only HS256 accepted)
- ✅ Payload structure (has userId, email, role)

#### 3. Route Permission Matching

```typescript
interface RoutePermission {
  pattern: string | RegExp;
  requiredRoles: string[]; // Empty = public, specific roles = restricted
}

const ROUTE_PERMISSIONS: RoutePermission[] = [
  { pattern: /^\/api\/auth\//, requiredRoles: [] }, // Public
  { pattern: /^\/api\/users$/, requiredRoles: ["USER", "ADMIN", "MODERATOR"] }, // Protected
  { pattern: /^\/api\/admin/, requiredRoles: ["ADMIN"] }, // Admin only
];
```

#### 4. Role-Based Access Check

```typescript
function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) {
    return true; // Public route
  }
  return requiredRoles.includes(userRole);
}
```

### Complete Middleware Flow

```typescript
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Skip for static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // 2. Get route permission
  const permission = getRoutePermission(pathname);

  if (!permission) {
    return NextResponse.next(); // Public route
  }

  // 3. Check if authentication required
  if (permission.requiredRoles.length > 0) {
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);

    // 4. Validate token
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          error: { code: "MISSING_TOKEN" },
        },
        { status: 401 }
      );
    }

    const userData = verifyJWT(token);

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
          error: { code: "INVALID_TOKEN" },
        },
        { status: 401 }
      );
    }

    // 5. Check role permission
    if (!hasRequiredRole(userData.role, permission.requiredRoles)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
          error: { code: "INSUFFICIENT_PERMISSIONS" },
        },
        { status: 403 }
      );
    }

    // 6. Add user context to request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userData.userId.toString());
    requestHeaders.set("x-user-email", userData.email);
    requestHeaders.set("x-user-role", userData.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}
```

---

## Route Protection

### Route Configuration

The `ROUTE_PERMISSIONS` array defines which routes require authentication and which roles are allowed:

```typescript
const ROUTE_PERMISSIONS: RoutePermission[] = [
  // ✅ Public Routes (no authentication required)
  { pattern: /^\/api\/auth\//, requiredRoles: [] },
  { pattern: /^\/api\/health/, requiredRoles: [] },

  // ✅ User Routes (authenticated users)
  { pattern: /^\/api\/users$/, requiredRoles: ["USER", "ADMIN", "MODERATOR"] },
  {
    pattern: /^\/api\/users\/.*/,
    requiredRoles: ["USER", "ADMIN", "MODERATOR"],
  },

  // ✅ Task Routes (authenticated users)
  { pattern: /^\/api\/tasks/, requiredRoles: ["USER", "ADMIN", "MODERATOR"] },

  // ✅ Project Routes (authenticated users)
  {
    pattern: /^\/api\/projects/,
    requiredRoles: ["USER", "ADMIN", "MODERATOR"],
  },

  // ✅ Admin Routes (admin only)
  { pattern: /^\/api\/admin/, requiredRoles: ["ADMIN"] },

  // ✅ Dashboard (authenticated users)
  { pattern: /^\/dashboard/, requiredRoles: ["USER", "ADMIN", "MODERATOR"] },
];
```

### Protected Route Examples

#### 1. Public Routes (No Auth)

```bash
# No token required - always allowed
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"Pass123!"}'

# Response: 201 Created
```

#### 2. Authenticated Routes (Any authenticated user)

```bash
# Token required - USER, ADMIN, or MODERATOR allowed
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response: 200 OK (user list)
```

#### 3. Admin-Only Routes

```bash
# Token required AND must be ADMIN role
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Response: 200 OK (admin dashboard)
```

### Access Control Outcomes

| Scenario                          | Token      | Role  | Route             | Result               |
| --------------------------------- | ---------- | ----- | ----------------- | -------------------- |
| Public endpoint                   | ❌         | —     | `/api/auth/login` | ✅ 200 Allow         |
| User endpoint, missing token      | ❌         | —     | `/api/users`      | ❌ 401 Unauthorized  |
| User endpoint, invalid token      | ⚠️ Invalid | —     | `/api/users`      | ❌ 401 Invalid Token |
| User endpoint, valid USER token   | ✅ Valid   | USER  | `/api/users`      | ✅ 200 Allow         |
| Admin endpoint, valid USER token  | ✅ Valid   | USER  | `/api/admin`      | ❌ 403 Forbidden     |
| Admin endpoint, valid ADMIN token | ✅ Valid   | ADMIN | `/api/admin`      | ✅ 200 Allow         |

---

## Admin Routes

### File: `app/api/admin/route.ts`

The admin panel provides system statistics and user management capabilities.

#### GET /api/admin - Dashboard

Retrieves admin dashboard data (admin only).

**Request:**

```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Admin dashboard data retrieved successfully",
  "data": {
    "statistics": {
      "totalUsers": 42,
      "usersByRole": {
        "ADMIN": 2,
        "MODERATOR": 5,
        "USER": 35
      },
      "totalProjects": 15,
      "totalTasks": 128
    },
    "recentUsers": [
      {
        "id": 1,
        "email": "user@example.com",
        "username": "user",
        "name": "User Name",
        "role": "USER",
        "createdAt": "2024-01-05T10:30:00Z",
        "lastLoginAt": "2024-01-05T14:22:00Z"
      }
    ],
    "timestamp": "2024-01-05T15:45:00Z"
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "Access denied",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "details": "Your role 'USER' is not permitted to access this resource. Required roles: ADMIN"
  },
  "timestamp": "2024-01-05T15:45:00Z"
}
```

#### Implementation

```typescript
export async function GET(req: Request) {
  // Middleware has already validated JWT and added headers
  const userId = req.headers.get("x-user-id");
  const userRole = req.headers.get("x-user-role");

  if (userRole !== "ADMIN") {
    return sendError(
      "Unauthorized access to admin panel",
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }

  // Get statistics from database
  const totalUsers = await prisma.user.count();
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

  // Return dashboard data
  return sendSuccess(dashboardData, "Admin dashboard data retrieved", 200);
}
```

---

## Testing

### Test Script: `test-middleware.ps1`

Comprehensive PowerShell script testing all middleware functionality.

#### Running Tests

```bash
# In the startupdiscovery directory
.\test-middleware.ps1

# With verbose output
.\test-middleware.ps1 -Verbose
```

#### Test Coverage

The script validates:

1. **User Creation** - Create users with different roles
   - ✅ Regular USER signup
   - ✅ Admin user setup (for testing)
   - ✅ Moderator user setup (for testing)

2. **Public Endpoints** - No authentication required
   - ✅ Login endpoint accessible without token

3. **Protected Endpoints** - Authenticated users
   - ✅ USER can access `/api/users`
   - ✅ MODERATOR can access `/api/users`
   - ✅ ADMIN can access `/api/users`

4. **Admin-Only Routes** - ADMIN role required
   - ✅ ADMIN can access `/api/admin`
   - ❌ USER cannot access `/api/admin` (403)
   - ❌ MODERATOR cannot access `/api/admin` (403)

5. **Authentication Failures** - Error scenarios
   - ❌ Missing token → 401 Unauthorized
   - ❌ Invalid token → 401 Invalid Token
   - ❌ Malformed header → 401 Invalid Token

6. **JWT Token Analysis** - Verify payload
   - ✅ Token contains userId
   - ✅ Token contains email
   - ✅ Token contains role
   - ✅ Token has expiration

#### Sample Test Output

```
========================================
🔐 Middleware & RBAC Authorization Tests
========================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: Creating test users with different roles
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing: Signup regular user
  Method: POST /api/auth/signup
  Status: ✅ 201
✅ Regular user created (ID: 1)
   Token: eyJhbGciOiJIUzI1NiIsInR5cC...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: Testing admin-only routes (/api/admin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing: Admin user accessing /api/admin
  Method: GET /api/admin
  Token: eyJhbGciOiJIUzI1NiIsInR5cC...
  Status: ✅ 200
✅ Admin user can access /api/admin

Testing: Regular user attempting /api/admin (should be denied)
  Method: GET /api/admin
  Token: eyJhbGciOiJIUzI1NiIsInR5cC...
  Status: ❌ 403
✅ Regular user correctly denied access to /api/admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Passed: 14
❌ Failed: 0
📈 Total:  14

✨ All tests passed! Middleware is working correctly.
```

### Manual Testing with curl

```bash
# 1. Signup user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Copy the token from response
export USER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Access protected route (should work)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $USER_TOKEN"

# 3. Access admin route (should fail with 403)
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected response:
# {
#   "success": false,
#   "message": "Access denied",
#   "error": {
#     "code": "INSUFFICIENT_PERMISSIONS",
#     "details": "Your role 'USER' is not permitted..."
#   }
# }
```

---

## Security Best Practices

### 1. Token Validation

✅ **What We Do:**

- Verify JWT signature with secret key
- Check token expiration (7 days)
- Validate token algorithm (only HS256)
- Ensure payload contains required fields

❌ **What We Don't Do:**

- Accept any string as token
- Use expired tokens
- Accept different algorithms
- Trust unsigned tokens

### 2. Middleware Position

✅ **Protected:** Middleware runs on every request

```typescript
// middleware.ts checks ALL requests
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

❌ **Not Recommended:** Relying only on route-level checks

```typescript
// If only checked in route handler, bypass possible via direct database access
```

### 3. Role Separation

✅ **Best Practice:**

```typescript
// Explicit role checking
if (userRole === "ADMIN") {
  // Admin-only logic
}
```

❌ **Don't Do:**

```typescript
// Vague permissions
if (userRole !== "USER") {
  // Could accidentally allow too much
}
```

### 4. Error Messages

✅ **What We Do:**

```json
{
  "message": "Access denied",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "details": "Your role 'USER' is not permitted..."
  }
}
```

❌ **Don't Leak Info:**

```json
{
  "message": "User john@example.com is not admin", // ❌ Email leak
  "details": "Admin token shows X and Y..." // ❌ Debug info leak
}
```

### 5. Header Validation

✅ **What We Do:**

- Validate Bearer token format
- Check Authorization header exists
- Handle missing/malformed headers

❌ **Don't Do:**

```typescript
// This assumes header always exists
const token = authHeader.substring(7); // Could crash if header is invalid
```

### 6. Token Storage (Client-Side)

✅ **Recommended:**

- Store in memory (lost on page refresh)
- Store in sessionStorage (session-only)
- Use httpOnly cookies (HTTP only, not JS accessible)

❌ **Not Recommended:**

- localStorage (vulnerable to XSS attacks)
- localStorage without HttpOnly flag
- Exposing token in URLs

---

## Reflection

### Principle of Least Privilege

**What Is It?**
The principle of least privilege (PoLP) states that a user should have the minimum access rights necessary to perform their job functions.

**Why It Matters:**

1. **Security**: Limits damage if account is compromised

   ```
   If USER role is breached:
   - Can't access admin functions
   - Can't view other users' private data
   - Can't modify system settings
   ```

2. **Compliance**: Meets regulatory requirements (GDPR, HIPAA, etc.)
   - Audit trails show who accessed what
   - Easy to revoke specific permissions
   - Segregation of duties enforced

3. **Reliability**: Reduces accidental mistakes

   ```typescript
   // User can only modify their own data
   if (userData.userId !== targetUserId && userRole !== "ADMIN") {
     return sendError("Can only modify own profile", 403);
   }
   ```

4. **Maintainability**: Easier to understand and debug
   ```
   New developer: "What can a USER do?"
   Answer: "Only USER and below permissions - clear boundary"
   ```

### Example: Adding New Roles

The system is designed to easily accommodate new roles. To add a `MODERATOR` role:

**Step 1: Update Prisma Schema**

```prisma
enum UserRole {
  USER
  MODERATOR    // ← New role
  ADMIN
}
```

**Step 2: Run Migration**

```bash
npx prisma migrate dev --name add_moderator_role
```

**Step 3: Update Middleware Configuration**

```typescript
const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Add moderator-specific routes
  { pattern: /^\/api\/moderation/, requiredRoles: ["MODERATOR", "ADMIN"] },
  { pattern: /^\/api\/users/, requiredRoles: ["USER", "MODERATOR", "ADMIN"] },
];
```

**Step 4: Extend API Routes**

```typescript
// In route handler
if (userRole === "MODERATOR" || userRole === "ADMIN") {
  // Allow moderation functions
}
```

**Effort Required:**

- ✅ Minimal database changes (enum update)
- ✅ Add 1-2 lines to middleware config
- ✅ Add conditional logic to route handlers
- ✅ Write tests for new role

This design enables **horizontal scaling** of role features without major refactoring.

### Security Risks Without Middleware

#### Risk 1: Insufficient Authentication

Without proper middleware validation:

```typescript
// ❌ VULNERABLE: Just checks for presence of user
if (req.headers.get("x-user-id")) {
  // Any request with ANY x-user-id passes
  // Headers can be forged by client
}
```

**Consequence:** Anyone can pretend to be any user

#### Risk 2: Missing Role Checks

```typescript
// ❌ VULNERABLE: Forgot to check role
export async function GET(req: Request) {
  // Doesn't verify user is ADMIN
  return sendSuccess(sensitiveAdminData);
}
```

**Consequence:** All authenticated users access admin data

#### Risk 3: Inconsistent Checks

```typescript
// ❌ VULNERABLE: Role check only in one route
// api/admin/route.ts (checks role)
if (userRole !== "ADMIN") return 403;

// api/admin/users/route.ts (forgot check!)
// This route is accessible to any authenticated user
```

**Consequence:** Multiple bypass paths to protected resources

#### Risk 4: Middleware Misconfiguration

```typescript
// ❌ VULNERABLE: Route accidentally marked public
const ROUTE_PERMISSIONS: RoutePermission[] = [
  { pattern: /^\/api\/admin/, requiredRoles: [] }, // ← Oops, no role required!
];
```

**Consequence:** Admin routes accessible to everyone

### With Proper Middleware

All these risks are mitigated:

- ✅ Signature verification prevents header forgery
- ✅ Centralized role checks in one place
- ✅ Consistent enforcement across all routes
- ✅ Clear, maintainable configuration

---

## Environment Setup

### Required Environment Variables

```bash
# .env.local
JWT_SECRET=your-secret-key-change-in-production-12345
DATABASE_URL=postgresql://user:password@localhost:5432/startupdiscovery
```

### Database Schema

The User model includes role field:

```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  name          String?
  role          UserRole  @default(USER)  // ← Role field
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}
```

---

## Summary

The authorization middleware system provides:

✅ **JWT Validation** - Verify tokens are genuine and not expired
✅ **Role-Based Access** - Users only access what their role permits
✅ **Principle of Least Privilege** - Minimize access to essential resources
✅ **Scalable Design** - Easy to add new roles and permissions
✅ **Security Best Practices** - Prevent common vulnerabilities
✅ **Clear Error Handling** - Informative messages without leaking info
✅ **Comprehensive Testing** - Full test coverage of all scenarios

This creates a robust, maintainable foundation for access control in your Next.js application.
