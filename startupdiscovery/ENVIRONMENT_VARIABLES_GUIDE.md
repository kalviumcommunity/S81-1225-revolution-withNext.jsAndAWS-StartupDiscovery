# Environment Variables & Security Management

## Overview

This guide explains how environment variables are managed in the Startup Discovery application, focusing on security best practices, separation of concerns, and preventing accidental exposure of sensitive data.

## Quick Start

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local` (never commit this file)

3. The application will validate required variables on startup

## Environment Files Explained

### `.env.example` (Committed to Repository)

- Contains placeholder values with descriptions
- Shows all available configuration options
- Explains which variables are server-only vs public
- Safe for all team members to view
- Updated when new variables are added

### `.env.local` (Never Committed)

- Contains actual secrets and credentials
- Listed in `.gitignore` to prevent accidental commits
- Only needed locally for development
- Each developer must create their own
- Production environment uses CI/CD secrets

## Variable Categories

### 1. Server-Only Variables (Secrets)

These variables are **never sent to the browser** and should only be used in:

- API routes (`app/api/**/route.ts`)
- Server components (with `"use server"` directive)
- Server-side utility functions
- Build-time scripts

**Do NOT access these in client components or browser console.**

```typescript
// ✅ SAFE: Used in API route
export async function POST(req: Request) {
  const apiKey = process.env.SENDGRID_API_KEY;
  // Use apiKey securely here
}

// ❌ UNSAFE: Do NOT do this in client code
const secret = process.env.JWT_SECRET; // This won't work anyway
```

**Server-Only Variables:**

| Variable                | Purpose                           | Example                                    |
| ----------------------- | --------------------------------- | ------------------------------------------ |
| `DATABASE_URL`          | PostgreSQL connection string      | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`            | Secret key for signing JWT tokens | `super-secret-min-32-chars-required`       |
| `SENDGRID_API_KEY`      | Email service API key             | `SG.xxxxxxxxxxxxxxxxxxxxxxxx`              |
| `AWS_ACCESS_KEY_ID`     | AWS authentication                | `AKIAIOSFODNN7EXAMPLE`                     |
| `AWS_SECRET_ACCESS_KEY` | AWS authentication secret         | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `REDIS_URL`             | Redis cache connection            | `redis://localhost:6379`                   |
| `REDIS_PASSWORD`        | Redis authentication              | `your-redis-password`                      |
| `ENABLE_DETAILED_LOGS`  | Enable verbose logging            | `true` or `false`                          |

### 2. Public Variables (Safe to Expose)

These variables are **safe to access in browsers** because they don't contain secrets.

**Always prefix public variables with `NEXT_PUBLIC_`**

```typescript
// ✅ SAFE: Public variable accessible everywhere
const appName = process.env.NEXT_PUBLIC_APP_NAME;

// In client component:
export default function Header() {
  return <h1>{process.env.NEXT_PUBLIC_APP_NAME}</h1>;
}
```

**Public Variables:**

| Variable                       | Purpose                          | Example                   | Visibility |
| ------------------------------ | -------------------------------- | ------------------------- | ---------- |
| `NEXT_PUBLIC_API_URL`          | API endpoint for client requests | `https://api.example.com` | Browser    |
| `NEXT_PUBLIC_API_TIMEOUT`      | Request timeout in ms            | `30000`                   | Browser    |
| `NEXT_PUBLIC_JWT_EXPIRY`       | Token expiration time            | `7d`                      | Browser    |
| `NEXT_PUBLIC_SENDER_EMAIL`     | From address for emails          | `noreply@example.com`     | Browser    |
| `NEXT_PUBLIC_AWS_S3_BUCKET`    | S3 bucket name                   | `uploads-bucket`          | Browser    |
| `NEXT_PUBLIC_AWS_REGION`       | AWS region                       | `us-east-1`               | Browser    |
| `NEXT_PUBLIC_ENV`              | Environment name                 | `development`             | Browser    |
| `NEXT_PUBLIC_APP_NAME`         | Application name                 | `Startup Discovery`       | Browser    |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Analytics flag                   | `true`                    | Browser    |
| `NEXT_PUBLIC_ENABLE_FEEDBACK`  | Feedback flag                    | `true`                    | Browser    |
| `NEXT_PUBLIC_LOG_LEVEL`        | Logging verbosity                | `debug`                   | Browser    |

