# Centralized Error Handling & Structured Logging

This document outlines the error handling and logging architecture for the Startup Discovery API.

## Overview

The application implements a centralized error handling system with structured logging to provide consistent, secure, and maintainable error management across all API routes.

## Architecture

### Components

1. **Logger Utility** (`lib/logger.ts`) - Structured logging with JSON format
2. **Error Handler** (`lib/errorHandler.ts`) - Centralized error management
3. **Integration Points** - Applied to all API routes for consistent behavior

## Logger Utility

### Purpose

Provides structured logging in JSON format for easier monitoring, debugging, and integration with external logging services.

### Implementation

```typescript
// lib/logger.ts

export interface LogEntry {
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export function logInfo(message: string, meta?: Record<string, unknown>): void;
export function logWarn(message: string, meta?: Record<string, unknown>): void;
export function logError(message: string, meta?: Record<string, unknown>): void;
export function logDebug(message: string, meta?: Record<string, unknown>): void;

export class Logger {
  constructor(context: string);
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}
```

### Usage Examples

**Simple Function Usage:**

```typescript
import { logInfo, logError } from "@/lib/logger";

logInfo("User created successfully", {
  userId: 123,
  email: "user@example.com",
});
logError("Database connection failed", { code: "ECONNREFUSED" });
```

**Logger Class Usage:**

```typescript
import { Logger } from "@/lib/logger";

const logger = new Logger("UsersAPI");

logger.info("Fetching users", { page: 1, limit: 10 });
logger.error("Failed to fetch users", { error: "Connection timeout" });
```

### Log Output Format

Each log entry is output as a single-line JSON object:

```json
{
  "level": "info",
  "message": "User created successfully",
  "meta": {
    "userId": 123,
    "email": "user@example.com"
  },
  "timestamp": "2025-10-29T12:45:00.123Z"
}
```

## Error Handler

### Purpose

Provides centralized error handling that:

- Logs all errors in structured format
- Shows detailed errors in development
- Hides sensitive information in production
- Generates unique request IDs for tracking
- Supports context-aware error responses

### Implementation

```typescript
// lib/errorHandler.ts

export interface ErrorContext {
  method?: string;
  path?: string;
  statusCode?: number;
  userId?: number;
  [key: string]: unknown;
}

export function handleError(
  error: unknown,
  context: ErrorContext = {}
): NextResponse<ErrorResponse>;

export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
): (req: Request, context?: any) => Promise<NextResponse>;
```

### Key Features

#### 1. Development Environment

- Shows actual error messages and stack traces
- Helps developers quickly identify and fix issues
- Includes full context in logs

```json
{
  "success": false,
  "message": "Database connection failed!",
  "stack": "Error: Database connection failed!\n    at connectDB (lib/db.ts:42:15)\n    at ...",
  "requestId": "req_1640796300000_a1b2c3d4e"
}
```

#### 2. Production Environment

- Shows generic, user-friendly error message
- Hides stack traces and implementation details
- Prevents information leakage

```json
{
  "success": false,
  "message": "Something went wrong. Please try again later.",
  "requestId": "req_1640796300000_a1b2c3d4e"
}
```

#### 3. Sensitive Data Redaction

Automatically detects and redacts sensitive patterns:

- Passwords
- API keys and tokens
- Database URLs
- Connection strings

```typescript
// Before redaction
"Database connection failed: postgresql://admin:secretpass@localhost:5432/db";

// After redaction
"Database connection failed: database_url: [REDACTED]";
```

#### 4. Structured Error Logging

```json
{
  "level": "error",
  "message": "Error in GET /api/users",
  "meta": {
    "message": "Database connection failed",
    "stack": "REDACTED",
    "requestId": "req_1640796300000_a1b2c3d4e",
    "context": {
      "method": "GET",
      "path": "/api/users"
    }
  },
  "timestamp": "2025-10-29T12:45:00.123Z"
}
```

### Usage

**Direct Usage:**

```typescript
import { handleError } from "@/lib/errorHandler";

export async function GET(req: Request) {
  try {
    const users = await fetchUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return handleError(error, {
      method: "GET",
      path: "/api/users",
      statusCode: 500,
    });
  }
}
```

**With Error Wrapper:**

