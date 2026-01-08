# Input Sanitization & OWASP Compliance Guide

**Date**: January 8, 2026  
**Branch**: `Input-Sanitization-OWASP-Compliance`  
**Status**: ✅ Complete & Implemented

---

## Executive Summary

This document outlines the comprehensive security implementation for the StartupDiscovery application, focusing on input sanitization and OWASP-compliant security practices to protect against XSS (Cross-Site Scripting) and SQL Injection (SQLi) attacks.

### Key Achievements

- ✅ Implemented multi-level input sanitization utilities
- ✅ Applied sanitization across all API endpoints
- ✅ Created safe UI components with built-in protection
- ✅ Configured OWASP security headers and middleware
- ✅ Added pattern detection for XSS/SQLi attempts
- ✅ Demonstrated before/after attack scenarios

---

## 1. Architecture & Components

### 1.1 Server-Side Sanitization (`lib/security/sanitizer.ts`)

**Sanitization Levels**:

```typescript
enum SanitizationLevel {
  STRICT = "strict", // Removes all HTML tags - plain text only
  MODERATE = "moderate", // Allows safe formatting tags
  MINIMAL = "minimal", // Minimal sanitization
}
```

**Core Functions**:

| Function              | Purpose                       | Use Case                     |
| --------------------- | ----------------------------- | ---------------------------- |
| `sanitizeHtmlInput()` | Remove dangerous HTML/scripts | Comments, descriptions       |
| `sanitizeTextInput()` | Plain text with HTML escaping | Titles, names, usernames     |
| `sanitizeUrl()`       | Validate and sanitize URLs    | Website links, external URLs |
| `sanitizeEmail()`     | Sanitize email addresses      | Email inputs                 |
| `sanitizeNumber()`    | Validate numeric input        | IDs, counts                  |
| `sanitizeObject()`    | Recursively sanitize objects  | API request bodies           |
| `encodeOutput()`      | HTML entity encoding          | Safe display in templates    |

**Attack Pattern Detection**:

```typescript
hasXSSPatterns(input); // Detects: <script>, javascript:, event handlers
hasSQLiPatterns(input); // Detects: ' OR 1=1, UNION, DROP, --
```

### 1.2 Client-Side Sanitization (`lib/security/clientSanitizer.ts`)

Uses **DOMPurify** for React component protection:

```typescript
// Safe HTML display
<SafeHtml html={userContent} />

// Safe plain text
<SafeText>{userInput}</SafeText>
```

### 1.3 Security Headers & Middleware (`lib/security/headers.ts`)

**OWASP Security Headers**:

| Header                    | Purpose                    | Value                       |
| ------------------------- | -------------------------- | --------------------------- |
| Content-Security-Policy   | Prevent inline scripts/XSS | default-src 'self'          |
| X-Content-Type-Options    | Prevent MIME sniffing      | nosniff                     |
| X-Frame-Options           | Prevent clickjacking       | DENY                        |
| X-XSS-Protection          | Legacy XSS protection      | 1; mode=block               |
| Strict-Transport-Security | Force HTTPS                | max-age=31536000            |
| Permissions-Policy        | Restrict browser APIs      | camera, microphone disabled |

### 1.4 Safe UI Components (`components/SafeUIComponents.tsx`)

Pre-built components with integrated sanitization:

- `SafeComment` - Display comments with sanitization
- `SafeStartupCard` - Render startup info safely
- `SafeUserProfile` - User data display
- `SafeFormInput` - Input fields with validation
- `SafeTextArea` - Rich text area with sanitization
- `SecurityWarning` - Display security alerts

---

## 2. Implementation Details

### 2.1 API Endpoint Protection

**Comments Endpoint** (`app/api/protected/comments/route.ts`):

```typescript
// Before: Raw user input stored
const comment = await prisma.comment.create({
  data: { content: validatedData.content, ... }
});

// After: Sanitized and validated
const sanitizedContent = sanitizeHtmlInput(validatedData.content);
const validation = validateInput(sanitizedContent, {
  required: true, minLength: 1, maxLength: 500,
  checkXSS: true, checkSQLi: true
});

const comment = await prisma.comment.create({
  data: { content: sanitizedContent, ... }
});
```

**Startups Endpoint** (`app/api/protected/startups/route.ts`):

