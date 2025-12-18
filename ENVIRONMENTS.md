# Multi-Environment Setup for StartupDiscovery

## Overview

This document explains the multi-environment configuration for the StartupDiscovery Next.js application. The setup ensures secure secrets management, environment isolation, and reliable CI/CD deployments across development, staging, and production environments.

---

## 📋 Environment Comparison

| Aspect | Development | Staging | Production |
|--------|-------------|---------|-----------|
| **NODE_ENV** | `development` | `staging` | `production` |
| **API URL** | `http://localhost:3000/api` | `https://staging-api.example.com/api` | `https://api.startupdiscovery.com/api` |
| **Database** | Local PostgreSQL | Staging RDS/Cloud DB | Production RDS/Cloud DB |
| **Analytics** | Disabled | Enabled | Enabled |
| **Debug Mode** | Enabled | Disabled | Disabled |
| **Log Level** | `debug` | `info` | `warn` |
| **OAuth Apps** | Development apps | Staging apps | Production apps |
| **Deployment** | Manual (`npm run dev`) | Auto (GitHub Actions) | Auto (GitHub Actions) |

---

## 🔧 Configuration Files Structure

### `.env.example`
**Purpose**: Template file committed to version control showing all available variables
- ✓ Safe to commit (contains no secrets)
- ✓ Helps developers understand required configuration
- ✓ Used as documentation reference

### `.env.development`
**Purpose**: Local development environment
- For **local development only**
- Contains placeholder values for OAuth and DB
- **Git-ignored** to prevent accidental secret commits

### `.env.staging`
**Purpose**: Pre-production testing environment
- Mirrors production configuration
- Uses GitHub Secrets for actual values during CI/CD
- Environment variables injected at build time

### `.env.production`
**Purpose**: Production environment
- Strict security configuration
- All secrets injected via GitHub Secrets
- Minimal logging for performance
- **Never commit actual values**

---

## 🔐 Secure Secrets Management

### How Secrets Are Protected

```
┌─────────────────────────────────────────────────────┐
│ GitHub Secrets (Never exposed in logs/code)         │
├─────────────────────────────────────────────────────┤
│ Only accessible to CI/CD workflows                  │
│ Never committed to repository                       │
│ Only injected as environment variables at build     │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Next.js Build Process (Server-side)                 │
├─────────────────────────────────────────────────────┤
│ Secrets used only during build                      │
│ Database connections established server-side        │
│ OAuth credentials used in API routes                │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Next.js Runtime (Application)                       │
├─────────────────────────────────────────────────────┤
│ No secrets in client-side code                      │
│ API routes handle sensitive operations              │
│ Client never has direct DB or OAuth access          │
└─────────────────────────────────────────────────────┘
```

### GitHub Secrets Configuration

To set up GitHub Secrets for staging and production:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

#### Staging Secrets
```
STAGING_API_BASE_URL              = https://staging-api.example.com/api
STAGING_APP_URL                   = https://staging.example.com
DATABASE_URL_STAGING              = postgresql://user:pass@staging-db:5432/startupdiscovery
GITHUB_CLIENT_ID_STAGING          = xxx...
GITHUB_CLIENT_SECRET_STAGING      = yyy...
GOOGLE_CLIENT_ID_STAGING          = aaa...
GOOGLE_CLIENT_SECRET_STAGING      = bbb...
```

#### Production Secrets
```
PRODUCTION_API_BASE_URL           = https://api.startupdiscovery.com/api
PRODUCTION_APP_URL                = https://startupdiscovery.com
DATABASE_URL_PRODUCTION           = postgresql://user:pass@prod-db:5432/startupdiscovery
GITHUB_CLIENT_ID_PRODUCTION       = xxx...
GITHUB_CLIENT_SECRET_PRODUCTION   = yyy...
GOOGLE_CLIENT_ID_PRODUCTION       = aaa...
GOOGLE_CLIENT_SECRET_PRODUCTION   = bbb...
```

### Environment-Specific Builds (with Secrets)

**Local Development** (no secrets needed):
```bash
npm run dev
# Uses .env.development file
```

**Staging Build** (GitHub Actions):
```bash
npm run build:staging
# NODE_ENV=staging next build
# Secrets injected from GitHub Secrets
```

**Production Build** (GitHub Actions):
```bash
npm run build:production
# NODE_ENV=production next build
# Secrets injected from GitHub Secrets
```

### Why Secrets Are Never Exposed