## Security Best Practices Implemented

### 1. ✅ Environment File Isolation

```
.gitignore includes ".env*" so .env.local is never committed
```

### 2. ✅ Type-Safe Access

```typescript
// lib/env.ts exports typed access to all variables
import { serverEnv, clientEnv } from "@/lib/env";

// IDE autocomplete and type checking
const dbUrl = serverEnv.DATABASE_URL; // ✅ Type-safe
```

### 3. ✅ Validation on Startup

```typescript
// Validates all required variables are set
// Fails early if configuration is incomplete
validateEnvironment();
```

### 4. ✅ Prefix Convention

- `NEXT_PUBLIC_` = Safe for browser
- No prefix = Server-only (sensitive)

### 5. ✅ Helper Functions

```typescript
// Prevent typos and mistakes
const url = getApiUrl("/users"); // Returns clean URL
const isProd = isProduction(); // Type-safe environment check
```

## Usage Examples

### In API Routes (Server-Only)

```typescript
// app/api/auth/login/route.ts
import { serverEnv } from "@/lib/env";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const data = await req.json();

  // ✅ Safe: Using server-only variable
  const token = jwt.sign(data, serverEnv.JWT_SECRET, {
    expiresIn: process.env.NEXT_PUBLIC_JWT_EXPIRY,
  });

  return Response.json({ token });
}
```

### In Server Components

```typescript
// app/dashboard/page.tsx
import { serverEnv, clientEnv } from "@/lib/env";

export default function Dashboard() {
  // ✅ Safe: Server component can use both
  const isProduction = process.env.NEXT_PUBLIC_ENV === "production";
  const dbLogging = serverEnv.ENABLE_DETAILED_LOGS;

  return (
    <div>
      <h1>{clientEnv.APP_NAME}</h1>
      <p>Environment: {clientEnv.ENV}</p>
    </div>
  );
}
```

### In Client Components

```typescript
// components/ApiClient.tsx
"use client";

import { clientEnv, getApiUrl } from "@/lib/env";

export function useApi() {
  // ✅ Safe: Only public variables
  const apiUrl = getApiUrl("/users");
  const timeout = clientEnv.API_TIMEOUT;

  return async (path: string) => {
    return fetch(getApiUrl(path), {
      timeout, // 30000ms default
    });
  };
}
```

## Preventing Accidental Leaks

### 1. Never Console Log Secrets

```typescript
// ❌ WRONG: Exposes secret in browser console
console.log("JWT Secret:", serverEnv.JWT_SECRET);

// ✅ RIGHT: Only log non-sensitive info
console.log("API URL:", clientEnv.API_URL);
```

### 2. Never Pass Secrets to Components

```typescript
// ❌ WRONG: Secrets get sent to browser
<SecretComponent apiKey={serverEnv.SENDGRID_API_KEY} />

// ✅ RIGHT: Use secrets only in server context
export async function sendEmail(to: string) {
  // Use serverEnv.SENDGRID_API_KEY here only
}
```

### 3. Never Commit .env Files

```bash
# Check .gitignore has .env*
cat .gitignore | grep "env"

# Output should include:
# .env*
```

### 4. Use CI/CD Secrets for Production

```yaml
# Example GitHub Actions
- name: Deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
  run: npm run deploy
```

## Environment Validation

The application validates required variables on startup:

```typescript
import { validateEnvironment } from "@/lib/env";

// In middleware.ts or layout.tsx
validateEnvironment();
```

**Validation Output:**

```
✅ Environment variables validated successfully
```

If validation fails:

```
❌ Environment validation failed:
  - Missing required server environment variable: DATABASE_URL
  - Missing required server environment variable: JWT_SECRET
```

## Adding New Environment Variables

When adding a new variable:

1. **Add to `.env.example`:**

   ```bash
   # Explanation of what this variable does
   NEXT_PUBLIC_NEW_VAR="placeholder-value"
   ```