```typescript
// Sanitize all input fields
const sanitizedTitle = sanitizeTextInput(validatedData.title);
const sanitizedDescription = sanitizeHtmlInput(validatedData.description);
const sanitizedWebsiteUrl = sanitizeUrl(validatedData.websiteUrl);

// Create with sanitized data
const startup = await prisma.startup.create({
  data: {
    title: sanitizedTitle,
    description: sanitizedDescription,
    websiteUrl: sanitizedWebsiteUrl,
    ...
  }
});
```

**Roles Endpoint** (`app/api/protected/roles/route.ts`):

```typescript
// Sanitize numeric input
const sanitizedUserId = sanitizeNumber(validatedData.userId);
if (sanitizedUserId === null) {
  return sendError("Invalid user ID", ..., 400);
}
```

### 2.2 Input Validation Pipeline

```
Raw Input
    ↓
Schema Validation (Zod)
    ↓
Sanitization (sanitizeHtmlInput/sanitizeTextInput/etc)
    ↓
Pattern Detection (hasXSSPatterns/hasSQLiPatterns)
    ↓
Business Logic Validation
    ↓
Database Storage (Prisma with parameterized queries)
    ↓
Safe Output Encoding (React components)
```

### 2.3 Database Protection

**Prisma ORM (Parameterized Queries)**:

✅ SAFE:

```typescript
const user = await prisma.user.findMany({
  where: { username: userInput }, // Parameterized
});
```

❌ UNSAFE (Not used):

```typescript
const user = await prisma.user.findMany({
  where: { username: `'${userInput}'` }, // String concatenation
});
```

---

## 3. Attack Prevention Examples

### 3.1 XSS Attack Prevention

**Attack Payload**:

```html
<script>
  alert("XSS Attack!");
</script>
```

**Before Sanitization**:

```
Input:  <script>alert("XSS Attack!")</script>
Status: ❌ UNSAFE - Script would execute
```

**After Sanitization (STRICT)**:

```
Output: (empty - all tags removed)
Status: ✅ SAFE - Script cannot execute
```

**After Sanitization (MODERATE)**:

```
Output: (empty - script tags not allowed)
Status: ✅ SAFE - Dangerous tags removed
```

### 3.2 SQL Injection Prevention

**Attack Payload**:

```sql
' OR '1'='1' --
```

**Before Validation**:

```
Input:  ' OR '1'='1' --
Status: ❌ UNSAFE - Would bypass authentication
```

**After Validation**:

```
Valid:   false
Message: "Input contains potentially malicious content (SQLi detected)"
Status:  ✅ SAFE - Malicious pattern blocked
```

**Parameterized Query Protection**:

```typescript
// Even if validation missed the attack, Prisma parameterizes it:
const user = await prisma.user.findUnique({
  where: { email: userInput }, // Treated as data, not SQL
});

// Generated SQL: SELECT ... WHERE email = $1 (parameter)
// The input is never interpreted as SQL code
```

### 3.3 Event Handler XSS Prevention

**Attack Payload**:

```html
<img src="x" onerror="alert('XSS')" />
```

**Sanitization Output**:

```html
<img src="x" />
<!-- onerror attribute removed -->
```

### 3.4 Data Attribute XSS Prevention

**Attack Payload**:

```html
<div onclick="alert('XSS')">Click me</div>
```

**Sanitization Output**:

```html
<div>Click me</div>
<!-- onclick removed, allowed tag structure preserved -->
```

---

## 4. OWASP Compliance Checklist

### A1: Injection (SQLi, XSS)

- ✅ Parameterized queries with Prisma ORM
- ✅ Input validation and sanitization
- ✅ Output encoding in components
- ✅ Pattern detection for known attacks

### A2: Broken Authentication

- ✅ JWT token verification (existing RBAC system)
- ✅ Secure password hashing (existing implementation)
- ✅ Session timeout protection

### A3: Sensitive Data Exposure

- ✅ HTTPS enforcement (HSTS headers)
- ✅ Secure headers configuration
- ✅ No sensitive data in logs

### A4: XML External Entities (XXE)

- ✅ Input validation prevents malicious XML
- ✅ Safe parsing with sanitization

### A5: Broken Access Control

- ✅ RBAC system with role-based permissions (existing)
- ✅ Resource ownership verification
- ✅ Audit logging for security events