✓ **GitHub Secrets are encrypted** - Only decrypted in secure CI/CD runners
✓ **Not visible in logs** - GitHub Actions automatically masks secrets
✓ **Not committed to code** - .env files are .gitignored
✓ **Server-side only** - Secrets only used during build, never sent to client
✓ **Type checking** - `lib/config.js` validates required secrets are present

### Example: Proof No Secrets in Build Output

The GitHub Actions workflow includes this security check:

```yaml
- name: Verify no secrets in build output
  run: |
    if grep -r "client_secret" .next/; then
      echo "ERROR: Potential secrets found!"
      exit 1
    fi
    if grep -r "password" .next/ | grep -v node_modules; then
      echo "ERROR: Potential secrets found!"
      exit 1
    fi
    echo "✓ No secrets detected in build output"
```

This prevents accidental exposure of sensitive data in build artifacts.

---

## 🚀 CI/CD Pipeline Overview

### Staging Branch (staging.yml)

**Trigger**: Push to `staging` branch or pull request to `staging`

```
Push/PR to staging
       ↓
├─ Checkout code
├─ Setup Node.js
├─ Install dependencies
├─ Build with secrets (npm run build:staging)
├─ Run linter
├─ Security scan (verify no secrets)
├─ Upload artifacts
└─ Deploy (if push to staging branch)
```

**Environment Secrets Used**:
- DATABASE_URL_STAGING
- GITHUB_CLIENT_SECRET_STAGING
- GOOGLE_CLIENT_SECRET_STAGING

### Production Branch (production.yml)

**Trigger**: Push to `main` branch or pull request to `main`

```
Push/PR to main
       ↓
├─ Checkout code
├─ Setup Node.js
├─ Install dependencies
├─ Build with secrets (npm run build:production)
├─ Run linter
├─ Security scan (strict checks)
├─ Upload artifacts (30-day retention)
├─ Create deployment summary
└─ Deploy (if push to main branch)
```

**Environment Secrets Used**:
- DATABASE_URL_PRODUCTION
- GITHUB_CLIENT_SECRET_PRODUCTION
- GOOGLE_CLIENT_SECRET_PRODUCTION

---

## 🛡️ Environment Isolation Benefits

### 1. **Prevents Accidental Data Loss**
- Staging database is separate from production
- Can safely test destructive operations
- No risk to production user data

### 2. **Enables Safe Testing**
- Test new features on staging first
- Verify integrations before production
- Catch bugs before user impact

### 3. **Secure Credentials Separation**
- Each environment uses different OAuth credentials
- Database credentials are environment-specific
- Compromised staging secrets don't affect production

### 4. **Reliable CI/CD Builds**
- Consistent build process across environments
- Secrets never exposed in logs or artifacts
- Automated security checks on every build

### 5. **Improves Debugging**
- Development has debug logs enabled
- Staging has info-level logging
- Production has minimal logging (performance)
- Can reproduce staging issues locally

---

## 📦 Configuration Utility (lib/config.js)

### Features

✓ **Type-safe environment loading** - All variables are properly typed
✓ **Runtime validation** - Ensures required secrets exist before app starts
✓ **Server-side only** - Never sends secrets to client
✓ **Safe logging** - Logs configuration without exposing secrets

### Usage in API Routes

```javascript
// app/api/auth/route.js
import { getEnvironmentConfig } from '@/lib/config';

export async function POST(request) {
  const config = getEnvironmentConfig();
  
  // Use server-side secrets safely
  const dbConnection = await connectDB(config.databaseUrl);
  const githubToken = config.github.clientSecret;
  
  // Never send secrets to client!
  return Response.json({ success: true });
}
```

### Usage in Middleware

```javascript
// middleware.js
import { getEnvironmentConfig } from '@/lib/config';

export function middleware(request) {
  const config = getEnvironmentConfig();
  
  // Debug info (development only)
  if (config.isDevelopment) {
    console.log(`Running in ${config.nodeEnv} mode`);
  }
  
  // Implement security headers, etc.
}
```

---

## 📝 Git Best Practices

### What IS Committed ✓
```
.env.example              ← Template, safe to commit
.github/workflows/        ← CI/CD configuration
lib/config.js             ← Configuration utility
ENVIRONMENTS.md           ← This documentation
package.json              ← Updated with build scripts
```

