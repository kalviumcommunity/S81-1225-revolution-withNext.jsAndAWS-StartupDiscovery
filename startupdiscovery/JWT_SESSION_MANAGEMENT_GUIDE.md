# Secure JWT & Session Management Implementation

## Overview

This guide documents the complete implementation of secure JWT (JSON Web Token) and session management for the Startup Discovery application. The system uses:

- **Access Tokens** (15 minutes) - Short-lived tokens for API authentication
- **Refresh Tokens** (7 days) - Long-lived tokens for obtaining new access tokens
- **HTTP-Only Cookies** - Secure token storage preventing JavaScript access
- **Token Rotation** - Version tracking to prevent replay attacks
- **Session Revocation** - Logout invalidates sessions server-side

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. LOGIN / SIGNUP
   ┌──────────────────┐
   │ User Credentials │
   └──────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────┐
   │ Server Validates & Creates Session       │
   │ - Hash refresh token (never store plain) │
   │ - Increment token version                │
   │ - Record IP, User-Agent                  │
   └──────────────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────┐
   │ Generate Token Pair                      │
   │ - Access: 15m expiry                     │
   │ - Refresh: 7d expiry                     │
   └──────────────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────┐
   │ Set Secure Cookies (HTTP-Only)           │
   │ - SameSite=Lax (access)                  │
   │ - SameSite=Strict (refresh)              │
   │ - Secure flag (HTTPS only in production) │
   └──────────────────────────────────────────┘
            │
            ▼
   Client receives tokens in secure cookies

2. API REQUEST
   ┌──────────────────────────────────────┐
   │ Browser automatically sends cookies   │
   │ (hidden from JavaScript)              │
   └──────────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ Server validates access token        │
   │ - Check signature                    │
   │ - Check expiry                       │
   │ - Check type = "access"              │
   └──────────────────────────────────────┘
            │
       ┌────┴────┐
       ▼         ▼
    VALID    EXPIRED
       │         │
       │         ▼
       │  ┌──────────────────────────┐
       │  │ Send 401 Unauthorized    │
       │  │ Client should refresh    │
       │  └──────────────────────────┘
       │
       ▼
   ┌──────────────────────────────────────┐
   │ Process request with user context    │
   └──────────────────────────────────────┘

3. TOKEN REFRESH
   ┌──────────────────────────────────────┐
   │ Client: POST /api/auth/refresh       │
   │ (automatically sends refresh cookie) │
   └──────────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ Server validates refresh token       │
   │ - Check signature                    │
   │ - Check expiry                       │
   │ - Check type = "refresh"             │
   │ - Check session not revoked          │
   │ - Verify token version               │
   └──────────────────────────────────────┘
            │
       ┌────┴──────────────┐
       ▼                   ▼
    VALID              INVALID/REVOKED
       │                   │
       ▼                   ▼
   Issue new tokens   401 + redirect
   Increment version   to login
   Set new cookies

4. LOGOUT
   ┌──────────────────────────────────────┐
   │ Client: POST /api/auth/logout        │
   │ (with refresh token cookie)          │
   └──────────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ Server revokes session                │
   │ - Mark isRevoked = true              │
   │ - Record revokedAt timestamp         │
   │ - Clear cookies with Max-Age=0       │
   └──────────────────────────────────────┘
            │
            ▼
   Old tokens invalid, user logged out