```typescript
import { withErrorHandler } from "@/lib/errorHandler";

const handler = async (req: Request) => {
  const users = await fetchUsers();
  return NextResponse.json({ users });
};

export const GET = withErrorHandler(handler);
```

## Integration in Routes

### Example: Users API (`app/api/users/route.ts`)

```typescript
import { handleError } from "@/lib/errorHandler";
import { Logger } from "@/lib/logger";

const logger = new Logger("UsersAPI");

export async function GET(req: Request) {
  try {
    // Fetch users logic
    const users = await prisma.user.findMany();
    return sendSuccess({ users }, "Users fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch users", { error: String(error) });
    return handleError(error, {
      method: "GET",
      path: "/api/users",
      statusCode: 500,
    });
  }
}

export async function POST(req: Request) {
  try {
    // Create user logic
    const newUser = await prisma.user.create({ data: body });
    return sendSuccess({ user: newUser }, "User created successfully", 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(error);
    }
    logger.error("Failed to create user", { error: String(error) });
    return handleError(error, {
      method: "POST",
      path: "/api/users",
      statusCode: 400,
    });
  }
}
```

## Testing

### Development Environment

**Start server in development mode:**

```bash
npm run dev
```

**Test with error simulation:**

```bash
# This will return detailed error info
curl http://localhost:3000/api/users -H "Authorization: Bearer invalid_token"
```

**Expected Response (Development):**

```json
{
  "success": false,
  "message": "jwt malformed",
  "stack": "Error: jwt malformed\n    at module.exports [as verify] ...",
  "requestId": "req_1640796300000_a1b2c3d4e"
}
```

**Console Log (Development):**

```json
{
  "level": "error",
  "message": "Error in GET /api/users",
  "meta": {
    "message": "jwt malformed",
    "stack": "Error: jwt malformed\n    at module.exports [as verify] ...",
    "requestId": "req_1640796300000_a1b2c3d4e",
    "context": {
      "method": "GET",
      "path": "/api/users"
    }
  },
  "timestamp": "2025-10-29T12:45:00.123Z"
}
```

### Production Environment

**Start server in production mode:**

```bash
NODE_ENV=production npm run dev
```

**Test with same error:**

```bash
curl http://localhost:3000/api/users -H "Authorization: Bearer invalid_token"
```

**Expected Response (Production):**

```json
{
  "success": false,
  "message": "Something went wrong. Please try again later.",
  "requestId": "req_1640796300000_a1b2c3d4e"
}
```

**Console Log (Production):**

```json
{
  "level": "error",
  "message": "Error in GET /api/users",
  "meta": {
    "message": "jwt malformed",
    "stack": "REDACTED",
    "requestId": "req_1640796300000_a1b2c3d4e",
    "context": {
      "method": "GET",
      "path": "/api/users"
    }
  },
  "timestamp": "2025-10-29T12:45:00.123Z"
}
```

## Why This Matters

### 1. Centralized Error Handling

**Benefits:**

- Consistent error responses across all routes
- Single point of control for error formatting
- Easier to maintain and update error handling logic
- Reduces code duplication

**Impact:**

- Frontend developers know exactly what error format to expect
- New developers can follow the established pattern
- Changes to error handling only need to be made once

### 2. Structured Logging

**Benefits:**

- Machine-readable format for automated analysis
- Easy to parse and aggregate logs
- Better integration with logging services (CloudWatch, Splunk, ELK)
- Structured context helps faster debugging

**Real-world Example:**

```typescript
// With structured logging, you can query all errors for a specific user:
logger.error("Payment processing failed", {
  userId: 123,
  amount: 99.99,
  paymentMethod: "credit_card",
  errorCode: "CARD_DECLINED",
});

// Then grep/query: `| grep userId: 123`
```

### 3. Security in Production

**Benefits:**

- Prevents information leakage to end users
- Protects internal system architecture details
- Reduces attack surface by hiding implementation details
- Generic messages don't reveal what went wrong

**Security Scenarios:**

**Vulnerable (Without Error Handling):**

```json
{
  "error": "FOREIGN KEY constraint failed on users.account_id (accounts.id)"
}
```

Attacker learns about database schema and relationships.

**Secure (With Error Handling):**

```json
{
  "message": "Something went wrong. Please try again later."
}
```

Attacker learns nothing about system internals.

### 4. Developer Experience

**Development Benefits:**