2. **Update `lib/env.ts`:**

   ```typescript
   export const clientEnv = {
     // ... existing vars
     NEW_VAR: process.env.NEXT_PUBLIC_NEW_VAR || "default-value",
   };
   ```

3. **Update this README** with the new variable's description

4. **Add to team documentation** so other developers know to set it

## Local Development Setup

### First Time Setup

```bash
# 1. Copy example to local
cp .env.example .env.local

# 2. Edit .env.local with your actual values
nano .env.local  # or your editor

# 3. Install dependencies
npm install

# 4. Validation happens automatically on next dev/build
npm run dev
```

### Validation will show:

```bash
✅ Environment variables validated successfully
```

## Production Deployment

For production, configure variables through:

### GitHub Secrets

```bash
# Settings → Secrets and variables → Actions → New repository secret
DATABASE_URL: postgresql://...
JWT_SECRET: your-secret-key
SENDGRID_API_KEY: SG...
AWS_ACCESS_KEY_ID: AKIA...
AWS_SECRET_ACCESS_KEY: ...
REDIS_URL: redis://...
```

### Docker Secrets (if using containers)

```dockerfile
# Pass as build arguments or environment
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
```

### Vercel Deployment

```bash
# Via Vercel Dashboard
# Settings → Environment Variables → Add New
```

## Troubleshooting

### Error: "Missing required server environment variable"

**Cause:** You're missing a variable in `.env.local`

**Fix:**

```bash
# Check what's required in .env.example
cat .env.example

# Copy any missing values to .env.local
nano .env.local
```

### Error: "Cannot find module 'lib/env'"

**Cause:** Import path is wrong or file doesn't exist

**Fix:**

```typescript
// ✅ Correct import
import { serverEnv } from "@/lib/env";

// ❌ Wrong import
import { serverEnv } from "./lib/env";
```

### Variables Not Loading

**Cause:** Restart dev server after changing `.env.local`

**Fix:**

```bash
# Stop the dev server (Ctrl+C)
# Then restart
npm run dev
```

## Security Reflection

### Key Takeaways

1. **Defense in Depth:** Multiple layers protect secrets:
   - `.gitignore` prevents commits
   - `NEXT_PUBLIC_` prefix enforces browser safety
   - `lib/env.ts` provides type-safe access
   - Validation catches missing variables early

2. **Principle of Least Privilege:** Each variable only accessible where needed:
   - Server variables only in API routes and server components
   - Public variables safe for browser access
   - No secrets in client bundles

3. **Developer Experience:** Makes security easy:
   - Obvious naming convention (`NEXT_PUBLIC_`)
   - IDE autocomplete and type checking
   - Early validation catches mistakes
   - Helper functions prevent common errors

### Real-World Impact

This pattern is used by industry leaders:

- **Vercel:** Next.js creator - same `.env.local` approach
- **Stripe:** Uses `NEXT_PUBLIC_` for publishable keys
- **Auth0:** Recommends server-only secrets pattern
- **AWS:** Enforces environment variables for secrets management

### Why This Matters

Without proper environment management:

- 🔓 Secrets leaked to GitHub → account compromises
- 🔓 API keys in frontend → unauthorized API usage
- 🔓 Database URLs exposed → data breaches
- 🔓 Inconsistent configuration → hard-to-debug issues

With proper management:

- ✅ Secrets stay secure
- ✅ Consistent configuration across team
- ✅ Easy onboarding for new developers
- ✅ Production safety
- ✅ Compliance with security standards

## Files Modified

- **`.env.example`** - Template with all configuration options
- **`lib/env.ts`** - Typed environment variable access
- **`README.md`** - Updated with environment setup section
- **`.gitignore`** - Already configured (no changes needed)

## Quick Reference

```typescript
// Import what you need
import {
  serverEnv,
  clientEnv,
  validateEnvironment,
  getApiUrl,
} from "@/lib/env";

// Validate on startup
validateEnvironment();

// Use in server context
const dbUrl = serverEnv.DATABASE_URL;

// Use in client context
const apiUrl = clientEnv.API_URL;

// Use helper functions
const fullUrl = getApiUrl("/users/123");
const isProd = isProduction();
```

That's it! Your application is now secure and well-configured.