```

## Token Structure

### Access Token (15 minutes)

```typescript
{
  userId: number,
  email: string,
  role: "USER" | "ADMIN" | "MODERATOR",
  type: "access",
  iat: 1234567890,          // Issued at
  exp: 1234568790           // Expires (15 minutes later)
}
```

**Purpose**: Authenticate API requests
**Storage**: HTTP-only cookie (SameSite=Lax)
**Usage**: Automatic in every request

### Refresh Token (7 days)

```typescript
{
  userId: number,
  email: string,
  type: "refresh",
  tokenVersion: 1,          // Incremented on each refresh
  iat: 1234567890,
  exp: 1234987890           // Expires (7 days later)
}
```

**Purpose**: Obtain new access tokens
**Storage**: HTTP-only cookie (SameSite=Strict)
**Usage**: POST /api/auth/refresh when access token expires

### Database Session Record

```typescript
{
  id: string,                    // Unique session ID (CUID)
  userId: number,                // Reference to user
  token: string,                 // Reference to access token
  refreshTokenHash: string,      // SHA256 hash of refresh token
  tokenVersion: number,          // Current rotation version
  expiresAt: Date,              // Access token expiry
  createdAt: Date,              // Session creation time
  ipAddress: string | null,     // Client IP for audit
  userAgent: string | null,     // Browser info for audit
  isRevoked: boolean,           // Logout flag
  revokedAt: Date | null        // When session was revoked
}
```

## Implementation Details

### 1. Token Generation

**File**: [lib/auth.ts](lib/auth.ts)

```typescript
// Generate both tokens at once
const { accessToken, refreshToken, expiresIn } = generateTokenPair(
  userId,
  email,
  role
);

// Or generate individually
const accessToken = generateAccessToken(userId, email, role);
const refreshToken = generateRefreshToken(userId, email, tokenVersion);

// Verify tokens
const decoded = verifyAccessToken(accessToken);
const decoded = verifyRefreshToken(refreshToken);
```

**Key Functions**:

- `generateAccessToken()` - Create short-lived access token
- `generateRefreshToken()` - Create long-lived refresh token
- `generateTokenPair()` - Create both tokens atomically
- `verifyAccessToken()` - Validate access token signature/expiry
- `verifyRefreshToken()` - Validate refresh token signature/expiry

### 2. Secure Token Storage

**File**: [lib/tokenManager.ts](lib/tokenManager.ts)

```typescript
// Cookie configuration
ACCESS_TOKEN_COOKIE_CONFIG = {
  httpOnly: true, // Cannot access via JavaScript
  secure: true, // HTTPS only in production
  sameSite: "lax", // Allow top-level navigation
  maxAge: 15 * 60, // 15 minutes
  path: "/",
};

REFRESH_TOKEN_COOKIE_CONFIG = {
  httpOnly: true,
  secure: true,
  sameSite: "strict", // No cross-site requests
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: "/",
};

// Set cookies in response
const headers = new Headers();
headers.set("Set-Cookie", [
  getAccessTokenCookieHeader(accessToken),
  getRefreshTokenCookieHeader(refreshToken),
]);
```

**Key Features**:

- HTTP-Only flag: Prevents JavaScript access (XSS protection)
- Secure flag: Only transmitted over HTTPS in production
- SameSite=Strict (refresh) + Lax (access): CSRF protection
- Max-Age: Automatic cookie expiry matching token expiry

### 3. Login Flow

**File**: [app/api/auth/login/route.ts](app/api/auth/login/route.ts)

```typescript
1. Validate credentials (email + password)
2. Compare password against hash
3. Generate token pair
4. Hash refresh token for database storage (security)
5. Create session record with:
   - Token hash (not plain token)
   - Token version (1 for first login)
   - User IP and User-Agent
6. Set secure cookies
7. Update user lastLoginAt timestamp
```

**Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "expiresIn": "15m",
    "tokenVersion": 1,
    "sessionId": "..."
  }
}
```

### 4. Refresh Token Flow

**File**: [app/api/auth/refresh/route.ts](app/api/auth/refresh/route.ts)

```typescript
1. Extract refresh token from cookie
2. Verify token signature and type
3. Hash token and look up session
4. Check session not revoked (isRevoked = false)
5. SECURITY CHECK: Verify token version matches
   - If mismatch: token reuse detected → revoke all sessions
6. Generate new access token
7. Increment version number
8. Hash new refresh token
9. Update session with new version and hash
10. Set new cookies
11. Log rotation event
```

