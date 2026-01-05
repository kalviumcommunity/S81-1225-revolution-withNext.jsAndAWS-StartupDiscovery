# StartupDiscovery - Authentication & API Implementation

> Complete guide to the authentication system, RESTful API routes, and security implementations

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication System](#authentication-system)
3. [API Endpoints](#api-endpoints)
4. [Project Structure](#project-structure)
5. [Security Features](#security-features)
6. [Testing](#testing)
7. [Reflection & Best Practices](#reflection--best-practices)

---

## 🚀 Quick Start

### Installation & Setup

```bash
# Clone the repository
git clone <repo-url>
cd startupdiscovery

# Install dependencies (includes bcrypt & jsonwebtoken)
npm install

# Generate Prisma client
npx prisma generate

# Set up environment variables
cp .env.example .env.local

# Run database migrations (if needed)
npx prisma migrate dev

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000/api`

---

## 🔐 Authentication System

### Overview

The authentication system uses industry-standard security practices:

- **Password Hashing**: bcrypt with cost factor 10
- **Session Management**: JWT tokens (HS256)
- **Token Expiry**: 7 days
- **Database**: PostgreSQL via Prisma ORM
- **Validation**: Zod schemas for input validation

### Architecture Diagram

```
User Registration Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. User POST /api/auth/signup                              │
│    ├─ Email, name, password (plain text via HTTPS)        │
│    └─ Age (optional)                                       │
├─────────────────────────────────────────────────────────────┤
│ 2. Server Validation                                       │
│    ├─ Zod schema validation                                │
│    ├─ Email format & uniqueness check                      │
│    ├─ Password strength validation                         │
│    └─ Return 400 if invalid                                │
├─────────────────────────────────────────────────────────────┤
│ 3. Password Hashing                                        │
│    ├─ bcrypt.hash(password, 10)                            │
│    ├─ Automatic salt generation                            │
│    └─ Result: $2b$10$... (60 chars)                        │
├─────────────────────────────────────────────────────────────┤
│ 4. Database Storage                                        │
│    ├─ Create User with hashed password                     │
│    ├─ Set role to 'USER'                                   │
│    └─ timestamp: createdAt = now()                         │
├─────────────────────────────────────────────────────────────┤
│ 5. JWT Token Generation                                    │
│    ├─ Payload: { userId, email, iat }                      │
│    ├─ Sign with HS256 + JWT_SECRET                         │
│    ├─ Expiry: 7 days                                       │
│    └─ Result: eyJh... (long string)                        │
├─────────────────────────────────────────────────────────────┤
│ 6. Response 201 Created                                    │
│    ├─ User data (id, email, username, role)              │
│    ├─ JWT token (store on client)                          │
│    └─ Expires in: "7d"                                     │
└─────────────────────────────────────────────────────────────┘

User Login Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. User POST /api/auth/login                               │
│    ├─ Email, password (plain text via HTTPS)              │
│    └─ Return 400 if invalid format                         │
├─────────────────────────────────────────────────────────────┤
│ 2. Database Lookup                                         │
│    ├─ Find user by email                                   │
│    └─ Return 401 if not found                              │
├─────────────────────────────────────────────────────────────┤
│ 3. Password Verification                                   │
│    ├─ bcrypt.compare(password, storedHash)                 │
│    ├─ Constant-time comparison                             │
│    └─ Return 401 if mismatch                               │
├─────────────────────────────────────────────────────────────┤
│ 4. JWT Token Generation                                    │
│    ├─ Same as signup                                       │
│    └─ userId & email in payload                            │
├─────────────────────────────────────────────────────────────┤
│ 5. Response 200 OK                                         │
│    ├─ User data                                            │
│    ├─ New JWT token                                        │
│    └─ Expires in: "7d"                                     │
└─────────────────────────────────────────────────────────────┘

Protected Route Access:
┌─────────────────────────────────────────────────────────────┐
│ 1. Client GET /api/users                                   │
│    └─ Header: Authorization: Bearer <JWT_TOKEN>            │
├─────────────────────────────────────────────────────────────┤
│ 2. Token Extraction                                        │
│    ├─ Remove "Bearer " prefix                              │
│    └─ Return 401 if missing                                │
├─────────────────────────────────────────────────────────────┤
│ 3. Token Verification                                      │
│    ├─ jwt.verify(token, JWT_SECRET)                        │
│    ├─ Check signature validity                             │
│    ├─ Check expiration time                                │
│    └─ Return 401 if failed                                 │
├─────────────────────────────────────────────────────────────┤
│ 4. Extract User Data                                       │
│    ├─ userId & email from token payload                    │
│    └─ Use for authorization checks                         │
├─────────────────────────────────────────────────────────────┤
│ 5. Process Request                                         │
│    ├─ Execute protected business logic                     │
│    └─ Return 200 with data                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### Authentication Endpoints

#### Signup: `POST /api/auth/signup`

Register a new user account.

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "SecurePass123!",
    "age": 28
  }'
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&\*)

**Success Response (201):**

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
  }
}
```

---

#### Login: `POST /api/auth/login`

Authenticate user and receive JWT token.

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }'
```

**Success Response (200):**

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
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "UNAUTHORIZED",
  "statusCode": 401
}
```

---

### Protected User Routes

All user endpoints require JWT authentication in the `Authorization` header.

#### Get Users: `GET /api/users`

Retrieve list of all users.

**Request:**

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10&search=alice" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `role` (string): Filter by role (USER, ADMIN, MODERATOR)
- `search` (string): Search by name or email

**Success Response (200):**

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

---

## 📁 Project Structure

```
startupdiscovery/
├── lib/
│   ├── auth.ts                      # Password & JWT utilities
│   ├── responseHandler.ts           # Standardized API responses
│   ├── errorCodes.ts                # Error code catalog
│   ├── prisma.ts                    # Prisma client singleton
│   └── schemas/
│       ├── authSchema.ts            # Signup/login validation
│       ├── userSchema.ts            # User data validation
│       ├── taskSchema.ts            # Task validation
│       └── projectSchema.ts         # Project validation
├── app/api/
│   ├── auth/
│   │   ├── signup/route.ts          # POST /api/auth/signup
│   │   └── login/route.ts           # POST /api/auth/login
│   ├── users/route.ts               # GET/POST/PUT/DELETE /api/users
│   ├── tasks/route.ts               # Task management
│   └── projects/route.ts            # Project management
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # Database migrations
├── AUTH_DOCUMENTATION.md            # Detailed auth guide
├── test-auth.ps1                    # Comprehensive test suite
└── package.json                     # Dependencies
```

---

## 🛡️ Security Features

### 1. Password Security

- ✅ bcrypt hashing with cost factor 10
- ✅ Automatic salt generation
- ✅ Never stored in plain text
- ✅ Constant-time comparison

### 2. JWT Security

- ✅ HMAC-SHA256 signature
- ✅ Token expiration (7 days)
- ✅ Signature verification on each request
- ✅ Payload tampering detection

### 3. Input Validation

- ✅ Zod schema validation
- ✅ Email format verification
- ✅ Password strength enforcement
- ✅ SQL injection prevention (Prisma ORM)

### 4. Database Security

- ✅ Unique constraints (email, username)
- ✅ Role-based access control
- ✅ Parameterized queries
- ✅ XSS prevention through JSON encoding

### 5. Request Security

- ✅ HTTPS recommended for production
- ✅ Authorization header validation
- ✅ Bearer token parsing
- ✅ Proper HTTP status codes

---

## 🧪 Testing

### Run Comprehensive Test Suite

```bash
# Make sure server is running on http://localhost:3000
npm run dev

# In another terminal:
.\test-auth.ps1
```

### Test Coverage

The test suite (`test-auth.ps1`) includes:

**Signup Tests:**

- ✅ Valid user registration
- ❌ Duplicate email prevention
- ❌ Weak password validation
- ❌ Missing required fields

**Login Tests:**

- ✅ Valid credentials
- ❌ Invalid password
- ❌ Non-existent user
- ❌ Missing password field

**Protected Route Tests:**

- ✅ Valid JWT access
- ❌ Missing authorization header
- ❌ Invalid/tampered token
- ❌ Malformed header
- ✅ Pagination & search with auth

**Token Analysis:**

- 📋 JWT header inspection
- 📦 Payload decoding
- 🔒 Signature verification
- ⏱️ Expiration time checking

### Manual Testing Examples

```bash
# Test Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Test Login and capture token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }' | jq -r '.data.token')

# Test Protected Route
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💭 Reflection & Best Practices

### Token Expiry & Refresh

**Current Implementation (7-Day Expiry):**

- Single token valid for 7 days
- User must re-login after expiration
- Simple but less secure for long-lived tokens

**Recommended Pattern (Refresh Token):**

```
Access Token (1 hour) + Refresh Token (7 days)
├─ Use access token for API requests
├─ When expired, use refresh token for new access token
├─ No user interaction needed (seamless)
└─ Compromised access token has short window
```

### Token Storage Best Practices

| Method               | Pros                        | Cons            | Best For        |
| -------------------- | --------------------------- | --------------- | --------------- |
| **HTTP-Only Cookie** | XSS safe, automatic sending | CSRF vulnerable | Production apps |
| **localStorage**     | Simple, persistent          | XSS vulnerable  | Dev/testing     |
| **sessionStorage**   | Simple, cleared on close    | XSS vulnerable  | Short sessions  |
| **Memory Variable**  | XSS safe, not persisted     | Lost on refresh | SPA with SSR    |

**Production Recommendation:**

- Secure HTTP-Only Cookie with CSRF token
- Implement refresh token endpoint
- Add CSRF protection middleware
- Use SameSite=Strict flag

### Security Enhancements

#### 1. Token Leak Handling

```typescript
// If token leaks (e.g., GitHub commit):
// 1. Detect via security scanner
// 2. Immediately invalidate all sessions
// 3. Notify user of unusual activity
// 4. Force re-login with password
// 5. Issue new JWT token
// 6. Keep leaked token in blacklist
```

#### 2. Session Management

```typescript
// Store sessions in database:
model Session {
  id: String @id
  userId: Int
  token: String @unique
  ipAddress: String
  userAgent: String
  expiresAt: DateTime
}

// Benefits:
// - Revoke specific sessions
// - Detect unauthorized access
// - Force logout across devices
// - Audit login history
```

#### 3. Rate Limiting

```
// Protect auth endpoints:
POST /api/auth/signup - 5 attempts per hour per IP
POST /api/auth/login - 5 failed attempts per 15 min
```

#### 4. Multi-Factor Authentication

```
// Enhanced security:
1. Email/password login
2. Verify with OTP sent to email
3. Issue JWT after verification
```

### Creative Reflection Question

> **Imagine a token leaks or expires unexpectedly — how would your authentication system handle that while keeping users safe and logged in?**

**Answer:**

1. **Token Leak Detected**
   - Security scanner finds token in Git history
   - Immediately blacklist the token in database
   - Revoke all active sessions for that user
   - Send email: "Unusual activity detected. Re-authenticate?"

2. **User Clicks Link**
   - Clear client-side tokens
   - Redirect to login page
   - User enters credentials
   - New JWT issued (old token still blacklisted)

3. **Token Expires Naturally**
   - Client receives 401 Unauthorized
   - Client uses refresh token (in secure cookie)
   - Server issues new access token
   - No user interaction needed (seamless)

4. **Keep Users Safe**
   - Short-lived access tokens (1 hour)
   - Long-lived refresh tokens (7 days)
   - Database session tracking
   - Anomaly detection for unusual patterns
   - Device fingerprinting

5. **Keep Users Logged In**
   - Automatic token refresh before expiry
   - Graceful handling of refresh token expiry
   - Clear error messages for final logout
   - Remember device option (with caution)

---

## 📖 Additional Resources

- [AUTH_DOCUMENTATION.md](./AUTH_DOCUMENTATION.md) - Complete auth guide
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [jsonwebtoken Documentation](https://www.npmjs.com/package/jsonwebtoken)
- [JWT.io Debugger](https://jwt.io) - Decode and inspect tokens
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Prisma Security](https://www.prisma.io/docs/orm/basics/security)

---

## 🎯 Summary

This authentication system implements industry best practices for secure user management:

- **Secure**: bcrypt password hashing + JWT signature verification
- **Scalable**: Prisma ORM with PostgreSQL backend
- **Validated**: Zod schemas on all inputs
- **Tested**: Comprehensive test suite included
- **Documented**: Full guides and code examples provided
- **Reflective**: Best practices and security considerations included

For production deployment, implement the recommended enhancements:

- Refresh token pattern
- Token blacklisting
- Session database storage
- Rate limiting
- Multi-factor authentication

---

**Last Updated**: January 5, 2024  
**Status**: ✅ Complete and Tested