### What is NOT Committed ✗
```
.env                      ← Local development
.env.local                ← Local overrides
.env.staging              ← (Staging secrets elsewhere)
.env.production           ← (Production secrets elsewhere)
.next/                    ← Build output
node_modules/             ← Dependencies
```

### Verifying No Secrets Were Committed

Run this command to check for common secret patterns:

```bash
# Check for API keys
git log -p --all -S "sk-" -- | head -20

# Check for database URLs
git log -p --all -S "postgresql://" -- | head -20

# Check for OAuth secrets
git log -p --all -S "client_secret" -- | head -20
```

If nothing is found, your secrets are safe! ✓

---

## 🔄 Workflow Examples

### 1. Local Development Workflow

```bash
# Clone repository
git clone https://github.com/kalviumcommunity/S81-1225-revolution-withNext.jsAndAWS-StartupDiscovery.git
cd startupdiscovery

# Copy environment template
cp .env.example .env.development

# Edit with local values (use test OAuth apps)
nano .env.development

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### 2. Feature Development & Staging Deployment

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: implement new feature"

# Push to staging for testing
git push origin feature/new-feature
git push origin staging

# GitHub Actions automatically:
# ✓ Builds with staging secrets
# ✓ Runs linter
# ✓ Security checks
# ✓ Deploys to staging

# Test on staging environment
# https://staging.example.com

# After testing, merge to main
git checkout main
git pull
git merge feature/new-feature
git push origin main

# GitHub Actions automatically:
# ✓ Builds with production secrets
# ✓ Runs linter
# ✓ Security checks
# ✓ Deploys to production
```

### 3. Emergency Hotfix to Production

```bash
# Create hotfix branch from main
git checkout -b hotfix/critical-bug
git checkout main

# Make urgent fix
# ... implement fix ...
git commit -m "fix: resolve critical bug"

# Deploy directly to production
git push origin main

# GitHub Actions automatically handles deployment
# with production secrets and security checks
```

---

## ⚠️ Security Checklist

Before going to production, verify:

- [ ] All secrets are stored in GitHub Secrets (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] `.env.example` contains NO real credentials
- [ ] Database URLs use strong passwords
- [ ] OAuth apps are registered for each environment
- [ ] SSL/TLS is enabled for production URLs
- [ ] Log level is appropriate for each environment
- [ ] Secrets are never logged in any environment
- [ ] Build artifacts contain no sensitive data
- [ ] All team members know to NEVER commit secrets

---

## 🐛 Troubleshooting

### Build fails with "Missing required environment secrets"

**Cause**: Required secret not set in GitHub Secrets
**Solution**: 
1. Check GitHub Secrets configuration
2. Ensure secret names match exactly
3. Verify the environment in the workflow matches the secrets

### Environment variables not loading in development

**Cause**: Using wrong `.env` file
**Solution**:
```bash
# Verify which file is being used
ls -la .env*

# Ensure you're using .env.development for local dev
npm run dev  # Automatically uses .env.development
```

### Staging build different from production

**Cause**: Different environment variables
**Solution**:
1. Compare `.env.staging` with `.env.production`
2. Check GitHub Secrets for differences
3. Use `lib/config.js` to verify loaded config

### Can't find DATABASE_URL error

**Cause**: Running production build locally without secrets
**Solution**:
```bash
# For production build locally, use staging secrets:
NODE_ENV=production DATABASE_URL=... npm run build

# Or just use development:
npm run dev
```

---

## 📚 Related Files

- `.env.example` - Environment variables template
- `.env.development` - Development configuration
- `.env.staging` - Staging configuration template
- `.env.production` - Production configuration template
- `lib/config.js` - Configuration loading utility
- `.github/workflows/staging.yml` - Staging CI/CD pipeline
- `.github/workflows/production.yml` - Production CI/CD pipeline
- `.gitignore` - Git ignore rules

---

## 🎯 Key Takeaways

1. **Secrets are Never in Code** - Always use GitHub Secrets for sensitive data
2. **Environment Isolation Works** - Each environment has its own database and credentials
3. **Automated Security Checks** - Every build verifies no secrets are exposed
4. **Type-Safe Config** - `lib/config.js` ensures all required secrets exist
5. **CI/CD Handles Deployment** - GitHub Actions automatically builds with correct environment
6. **Minimal Logging in Production** - Better performance and less sensitive data exposure
7. **Easy Local Development** - Use `.env.development` with test credentials

---

**Last Updated**: December 17, 2025
**Next.js Version**: 16.0.10
**Node.js Recommended**: 20 or higher