**Security Checks**:

- Token version mismatch = possible replay attack
- On mismatch: Revoke ALL sessions for user
- Log security event for audit trail

**Response**:

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "expiresIn": "15m",
    "tokenVersion": 2,
    "refreshedAt": "2025-01-07T10:30:00Z"
  }
}
```

### 5. Logout Flow

**File**: [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts)

```typescript
1. Extract refresh token from cookie
2. Hash token and find session
3. Mark session as revoked (isRevoked = true)
4. Record revocation timestamp
5. Clear cookies with Max-Age=0
6. Log logout event
```

**Important**: Cookies are cleared immediately in response, preventing further use.

### 6. Middleware Protection

**File**: [middleware.ts](middleware.ts)

```typescript
// For protected routes like /dashboard, /users, etc:
1. Extract access token from cookie or Authorization header
2. Verify token signature and expiry
3. Check token type = "access"
4. Add user context to request headers
5. Allow or redirect to /login
```

**Supported Token Sources** (in order):

1. Authorization header: `Authorization: Bearer <token>`
2. Cookie: `accessToken=<token>`
3. Fallback: Redirect to login

## Security Implementation

### 1. XSS Protection (No localStorage)

**Vulnerability**: Cross-Site Scripting (XSS)

- Attacker injects JavaScript
- JavaScript accesses `localStorage.getItem('token')`
- Attacker sends token to their server

**Our Solution**: HTTP-Only Cookies

- Tokens stored in HTTP-Only cookies
- JavaScript cannot access `document.cookie`
- Browser sends cookies automatically in requests
- Even if JavaScript is compromised, tokens remain secure

**Code**:

```typescript
// SECURE: HTTP-Only cookie
headers.set("Set-Cookie", "accessToken=...; HttpOnly; Secure");

// NOT SECURE: localStorage (not used)
localStorage.setItem("token", "..."); // ❌ Vulnerable
```

### 2. CSRF Protection (SameSite & HTTPS)

**Vulnerability**: Cross-Site Request Forgery (CSRF)

- Attacker's website makes request to your bank
- Browser automatically sends cookies
- Request appears legitimate, funds transferred

**Our Solution**: SameSite Policy

- `SameSite=Strict` on refresh token: Never sent in cross-site requests
- `SameSite=Lax` on access token: Only sent for top-level navigation
- Requires Secure flag (HTTPS) in production

**Code**:

```typescript
// Refresh token: Strict (most secure)
refreshToken=...; SameSite=Strict;

// Access token: Lax (allows top-level nav)
accessToken=...; SameSite=Lax;

// Both: Secure flag (HTTPS only)
...;Secure;  // Only sent over HTTPS in production
```

### 3. Token Replay Attack Protection

**Vulnerability**: Token Reuse

- Attacker captures old refresh token
- Uses token after user logout
- Creates fake sessions

**Our Solution**: Token Rotation + Version Tracking

- Each refresh increments version number
- Database stores current version
- Old version = invalid (token reuse detected)
- On version mismatch: Revoke ALL user sessions

**Code**:

```typescript
// Database session record
{
  tokenVersion: 1,      // Current version
  isRevoked: false,     // Logout flag
  revokedAt: null
}

// On refresh:
if (decoded.tokenVersion !== session.tokenVersion) {
  // Version mismatch = replay attack
  // Revoke all sessions
  await revokeAllUserSessions(userId);
  return 401;
}
```

### 4. Token Tampering Prevention

**Vulnerability**: Modification

- Attacker modifies token (changes userId)
- Claims to be different user

**Our Solution**: HMAC Signature

- Token signed with server secret (HS256)
- Tampering invalidates signature
- jwt.verify() checks signature

**Code**:

```typescript
// Token is signed
jwt.sign(payload, secret, { algorithm: "HS256" });

