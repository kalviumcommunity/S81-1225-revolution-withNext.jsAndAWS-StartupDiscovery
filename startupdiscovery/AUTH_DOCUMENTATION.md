# Authentication System Documentation

## Overview

This document explains the implementation of secure user authentication using:

- **bcrypt** for password hashing
- **JWT (JSON Web Tokens)** for token-based sessions
- **Prisma ORM** for database operations

## Architecture

### Authentication Flow

```
User Registration (Signup)
├─ User submits: email, password, name
├─ Validate input with Zod schemas
├─ Hash password using bcrypt.hash(password, 10)
├─ Store user in PostgreSQL database
├─ Generate JWT token immediately
└─ Return user data + JWT token

User Login
├─ User submits: email, password
├─ Validate input with Zod schemas
├─ Fetch user from database by email
├─ Verify password with bcrypt.compare()
├─ Generate JWT token with userId & email
└─ Return user data + JWT token

Protected Route Access
├─ Client includes: Authorization: Bearer <JWT_TOKEN>
├─ Server extracts token from header
├─ Verify token signature and expiration
├─ Extract userId & email from token
├─ Allow access to protected resources
└─ Return data or 401 Unauthorized
```

## Components

### 1. Authentication Utilities (`lib/auth.ts`)

Core functions for password and token management:

```typescript
// Password Hashing
export async function hashPassword(password: string): Promise<string>;
// Cost factor of 10 provides good security/performance balance
// Example: "myPassword123" → "$2b$10$..."

// Password Verification
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean>;
// Returns true if password matches the hash

// JWT Token Generation
export function generateToken(userId: number, email: string): string;
// Creates HS256-signed token with 7-day expiry
// Payload: { userId, email, iat }

// JWT Token Verification
export function verifyToken(
  token: string
): { userId: number; email: string } | null;
// Returns decoded token data or null if invalid/expired

// Authorization Header Processing
export function validateAuthHeader(
  authHeader: string | null
): { userId: number; email: string } | null;
// Extracts and validates Bearer token from header
```

### 2. Authentication Schemas (`lib/schemas/authSchema.ts`)

Zod validation schemas for request bodies:

```typescript
// Signup Validation
export const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Must be 8+ characters")
    .regex(/[A-Z]/, "Must include uppercase")
    .regex(/[a-z]/, "Must include lowercase")
    .regex(/[0-9]/, "Must include number")
    .regex(/[!@#$%^&*]/, "Must include special char"),
  age: z.number().int().positive().optional(),
});

// Login Validation
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

### 3. Signup API (`/api/auth/signup`)

**POST** request to create a new user account.

**Request Body:**

```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "SecurePass123!",
  "age": 28
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "username": "alice",
      "role": "USER",
      "createdAt": "2024-01-05T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "timestamp": "2024-01-05T10:30:00Z"
}
```

**Validation Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one special character (!@#$%^&*)"
    }
  ],
  "timestamp": "2024-01-05T10:30:00Z"
}
```

**Duplicate Email Response (409 Conflict):**

```json
{
  "success": false,
  "message": "Email already in use",
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "statusCode": 409,
  "timestamp": "2024-01-05T10:30:00Z"
}
```

### 4. Login API (`/api/auth/login`)

**POST** request to authenticate and receive JWT token.

**Request Body:**

```json
{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "username": "alice",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "timestamp": "2024-01-05T10:30:00Z"
}
```

**Invalid Credentials Response (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2024-01-05T10:30:00Z"
}
```

### 5. Protected Routes (`/api/users`)

All user endpoints require JWT authentication via the `Authorization` header.

**Request Header:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**GET /api/users** - List all users (requires authentication)

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "username": "alice",
        "role": "USER",
        "createdAt": "2024-01-05T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

**Missing/Invalid Token Response (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Unauthorized. Valid JWT authentication required.",
  "errorCode": "UNAUTHORIZED",
  "statusCode": 401,
  "timestamp": "2024-01-05T10:30:00Z"
}
```

## JWT Token Structure