- Full error context available for debugging
- Stack traces point to exact failure location
- Structured logs help identify patterns
- Request IDs enable request tracing

**Example Debugging Workflow:**

```
User reports: "I got an error when creating a user"
↓
Frontend team provides requestId: "req_1640796300000_a1b2c3d4e"
↓
Backend logs: `grep "req_1640796300000_a1b2c3d4e" logs.txt`
↓
Full error context appears with stack trace
↓
Issue identified and fixed in minutes
```

## Scalability

### Current Implementation

Uses console.log/console.error with JSON formatting for simple, zero-dependency logging.

### Future Enhancements

#### 1. AWS CloudWatch Integration

```typescript
import { CloudWatchLogs } from "aws-sdk";

const logger = new CloudWatchLogs({
  region: "us-east-1",
  logGroupName: "/aws/lambda/startup-discovery",
});

export async function logError(
  message: string,
  meta?: Record<string, unknown>
) {
  const entry: LogEntry = {
    /* ... */
  };
  await logger.putLogEvents({
    logGroupName: "startup-discovery",
    logStreamName: "errors",
    logEvents: [{ message: JSON.stringify(entry), timestamp: Date.now() }],
  });
}
```

#### 2. Pino Logger Integration

```typescript
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export function logError(message: string, meta?: Record<string, unknown>) {
  logger.error({ ...meta, msg: message });
}
```

#### 3. Sentry Integration

```typescript
import * as Sentry from "@sentry/nextjs";

export function handleError(error: unknown, context: ErrorContext) {
  Sentry.captureException(error, {
    contexts: { context },
  });
  // ... rest of error handling
}
```

#### 4. ELK Stack Integration

```typescript
import elasticsearch from "@elastic/elasticsearch";

const client = new elasticsearch.Client({
  node: "https://elasticsearch:9200",
});

export async function logError(
  message: string,
  meta?: Record<string, unknown>
) {
  await client.index({
    index: "logs",
    document: { level: "error", message, meta, timestamp: new Date() },
  });
}
```

### Scaling Considerations

**Volume:**

- With proper batching, can handle 1000+ log entries/second
- CloudWatch can store and query unlimited logs

**Retention:**

- Configure CloudWatch retention policies (7 days, 30 days, or indefinite)
- Archive old logs to S3 for cost efficiency

**Cost:**

- AWS CloudWatch Logs: ~$0.50 per GB ingested
- For 1GB/day: ~$15/month
- Sentry: Free tier includes 5,000 events/month

**Monitoring:**

- Set CloudWatch alarms for error rate thresholds
- Alert when error rate exceeds 1% of total requests
- Dashboard to visualize error trends over time

## Best Practices

1. **Always include context** when calling `handleError()`

   ```typescript
   handleError(error, { method: req.method, path: req.url });
   ```

2. **Use Logger class for contextual logging**

   ```typescript
   const logger = new Logger("UsersAPI");
   logger.error("message"); // Outputs: "[UsersAPI] message"
   ```

3. **Log sensitive operations** for audit trails

   ```typescript
   logger.info("User authentication", { userId, method: "password" });
   ```

4. **Don't log passwords or tokens** even in development

   ```typescript
   // Bad ❌
   logger.info("Login attempt", { username, password });

   // Good ✅
   logger.info("Login attempt", { username });
   ```

5. **Use consistent error codes** for programmatic error handling
   ```typescript
   if (error.code === "UNAUTHORIZED") {
     // Handle authorization error
   }
   ```

## Files Modified

- `lib/logger.ts` - Created new logger utility
- `lib/errorHandler.ts` - Created new error handler
- `app/api/users/route.ts` - Integrated error handling and logging

## Migration Checklist

To apply this pattern to other routes:

- [ ] Import `handleError` and `Logger`
- [ ] Create logger instance: `const logger = new Logger("RouteContext")`
- [ ] Update catch blocks to use `handleError(error, context)`
- [ ] Add logger calls for important operations
- [ ] Test in development and production modes
- [ ] Verify structured logs are being generated
- [ ] Update documentation for the route

## Conclusion

This centralized error handling and structured logging system provides:

- **Consistency** - All errors handled uniformly
- **Security** - Production errors are user-safe
- **Debuggability** - Full context in development
- **Scalability** - Easy to integrate with external services
- **Maintainability** - Single point of control
