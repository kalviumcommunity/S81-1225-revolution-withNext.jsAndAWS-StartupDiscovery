# Startup Discovery - Next.js Application

A comprehensive Next.js 16 application with enterprise-grade security, cloud integration, and production-ready features.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Object Storage](#object-storage)
- [Secrets Management](#secrets-management)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

Startup Discovery is a production-ready Next.js application featuring:

- **Enterprise-Grade Security**: RBAC, HTTPS enforcement, secure headers, input sanitization
- **Cloud Database**: AWS RDS and Azure PostgreSQL support with connection pooling
- **Object Storage**: AWS S3 and Azure Blob Storage integration with presigned URLs
- **Secrets Management**: AWS Secrets Manager and Azure Key Vault integration
- **Type-Safe**: Full TypeScript with comprehensive type checking
- **Scalable**: Designed for cloud deployment with proper configuration management

## Key Features

### ✅ Security

- Role-Based Access Control (RBAC)
- HTTPS enforcement with HSTS headers
- OWASP security headers and recommendations
- Input sanitization and validation
- JWT authentication support
- Secure credential management

### ✅ Cloud Integration

- **Database**: RDS PostgreSQL or Azure PostgreSQL with Prisma ORM
- **Object Storage**: S3 or Azure Blob Storage with file validation
- **Secrets**: AWS Secrets Manager or Azure Key Vault
- Multi-cloud provider abstraction layer

### ✅ Developer Experience

- Type-safe configuration management
- Comprehensive error handling
- Debug API endpoints for diagnostics
- Extensive documentation
- Test suites for validation

## Architecture

```
┌─────────────────────────────────────────┐
│       Next.js Application (16)          │
│  - Server Components                    │
│  - API Routes                           │
│  - React Components                     │
└──────────┬──────────────────────────────┘
           │
    ┌──────┴──────────────────────────────┐
    │                                     │
    ▼                                     ▼
┌─────────────────┐            ┌──────────────────────┐
│  Authentication │            │  Data & Storage      │
│  - JWT          │            │  - Database (Cloud)  │
│  - RBAC         │            │  - Object Storage    │
│  - CORS         │            │  - Secrets Manager   │
└─────────────────┘            └──────────────────────┘
    │                                     │
    └──────────┬──────────────────────────┘
               │
    ┌──────────┴──────────────┐
    │                         │
    ▼                         ▼
┌─────────────┐        ┌──────────────┐
│ AWS         │        │ Azure        │
│ - RDS       │        │ - PostgreSQL │
│ - S3        │        │ - Blob       │
│ - Secrets   │        │ - Key Vault  │
└─────────────┘        └──────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- AWS account (for S3, RDS, Secrets Manager) OR Azure account (for Blob, PostgreSQL, Key Vault)
- PostgreSQL database (cloud or local)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd startupdiscovery

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Setup database
npx prisma migrate deploy
npx prisma generate

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
startupdiscovery/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── storage/              # Object storage endpoints
│   │   ├── secrets/              # Secrets management endpoints
│   │   └── database/             # Database validation endpoints
│   ├── layout.tsx                # Root layout with initialization
│   └── page.tsx                  # Home page
│
├── lib/                          # Shared utilities
│   ├── auth/                     # Authentication utilities
│   ├── storage/                  # Storage client and validation
│   ├── secrets/                  # Secrets management
│   ├── db/                       # Database utilities
│   └── utils/                    # Helper functions
│
├── components/                   # React components
│   ├── StorageUploadComponent    # File upload UI
│   └── AuthComponents            # Authentication UI
│
├── prisma/                       # Database schema
│   ├── schema.prisma             # Prisma schema
│   └── migrations/               # Database migrations
│
├── scripts/                      # Utility scripts
│   ├── test-storage.ts           # Storage testing
│   └── test-secrets.ts           # Secrets testing
│
├── docs/                         # Documentation
│   ├── ENVIRONMENT_SETUP_CLOUD.md
│   ├── OBJECT_STORAGE_SETUP.md
│   ├── STORAGE_QUICK_REFERENCE.md
│   └── SECRETS_QUICK_REFERENCE.md
│
└── .env.example                  # Environment template
```

## Configuration

### Environment Variables

Key variables to configure (see `.env.example` for complete list):

```env
# Provider Selection
SECRETS_PROVIDER=aws              # or 'azure'
STORAGE_PROVIDER=aws              # or 'azure'

# AWS Configuration
AWS_REGION=us-east-1
AWS_SECRET_ID=prod/app-secrets
AWS_S3_BUCKET_NAME=my-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Azure Configuration
AZURE_KEYVAULT_NAME=myKeyVault
AZURE_SECRET_NAME=app-secrets
AZURE_STORAGE_ACCOUNT_NAME=mystorageaccount
AZURE_BLOB_CONTAINER_NAME=uploads

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
JWT_SECRET=your-secret-key
```

## Database Setup

### AWS RDS

```bash
# Create RDS instance via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier nextjs-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --allocated-storage 20

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://admin:password@nextjs-db.xxx.us-east-1.rds.amazonaws.com:5432/postgres"

# Run migrations
npx prisma migrate deploy
```

### Azure PostgreSQL

```bash
# Create via Azure Portal or CLI
az postgres server create \
  --resource-group myResourceGroup \
  --name mypostgresqlserver \
  --location eastus

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://admin@server:password@mypostgresqlserver.postgres.database.azure.com:5432/postgres"

# Run migrations
npx prisma migrate deploy
```

## Object Storage

### AWS S3

```bash
# Create S3 bucket
aws s3 mb s3://my-bucket --region us-east-1

# Configure CORS (for direct uploads)
aws s3api put-bucket-cors \
  --bucket my-bucket \
  --cors-configuration '{...}'

# Set environment variables
AWS_S3_BUCKET_NAME=my-bucket
STORAGE_PROVIDER=aws
```

See [OBJECT_STORAGE_SETUP.md](OBJECT_STORAGE_SETUP.md) for complete guide.

### Azure Blob Storage

```bash
# Create storage account
az storage account create \
  --name mystorageaccount \
  --resource-group myResourceGroup

# Create container
az storage container create \
  --account-name mystorageaccount \
  --name uploads

# Set environment variables
AZURE_STORAGE_ACCOUNT_NAME=mystorageaccount
AZURE_BLOB_CONTAINER_NAME=uploads
STORAGE_PROVIDER=azure
```

## Secrets Management

### AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name prod/app-secrets \
  --secret-string '{
    "DATABASE_URL": "...",
    "JWT_SECRET": "...",
    "API_KEY": "..."
  }'

# Set environment variables
SECRETS_PROVIDER=aws
AWS_SECRET_ID=prod/app-secrets
```

### Azure Key Vault

```bash
# Create vault
az keyvault create \
  --name myKeyVault \
  --resource-group myResourceGroup

# Create secret
az keyvault secret set \
  --vault-name myKeyVault \
  --name app-secrets \
  --value '{...}'

# Set environment variables
SECRETS_PROVIDER=azure
AZURE_KEYVAULT_NAME=myKeyVault
```

See [ENVIRONMENT_SETUP_CLOUD.md](ENVIRONMENT_SETUP_CLOUD.md) for complete guide.

## Security

### RBAC Implementation

All API endpoints check user roles:

```typescript
// Protected endpoint
export async function POST(req: NextRequest) {
  const user = await verifyJWT(req);

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // ... proceed with admin operation
}
```

### HTTPS Enforcement

Development: HTTP allowed  
Production: HTTPS enforced with HSTS headers

```typescript
// middleware.ts
if (
  process.env.NODE_ENV === "production" &&
  !req.nextUrl.protocol.includes("https")
) {
  return NextResponse.redirect(
    `https://${req.headers.get("host")}${req.nextUrl.pathname}`,
    { status: 308 }
  );
}
```

### Input Validation

All user inputs are validated and sanitized:

```typescript
import { sanitizeInput, validateEmail } from "@/lib/utils/sanitization";

const email = sanitizeInput(userInput);
if (!validateEmail(email)) {
  return NextResponse.json({ error: "Invalid email" }, { status: 400 });
}
```

## API Documentation

### Storage Endpoints

- **GET** `/api/storage/upload-url` - Get presigned URL for upload
- **GET** `/api/storage/retrieve` - Get file metadata
- **GET** `/api/storage/download` - Get download link
- **DELETE** `/api/storage/delete` - Delete file
- **GET** `/api/storage/status` - Check storage status

### Secrets Endpoints

- **GET** `/api/secrets/verify` - Verify secrets are accessible
- **GET** `/api/secrets/metadata` - Get rotation metadata

### Database Endpoints

- **GET** `/api/database/test` - Test database connection
- **GET** `/api/database/tables` - List tables
- **GET** `/api/database/health` - Health check

See endpoint documentation files for detailed specifications.

## Development

### Running Tests

```bash
# Test storage integration
npx ts-node scripts/test-storage.ts

# Test secrets management
npx ts-node scripts/test-secrets.ts

# Run all tests
npm run test
```

### Code Quality

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Run linting
npm run lint

# Type checking
npm run type-check

# Build
npm run build
```

### Hot Reload

The development server automatically reloads on file changes:

```bash
npm run dev
```

## Deployment

### Production Checklist

- [ ] Set all required environment variables
- [ ] Configure cloud provider credentials (IAM/RBAC)
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Run security headers check: `npm run type-check`
- [ ] Test secrets access: `npx ts-node scripts/test-secrets.ts`
- [ ] Test storage access: `npx ts-node scripts/test-storage.ts`
- [ ] Build application: `npm run build`
- [ ] Verify no vulnerabilities: `npm audit`

### Vercel Deployment

```bash
# Push to main branch
git push origin main

# Vercel auto-deploys on push
# Verify in Vercel dashboard
```

### AWS ECS Deployment

```bash
# Create ECR repository
aws ecr create-repository --repository-name my-app

# Build and push Docker image
docker build -t my-app .
docker tag my-app:latest $AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/my-app:latest
docker push $AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/my-app:latest

# Deploy to ECS (using task definition with environment variables)
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Azure SDK for JavaScript](https://docs.microsoft.com/en-us/javascript/api/overview/azure/)

## Support

For issues and questions:

1. Check the relevant documentation file
2. Review error logs and test suite output
3. Use diagnostic endpoints (`/api/secrets/verify`, `/api/storage/status`)
4. Check GitHub issues or create a new issue

## License

MIT