### A6: Security Misconfiguration

- ✅ OWASP security headers implemented
- ✅ CSP policy configured
- ✅ CORS properly configured
- ✅ Security best practices enforced

### A7: Cross-Site Scripting (XSS)

- ✅ Input sanitization (multiple levels)
- ✅ Output encoding
- ✅ DOMPurify on client-side
- ✅ CSP headers prevent inline scripts

### A8: Insecure Deserialization

- ✅ Safe JSON parsing with validation
- ✅ Zod schema validation

### A9: Using Components with Known Vulnerabilities

- ✅ Regular dependency updates
- ✅ Security audit for packages
- ✅ Legacy-peer-deps handled for compatibility

### A10: Insufficient Logging & Monitoring

- ✅ RBAC audit logging
- ✅ Request logging middleware
- ✅ Error tracking and monitoring

---

## 5. File Inventory

### Security Module Files

```
lib/security/
├── sanitizer.ts              # Core sanitization functions
├── clientSanitizer.ts        # Client-side DOMPurify utilities
├── headers.ts                # OWASP security headers & middleware
├── demo.ts                   # Before/after attack demonstrations
└── index.ts                  # Security module exports
```

### Protected Components

```
components/
└── SafeUIComponents.tsx      # Safe rendering components
```

### Protected Endpoints

```
app/api/protected/
├── comments/route.ts         # ✅ Sanitized
├── startups/route.ts         # ✅ Sanitized
├── users/route.ts            # ✅ Sanitized
├── roles/route.ts            # ✅ Sanitized
├── analytics/route.ts        # ✅ No injection points
└── audit-logs/route.ts       # ✅ No injection points
```

---

## 6. Usage Guide

### Basic Sanitization

```typescript
import {
  sanitizeHtmlInput,
  sanitizeTextInput,
  validateInput,
  SanitizationLevel,
} from "@/lib/security";

// Sanitize user comment
const cleanComment = sanitizeHtmlInput(userComment, SanitizationLevel.MODERATE);

// Sanitize plain text
const cleanTitle = sanitizeTextInput(userTitle);

// Validate with pattern detection
const validation = validateInput(cleanComment, {
  required: true,
  minLength: 1,
  maxLength: 500,
  checkXSS: true,
  checkSQLi: true,
});

if (!validation.valid) {
  console.error(validation.message); // "Input contains potentially malicious content"
}
```

### Safe Component Usage

```typescript
import { SafeComment, SafeFormInput } from "@/components/SafeUIComponents";

// Render user-generated content safely
<SafeComment
  content={comment.content}
  author={comment.author}
  createdAt={comment.createdAt}
/>

// Form input with validation
<SafeFormInput
  label="Comment"
  value={input}
  onChange={setInput}
  error={error}
  maxLength={500}
  required
  sanitize
/>
```

### API Endpoint Protection

```typescript
// Apply sanitization in route handlers
const sanitized = sanitizeHtmlInput(req.body.content);
const validation = validateInput(sanitized, {
  checkXSS: true,
  checkSQLi: true,
});

if (!validation.valid) {
  return sendError(validation.message, ERROR_CODES.VALIDATION_ERROR, 400);
}

// Store sanitized data
await prisma.comment.create({ data: { content: sanitized } });
```

---

## 7. Testing & Demonstration

### Run Demo Script

```bash
# Compile and run security demonstration
npm run build  # Compiles TypeScript
node .next/server/lib/security/demo.js

# Or directly with ts-node (if available)
npx ts-node lib/security/demo.ts
```

### Demo Output

The demo shows:

1. **6 XSS attack scenarios** with before/after sanitization
2. **5 SQL injection patterns** and validation blocking
3. **Real-world usage examples** (comments, search, newsletter)
4. **Parameterized query protection**
5. **Security summary** of all implemented protections

### Manual Testing

```typescript
// Test XSS detection
const xssPayload = '<script>alert("test")</script>';
console.log(hasXSSPatterns(xssPayload)); // true

// Test SQLi detection
const sqliPayload = "' OR '1'='1' --";
console.log(hasSQLiPatterns(sqliPayload)); // true

// Test sanitization
const result = sanitizeHtmlInput(xssPayload);
console.log(result); // "" (empty, all tags removed)
```

---

## 8. Security Best Practices

### Do's ✅

