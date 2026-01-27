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
- [Docker Containerization](#docker-containerization)
- [Cloud Deployment](#cloud-deployment)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)

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
- **Container Registry**: AWS ECR or Azure ACR
- **Orchestration**: AWS ECS (Fargate) or Azure App Service for Containers
- Multi-cloud provider abstraction layer

### ✅ Containerization

- Multi-stage Docker build for optimal image size
- Docker Compose for local development
- Health checks and monitoring
- Non-root user execution for security
- Automated CI/CD pipelines
- Container orchestration ready

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

## Docker Containerization

### Quick Start

```bash
# Build Docker image
docker build -t startupdiscovery:latest .

# Run container locally
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e JWT_SECRET="your-secret" \
  startupdiscovery:latest

# Or use Docker Compose
docker-compose up -d
```

### Multi-Stage Dockerfile

Our Dockerfile uses a multi-stage build for:

- **Smaller image size**: ~150MB (Alpine Linux base)
- **Security**: Non-root user execution
- **Health checks**: Built-in container monitoring
- **Production optimization**: Separate build and runtime stages

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy built application and dependencies
COPY --from=builder /app/.next/standalone ./
EXPOSE 3000
CMD ["node", "server.js"]
```

### Health Checks

Container includes built-in health monitoring:

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Response
{
  "status": "healthy",
  "uptime": 123.45,
  "environment": "production"
}
```

See [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) for details.

## Cloud Deployment

### AWS ECS (Fargate)

**Automated Deployment**:

```bash
# Set environment variables
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=us-east-1

# Run deployment script
./deploy-aws.sh
```

**Manual Steps**:

1. Create ECR repository
2. Push Docker image to ECR
3. Create ECS cluster and task definition
4. Configure service with auto-scaling
5. Set up Application Load Balancer

**Key Configuration**:

- **CPU**: 512 vCPU
- **Memory**: 1024 MB
- **Auto-scaling**: 1-10 tasks based on CPU (70% threshold)
- **Health check**: /api/health every 30s

### Azure App Service for Containers

**Automated Deployment**:

```bash
# Set environment variables
export RESOURCE_GROUP=StartupDiscoveryRG
export ACR_NAME=kalviumregistry
export APP_NAME=startupdiscovery

# Run deployment script
./deploy-azure.sh
```

**Manual Steps**:

1. Create Azure Container Registry (ACR)
2. Push Docker image to ACR
3. Create App Service Plan (Linux, container-based)
4. Deploy container from ACR
5. Configure auto-scaling rules

**Key Configuration**:

- **Plan**: P1V2 (production)
- **Auto-scaling**: 1-10 instances based on CPU (70% threshold)
- **Continuous deployment**: Enabled from GitHub Actions

### Container Registry

**AWS ECR**:

```bash
# Login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Push image
docker tag startupdiscovery:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/startupdiscovery:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/startupdiscovery:latest
```

**Azure ACR**:

```bash
# Login
az acr login --name kalviumregistry

# Push image
docker tag startupdiscovery:latest \
  kalviumregistry.azurecr.io/startupdiscovery:latest
docker push kalviumregistry.azurecr.io/startupdiscovery:latest
```

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for comprehensive deployment guide.

## CI/CD Pipeline

### GitHub Actions

Two automated workflows for continuous deployment:

**AWS ECS Workflow** (`.github/workflows/deploy-aws-ecs.yml`):

1. Checkout code
2. Build Docker image
3. Push to Amazon ECR
4. Update ECS task definition
5. Deploy to ECS service
6. Wait for service stability

**Azure App Service Workflow** (`.github/workflows/deploy-azure-appservice.yml`):

1. Checkout code
2. Build Docker image
3. Push to Azure Container Registry
4. Deploy to App Service
5. Verify deployment

### Triggering Deployments

```bash
# Automatic: Push to main branch
git push origin main

# Manual: Via GitHub CLI
gh workflow run deploy-aws-ecs.yml

# Manual: Via GitHub UI
# Actions → Select workflow → Run workflow
```

### Required Secrets

Configure in: **Settings → Secrets and variables → Actions**

**For AWS**:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**For Azure**:

- `ACR_USERNAME`
- `ACR_PASSWORD`
- `AZURE_CREDENTIALS`

## Monitoring

### Container Metrics

**AWS CloudWatch**:

```bash
# View logs
aws logs tail /ecs/startupdiscovery --follow

# Create CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name startupdiscovery-high-cpu \
  --metric-name CPUUtilization \
  --threshold 80
```

**Azure Monitor**:

```bash
# View logs
az webapp log tail \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG

# Enable Application Insights
az webapp config appsettings set \
  --name startupdiscovery \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="..."
```

### Key Metrics

| Metric              | Target  | Alert Threshold |
| ------------------- | ------- | --------------- |
| CPU Utilization     | < 70%   | > 80%           |
| Memory Usage        | < 80%   | > 90%           |
| Response Time (P95) | < 500ms | > 1000ms        |
| Error Rate          | < 1%    | > 5%            |
| Health Check        | 100%    | < 95%           |

### Auto-Scaling

Both ECS and App Service configured for automatic scaling:

- **Scale Out**: When CPU > 70% for 5 minutes
- **Scale In**: When CPU < 30% for 5 minutes
- **Min Instances**: 1
- **Max Instances**: 10
- **Cool-down**: 60s (scale out), 300s (scale in)

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