// Verification fails if tampered
jwt.verify(token, secret); // Throws if signature invalid
```

### 5. Token Expiry Enforcement

**Vulnerability**: Long-lived tokens

- Stolen token valid forever
- No way to revoke except blacklist

**Our Solution**: Short Expiry Times

- Access token: 15 minutes
- After expiry: 401 Unauthorized
- Client uses refresh token to get new access token

**Code**:

```typescript
// Access token expires quickly
jwt.sign(payload, secret, { expiresIn: "15m" });

// Verification fails after expiry
jwt.verify(token, secret); // Throws if expired
```

### 6. Secure Token Storage (Database)

**Vulnerability**: Token Leak

- Database breached
- Attacker has all refresh tokens
- Can impersonate users

**Our Solution**: Hash Refresh Tokens

- Never store plain tokens in database
- Store SHA256 hash instead
- Token useful immediately (hash in request)
- Hash not reversible

**Code**:

```typescript
// When storing token
const tokenHash = crypto
  .createHash("sha256")
  .update(refreshToken)
  .digest("hex");

await db.session.create({
  refreshTokenHash: tokenHash, // Store hash, not token
});

// When verifying
const tokenHash = crypto
  .createHash("sha256")
  .update(refreshToken)
  .digest("hex");

const session = await db.session.findUnique({
  where: { refreshTokenHash: tokenHash }, // Lookup by hash
});
```

### 7. Audit Trail & Monitoring

**Code**: [lib/tokenManager.ts](lib/tokenManager.ts)

```typescript
// Log token rotation
logTokenRotation({
  previousTokenVersion: 1,
  newTokenVersion: 2,
  rotatedAt: new Date(),
  reason: "refresh"
});

// Session records include:
{
  ipAddress: "192.168.1.1",      // Detect suspicious IPs
  userAgent: "Mozilla/5.0...",   // Detect device changes
  createdAt: "2025-01-07...",    // Timeline of sessions
  revokedAt: "2025-01-07..."     // When/if logged out
}
```

## Potential Vulnerabilities & Trade-offs

### 1. Subdomain Cookie Sharing

**Issue**: Cookies sent to all subdomains by default

- `app.example.com` and `api.example.com` both get token cookie
- If any subdomain is compromised, token at risk

**Mitigation**:

```typescript
// Specify domain explicitly
{ path: "/", domain: ".example.com" }

// OR use separate origins
// api.example.com (API server)
// app.example.com (Frontend)
// Different domains = different cookies
```

### 2. Timing Attack

**Issue**: Token validation timing varies based on signature validity

- Attacker sends many forged tokens
- Measures response time differences
- Deduces information about validation

**Mitigation**:

- Modern JWT libraries handle this
- `jwt.verify()` uses constant-time comparison
- Negligible impact in practice

### 3. Clock Skew

**Issue**: Server clocks out of sync

- Refresh server A: Issues token with exp=T
- Validate server B (clock behind): Token already expired
- Legitimate token rejected

**Mitigation**:

```typescript
// Add 30-second buffer
const BUFFER_SECONDS = 30;
const now = Math.floor(Date.now() / 1000);
return now >= expiresAt - BUFFER_SECONDS;
```

### 4. Refresh Token Invalidation Lag

**Issue**: Logout revokes session, but old token still valid briefly

- User logs out, immediately uses old token
- Session marked revoked, but token verification happens first
- Race condition in distributed system

**Mitigation**:

- Single-server setup: No race condition
- Distributed: Use cache invalidation
- Token version check happens after session lookup
- Worst-case: Token valid for request latency only

### 5. Cannot Use Tokens from JavaScript

**Issue**: Can't access tokens for custom headers

- Tokens in HTTP-Only cookies
- JavaScript can't read them
- Custom headers must use Authorization header

**Mitigation**:

- Server must set Authorization header for API calls
- OR use fetch/axios interceptors (not direct)
- OR accept that authorization happens via cookies

**This is by design** - prevents XSS from stealing tokens.

## API Endpoints

### 1. Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Lax
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict

{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { id, name, email, username, role },
    "expiresIn": "15m",
    "tokenVersion": 1
  }
}
```