### Token Format

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDQzNjQ2MDB9.signature
```

### Decoded Payload

```json
{
  "userId": 1,
  "email": "alice@example.com",
  "iat": 1704364600,
  "exp": 1705056600
}
```

### Token Properties

- **Header**: `{ "alg": "HS256", "typ": "JWT" }`
- **Payload**: Contains userId, email, issued-at time (iat), expiration time (exp)
- **Signature**: HMAC-SHA256 hash of header + payload + secret key
- **Expiry**: 7 days (604800 seconds)
- **Algorithm**: HS256 (HMAC with SHA-256)

## Security Features

### 1. Password Security

- **Bcrypt Hashing**: Cost factor of 10 (2^10 iterations)
- **Salting**: Automatically included in bcrypt
- **Never Store Plain Text**: All passwords hashed before database storage
- **Timing Attack Resistant**: bcrypt comparison is constant-time

### 2. Token Security

- **JWT Signature**: Prevents tampering (signature verification required)
- **Expiration**: Tokens expire after 7 days
- **Payload Verification**: Signature is validated on each request
- **Secret Key**: Should be long, random, stored in environment variables

### 3. Input Validation

- **Email Format**: RFC 5322 compliant validation
- **Password Strength**: Minimum 8 characters with mixed case, numbers, and symbols
- **SQL Injection Prevention**: Prisma parameterized queries
- **XSS Prevention**: JSON response encoding

### 4. Authorization

- **Role-Based Access Control**: USER, ADMIN, MODERATOR roles
- **User Isolation**: Users can only access their own data
- **Permission Checks**: Role validation before sensitive operations

## Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-long-random-secret-key-minimum-32-characters
JWT_EXPIRY=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/startups

# Environment
NODE_ENV=development
```

**Important**: In production, generate a strong secret key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Token Expiry & Refresh

### Current Implementation (7-Day Expiry)

Tokens are issued with a 7-day expiration. After expiration, users must log in again.

```javascript
// Token issued with expiry
jwt.sign(payload, secret, { expiresIn: "7d" });

// On verification, JWT library automatically checks expiration
jwt.verify(token, secret); // Throws if expired
```

### Recommended Enhancements

#### 1. Refresh Token Pattern

```typescript
// Issue both access and refresh tokens
{
  accessToken: "short-lived-jwt", // 1 hour expiry
  refreshToken: "long-lived-jwt", // 7 days expiry
}

// Client stores both, uses access token for requests
// When access token expires, use refresh token to get new access token
```

**Advantages:**

- Access tokens are short-lived (reduces compromise window)
- Refresh tokens are long-lived but limited to refresh operations
- Users stay logged in for longer without frequent logins

#### 2. Token Rotation

```typescript
// On each refresh, issue new refresh token too
// Invalidate old refresh token
// Tracks token generation count to detect token reuse attacks
```

#### 3. Token Blacklisting

```typescript
// On logout, add token to blacklist (Redis recommended)
// Check blacklist before allowing token use
// Purge old tokens from blacklist periodically
```

## Token Storage Best Practices

### Browser Storage Options

#### Option 1: Secure HTTP-Only Cookies (Recommended)

```javascript
// Server sets cookie (not accessible from JavaScript)
res.setHeader(
  "Set-Cookie",
  `token=${jwtToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
);

// Pros: Immune to XSS attacks
// Cons: Must handle CSRF protection
// Use: Production applications
```

#### Option 2: localStorage

```javascript
localStorage.setItem("token", jwtToken);
const token = localStorage.getItem("token");

// Pros: Simple to implement, persists across tabs
// Cons: Vulnerable to XSS attacks
// Use: Development, trusted environments
```

#### Option 3: sessionStorage

```javascript
sessionStorage.setItem("token", jwtToken);
const token = sessionStorage.getItem("token");

// Pros: Cleared on tab close, simple to implement
// Cons: Vulnerable to XSS, not persisted
// Use: Very short-lived tokens
```

#### Option 4: Memory Variable

```javascript
let jwtToken = null;

// Pros: Not vulnerable to XSS, not persisted to disk
// Cons: Lost on page refresh
// Use: Single Page Apps with server-side token storage
```

### Recommendation for Production

- **Client**: Store in secure HTTP-only cookies
- **Server**: Maintain refresh token in database
- **Validation**: Check token signature + database record + expiration
- **Logout**: Clear cookie, invalidate database record

## Real-World Scenarios & Handling

### Scenario 1: Token Leaks or Compromises

**Problem**: JWT token exposed (GitHub repo, logs, browser tools)

**Current System Response**:

```javascript
// Token is valid until expiration (7 days)
// No immediate way to revoke it
// User remains "logged in" through compromised token
```

**Recommended Improvements**:

```typescript
// 1. Short-lived access tokens
// Tokens expire in 1 hour, reducing compromise window