- ✅ Sanitize all user inputs immediately upon receipt
- ✅ Validate input format and length
- ✅ Use parameterized queries with Prisma
- ✅ Encode output in templates
- ✅ Implement security headers
- ✅ Use safe components for rendering user content
- ✅ Log security events for audit trails
- ✅ Keep dependencies updated
- ✅ Test with known attack payloads
- ✅ Use HTTPS everywhere

### Don'ts ❌

- ❌ Don't trust user input - always sanitize
- ❌ Don't concatenate strings in SQL queries
- ❌ Don't use `dangerouslySetInnerHTML` without sanitization
- ❌ Don't store unsanitized data in database
- ❌ Don't disable CSP headers
- ❌ Don't skip input validation
- ❌ Don't expose sensitive error messages to users
- ❌ Don't log passwords or tokens
- ❌ Don't rely on client-side validation alone
- ❌ Don't ignore security warnings

---

## 9. Configuration Reference

### Sanitization Level Selection

| Level        | Use For                            | Security   | Usability  |
| ------------ | ---------------------------------- | ---------- | ---------- |
| **STRICT**   | Plain text inputs (titles, names)  | ⭐⭐⭐⭐⭐ | ⭐⭐       |
| **MODERATE** | Rich text (comments, descriptions) | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   |
| **MINIMAL**  | Pre-validated content              | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ |

### CSP Policy

Current policy (`lib/security/headers.ts`):

- Restricts scripts to same origin
- Allows safe inline styles
- Prevents frame embedding
- Restricts external resources

For stricter security:

```typescript
// Disable unsafe-inline (requires external script files)
"script-src 'self';";
"style-src 'self' <hash-for-critical-css>;";
```

---

## 10. Future Improvements

### Short-term (Next Sprint)

- [ ] Implement rate limiting with Redis
- [ ] Add CAPTCHA for form submissions
- [ ] Implement two-factor authentication
- [ ] Add request signing for API calls

### Medium-term (Next Quarter)

- [ ] Subresource Integrity (SRI) for external resources
- [ ] Certificate pinning for API calls
- [ ] Web Application Firewall (WAF) integration
- [ ] Advanced threat detection/ML-based anomaly detection

### Long-term (Strategic)

- [ ] Security audit by external firm
- [ ] Penetration testing program
- [ ] Bug bounty program
- [ ] ISO 27001 certification

---

## 11. Security Review Cadence

### Monthly

- Review security headers effectiveness
- Analyze error logs for attack patterns
- Check dependency security advisories

### Quarterly

- Full penetration testing (manual)
- OWASP Top 10 review against implementation
- Security training for development team

### Annually

- External security audit
- Compliance review (GDPR, HIPAA, etc.)
- Architecture security review

---

## 12. Incident Response

### XSS Attack Detected

1. **Immediate**: Block malicious input
2. **Investigation**: Check logs for affected data
3. **Remediation**: Sanitize stored data if compromised
4. **Communication**: Notify users if data exposed
5. **Prevention**: Enhance sanitization rules

### SQL Injection Detected

1. **Immediate**: Block request and log attempt
2. **Investigation**: Review database logs
3. **Remediation**: Update parameterized queries if needed
4. **Communication**: Alert security team
5. **Prevention**: Strengthen input validation

---

## 13. Resources & References

### OWASP Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Injection](https://owasp.org/www-community/attacks/injection)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

### Libraries Used

- [sanitize-html](https://github.com/apostrophecms/sanitize-html) - Server-side HTML sanitization
- [DOMPurify](https://github.com/cure53/DOMPurify) - Client-side HTML sanitization
- [validator](https://github.com/validatorjs/validator.js) - String validation and sanitization
- [Prisma](https://www.prisma.io/) - Type-safe ORM with parameterized queries

### Security Headers

- [MDN Security Headers Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)

---

## 14. Conclusion

The StartupDiscovery application now implements comprehensive input sanitization and OWASP-compliant security practices. All user inputs are validated, sanitized, and encoded before storage and display. The application is protected against common web vulnerabilities including XSS and SQL Injection attacks.

**Security Status**: 🟢 **Production Ready**

For questions or security concerns, contact the security team immediately.

---

**Last Updated**: January 8, 2026  
**Next Review**: April 8, 2026  
**Document Version**: 1.0