### 2. Signup

```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: 201 Created
Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Lax
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict

{
  "success": true,
  "message": "User registered successfully",
  "data": { ... }
}
```

### 3. Refresh Token

```
POST /api/auth/refresh
Cookie: refreshToken=...

Response: 200 OK
Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Lax
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict

{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "expiresIn": "15m",
    "tokenVersion": 2,
    "refreshedAt": "2025-01-07T..."
  }
}
```

### 4. Logout

```
POST /api/auth/logout
Cookie: refreshToken=...

Response: 200 OK
Set-Cookie: accessToken=; Max-Age=0; Path=/
Set-Cookie: refreshToken=; Max-Age=0; Path=/

{
  "success": true,
  "message": "Logout successful"
}
```

## Environment Variables

Add to `.env.local`:

```bash
# JWT Secrets (use strong random strings)
# Generate with: openssl rand -base64 32
JWT_ACCESS_SECRET=your_access_secret_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars

# Database URL
DATABASE_URL=postgresql://user:password@localhost:5432/startup_discovery

# Node environment
NODE_ENV=development  # or production
```

## Best Practices

### 1. Token Generation

✅ Use strong secrets (32+ characters)
✅ Use separate secrets for access/refresh
✅ Rotate secrets periodically in production
✅ Store secrets in environment variables

### 2. Token Storage

✅ Use HTTP-Only cookies for tokens
✅ Set Secure flag in production
✅ Set SameSite policy (Strict/Lax)
✅ Set appropriate Max-Age/Expires

### 3. Session Management

✅ Hash refresh tokens before storage
✅ Track token version for rotation
✅ Record IP and User-Agent for audit
✅ Mark sessions revoked on logout
✅ Clean up expired sessions periodically

### 4. Token Verification

✅ Verify signature (tamper detection)
✅ Verify expiry (time checking)
✅ Verify type (access vs refresh)
✅ Verify version (replay detection)

### 5. Error Handling

✅ Return 401 Unauthorized for expired tokens
✅ Return 403 Forbidden for revoked sessions
✅ Don't expose specific error reasons
✅ Log security events for audit trail

## Testing Token Rotation

### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}' \
  -v
```

Response cookies show:

- `accessToken=...` (15m expiry)
- `refreshToken=...` (7d expiry)
- Token version = 1

### 2. Refresh

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Cookie: refreshToken=..." \
  -v
```

Response shows:

- New `accessToken=...`
- New `refreshToken=...` (rotated)
- Token version = 2 (incremented!)

### 3. Verify Rotation in Logs

```
[TOKEN_ROTATION] User token rotated - Version: 1 → 2
```

### 4. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: refreshToken=..." \
  -v
```

Response shows:

- `accessToken=; Max-Age=0`
- `refreshToken=; Max-Age=0`
- Session marked revoked

## Migration from Old System

If upgrading from single-token system:

```typescript
// Old: Single token
const token = generateToken(userId, email, role);

// New: Token pair
const { accessToken, refreshToken } = generateTokenPair(userId, email, role);

// Old secrets (still supported for verification):
process.env.JWT_SECRET;

// New secrets (used for generation):
process.env.JWT_ACCESS_SECRET;
process.env.JWT_REFRESH_SECRET;
```

## Conclusion

This implementation provides:

- ✅ **Security**: XSS protection, CSRF protection, replay attack prevention
- ✅ **Usability**: Automatic token refresh, no manual handling
- ✅ **Auditability**: IP tracking, session logging, rotation events
- ✅ **Reliability**: Multiple verification checks, graceful expiry
- ✅ **Scalability**: Stateless tokens (except session record)

The token rotation mechanism provides strong security against replay attacks while maintaining excellent user experience through automatic refresh.