// 2. Token Blacklisting
// User initiates logout, token added to blacklist
// Before processing request, check if token is blacklisted

// 3. Anomaly Detection
// Monitor for unusual activity:
// - Multiple devices/IPs
// - Unusual request patterns
// - Rapid token refresh

// 4. Device Fingerprinting
// Store device fingerprint with token
// Verify fingerprint matches on each request

// 5. Force Re-authentication
// Session > 7 days: Force new login
// Suspicious activity: Request password confirmation
```

### Scenario 2: Token Expires Unexpectedly

**Problem**: User loses connection, comes back, token expired

**Current System Response**:

```typescript
// API returns 401 Unauthorized
// User must log in again
// Session data is lost
```

**Recommended Solution with Refresh Tokens**:

```typescript
// Client receives 401 for access token
// Client automatically uses refresh token to get new access token
// No user-visible login required
// Session continues seamlessly

// Implementation:
POST /api/auth/refresh
Body: { refreshToken: "..." }
Response: { accessToken: "new-jwt", refreshToken: "new-refresh" }

// If refresh token also expired, user must login again
```

### Scenario 3: Multiple Active Sessions

**Problem**: User logs in on multiple devices, wants to log out of one

**Current System Response**:

```typescript
// Logout only clears client-side token
// Token still valid until expiration
// User remains logged in on other devices
```

**Recommended Solution**:

```typescript
// Store sessions in database
model Session {
  id: String @id
  userId: Int
  token: String @unique
  ipAddress: String
  userAgent: String
  expiresAt: DateTime
}

// Logout clears specific session
DELETE /api/auth/logout
Body: { sessionId: "..." }
// User can logout of all sessions
DELETE /api/auth/logout-all

// User can see active sessions and manage them
GET /api/auth/sessions
DELETE /api/auth/sessions/{id}
```

### Scenario 4: Account Compromised After Password Change

**Problem**: User changes password, but existing tokens remain valid

**Recommended Solution**:

```typescript
// 1. Invalidate all existing tokens on password change
DELETE all sessions for user
// User must login with new password

// 2. Require password confirmation for sensitive operations
// Accessing payment info: Require password
// Changing email: Require password
// Deleting account: Require password

// 3. Session validation on critical operations
POST /api/auth/verify-session
// Client sends current session token
// Server verifies it still exists and is valid
// If invalid, force re-authentication
```

## Security Checklist

- ✅ Passwords hashed with bcrypt (cost factor 10)
- ✅ JWT tokens signed with HMAC-SHA256
- ✅ Zod validation on all inputs
- ✅ Unique constraints on email and username
- ✅ Password strength requirements enforced
- ✅ Input sanitization against XSS
- ✅ SQL injection prevention (Prisma ORM)
- ✅ HTTP-only cookie setting available
- ⏳ Token blacklisting (recommended addition)
- ⏳ Refresh token pattern (recommended addition)
- ⏳ Rate limiting on auth endpoints (recommended addition)
- ⏳ Account lockout after failed attempts (recommended addition)
- ⏳ Session management (recommended addition)
- ⏳ Two-factor authentication (recommended addition)

## Testing the Authentication System

### 1. Manual Testing with cURL

**Test Signup:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }'
```

**Test Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }'
```

**Test Protected Route:**

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 2. Automated Testing Script

See `test-auth.ps1` for comprehensive test suite.

## Troubleshooting

### "Invalid JWT"

- Verify JWT_SECRET matches across restarts
- Check token expiration date
- Ensure Authorization header format: `Bearer <token>`

### "Email already exists"

- User already registered
- Try different email or login instead

### "Password must contain..."

- Password doesn't meet complexity requirements
- Must be 8+ chars with uppercase, lowercase, number, special char

### "Unauthorized"

- Token missing from Authorization header
- Token is invalid or expired
- Must log in again

## References

- [bcrypt.js Documentation](https://www.npmjs.com/package/bcrypt)
- [jsonwebtoken Documentation](https://www.npmjs.com/package/jsonwebtoken)
- [JWT.io Token Debugger](https://jwt.io)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Prisma ORM Documentation](https://www.prisma.io/docs/)

---

**Status**: ✅ Complete  
**Last Updated**: January 5, 2024  
**Version**: 1.0
