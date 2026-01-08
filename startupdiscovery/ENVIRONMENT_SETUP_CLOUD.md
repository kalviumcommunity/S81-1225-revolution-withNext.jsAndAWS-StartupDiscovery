# Environment Setup on Cloud - Secrets Management

Complete guide for implementing secure secret management using AWS Secrets Manager or Azure Key Vault.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [AWS Secrets Manager Setup](#aws-secrets-manager-setup)
4. [Azure Key Vault Setup](#azure-key-vault-setup)
5. [Runtime Integration](#runtime-integration)
6. [API Endpoints](#api-endpoints)
7. [Rotation Strategy](#rotation-strategy)
8. [IAM & RBAC Configuration](#iam--rbac-configuration)
9. [Troubleshooting](#troubleshooting)

## Overview

This implementation provides:

- **Secure secret storage** in AWS Secrets Manager or Azure Key Vault
- **Runtime injection** of secrets into Next.js application
- **Zero-trust authentication** using managed identities and IAM roles
- **Automatic rotation** support with metadata tracking
- **Multiple secret formats** (JSON, plain text, binary)
- **Comprehensive verification** and diagnostic endpoints

### Key Features

✅ Provider abstraction (AWS/Azure with single interface)  
✅ Automatic secret discovery and loading  
✅ Metadata and rotation tracking  
✅ Cache management with refresh strategy  
✅ Development fallback to .env files  
✅ Type-safe configuration  
✅ Error handling and diagnostics

## Architecture

```
Next.js Application
        ↓
[initializeSecrets] - Load at startup
        ↓
[secretsManager] - Unified interface
        ↓
    AWS/Azure
        ↓
[Secrets Manager / Key Vault]
```

### Component Flow

1. **Application Startup** → `initializeSecrets()`
2. **Configuration Load** → Reads environment variables
3. **Provider Detection** → Determines AWS or Azure
4. **Authentication** → Uses IAM role or managed identity
5. **Secret Retrieval** → Fetches from cloud service
6. **Environment Injection** → Populates process.env
7. **Runtime Access** → API endpoints for verification

## AWS Secrets Manager Setup

### Step 1: Create a Secret in AWS Console

```bash
# Using AWS CLI
aws secretsmanager create-secret \
  --name prod/app-secrets \
  --description "Application secrets for production" \
  --secret-string '{
    "DATABASE_URL": "postgresql://user:pass@host:5432/db",
    "JWT_SECRET": "your-secret-key",
    "API_KEY": "your-api-key",
    "ENCRYPTION_KEY": "your-encryption-key"
  }' \
  --region us-east-1
```

### Step 2: Configure IAM Role

The EC2 instance or Lambda function needs permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:prod/app-secrets-*"
    }
  ]
}
```

### Step 3: Set Environment Variables

```env
# .env.production or deployment configuration
SECRETS_PROVIDER=aws
AWS_REGION=us-east-1
AWS_SECRET_ID=prod/app-secrets
```

### Step 4: Verify in Application

```bash
curl http://localhost:3000/api/secrets/verify \
  -H "Authorization: Bearer your-token"

# Response
{
  "configured": true,
  "provider": "aws",
  "accessible": true,
  "secretName": "prod/app-secrets",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "message": "Secrets are properly configured and accessible"
}
```

## Azure Key Vault Setup

### Step 1: Create a Key Vault

```bash
# Using Azure CLI
az keyvault create \
  --resource-group myResourceGroup \
  --name myKeyVault \
  --location eastus

# Create secrets
az keyvault secret set \
  --vault-name myKeyVault \
  --name app-secrets \
  --value '{
    "DATABASE_URL": "postgresql://user:pass@host:5432/db",
    "JWT_SECRET": "your-secret-key",
    "API_KEY": "your-api-key",
    "ENCRYPTION_KEY": "your-encryption-key"
  }'
```

### Step 2: Configure Managed Identity

Enable managed identity on App Service:

```bash
# For App Service
az webapp identity assign \
  --resource-group myResourceGroup \
  --name myAppService

# For Container Instances
az container create \
  --resource-group myResourceGroup \
  --assign-identity /subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}
```

### Step 3: Grant RBAC Access

```bash
# Get the principal ID of the managed identity
PRINCIPAL_ID=$(az webapp identity show \
  --resource-group myResourceGroup \
  --name myAppService \
  --query principalId -o tsv)

# Assign role
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee $PRINCIPAL_ID \
  --scope /subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.KeyVault/vaults/{vaultName}
```

### Step 4: Set Environment Variables

```env
# .env.production
SECRETS_PROVIDER=azure
AZURE_KEYVAULT_NAME=myKeyVault
AZURE_SECRET_NAME=app-secrets
```

### Step 5: Verify in Application

```bash
curl http://localhost:3000/api/secrets/verify \
  -H "Authorization: Bearer your-token"

# Response
{
  "configured": true,
  "provider": "azure",
  "accessible": true,
  "secretName": "app-secrets",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "message": "Secrets are properly configured and accessible"
}
```

## Runtime Integration

### Method 1: Server Component (Recommended)

```typescript
// app/layout.tsx
import { initializeSecrets } from '@/lib/secrets/initializeSecrets';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize secrets once at startup
  const result = await initializeSecrets({
    loadEnv: true,
    verify: true,
    secretId: process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME,
    throwOnError: process.env.NODE_ENV === 'production',
  });

  if (!result.success && process.env.NODE_ENV === 'production') {
    console.error('Failed to initialize secrets:', result.errors);
    // Could trigger alert, fallback, or graceful degradation
  }

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### Method 2: API Middleware

```typescript
// middleware.ts
import { initializeSecrets } from "@/lib/secrets/initializeSecrets";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Initialize on first request
let secretsInitialized = false;

export async function middleware(request: NextRequest) {
  if (!secretsInitialized) {
    await initializeSecrets({
      loadEnv: true,
      verify: false, // Skip verification on every request
      secretId: process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME,
      throwOnError: false,
    });
    secretsInitialized = true;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Method 3: Direct API Handler

```typescript
// app/api/data/route.ts
import { getSecretValue } from "@/lib/secrets";

export async function GET() {
  try {
    // Get database URL from secret
    const dbUrl = await getSecretValue("prod/app-secrets", "DATABASE_URL");

    // Use in application
    const client = createClient(dbUrl);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to load secrets" }, { status: 500 });
  }
}
```

### Accessing Secrets in Code

After initialization, secrets are available as environment variables:

```typescript
// Use injected environment variables
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;
const jwtSecret = process.env.JWT_SECRET;

// Or retrieve programmatically
import { getSecretValue } from "@/lib/secrets";

const secret = await getSecretValue("prod/app-secrets", "JWT_SECRET");
```

## API Endpoints

### Verify Endpoint

**GET** `/api/secrets/verify`

Check if secrets are properly configured and accessible.

**Headers:**

```
Authorization: Bearer {token}  (required in production)
```

**Response (200):**

```json
{
  "configured": true,
  "provider": "aws",
  "accessible": true,
  "secretName": "prod/app-secrets",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "message": "Secrets are properly configured and accessible"
}
```

**Response (400):**

```json
{
  "configured": false,
  "provider": "aws",
  "errors": ["AWS_REGION not configured", "AWS_SECRET_ID not configured"]
}
```

### Metadata Endpoint

**GET** `/api/secrets/metadata?secret={secretName}`

Get metadata and rotation information for a secret.

**Query Parameters:**

- `secret` (optional) - Secret name/ID (uses default if not provided)

**Response (200):**

```json
{
  "name": "prod/app-secrets",
  "accessible": true,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "enabled": true,
  "rotationInfo": {
    "lastUpdated": "2024-01-15T10:30:00Z",
    "nextRotationDue": "2024-04-15T10:30:00Z",
    "rotationFrequency": "90 days"
  }
}
```

## Rotation Strategy

### Automatic Rotation with AWS Secrets Manager

```bash
# Enable automatic rotation
aws secretsmanager rotate-secret \
  --secret-id prod/app-secrets \
  --rotation-rules AutomaticallyAfterDays=30

# Configure rotation Lambda
aws secretsmanager rotate-secret \
  --secret-id prod/app-secrets \
  --rotation-lambda-arn arn:aws:lambda:region:account:function:SecretsManagerRotation
```

### Automatic Rotation with Azure Key Vault

```bash
# Enable auto-rotation via Event Grid
az eventgrid event-subscription create \
  --name keyvault-rotation \
  --source-resource-id /subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.KeyVault/vaults/{vaultName} \
  --endpoint-type webhook \
  --endpoint https://your-function-app/api/rotate-secret
```

### Manual Rotation Process

1. **Generate New Secret**

   ```bash
   # AWS
   aws secretsmanager put-secret-value \
     --secret-id prod/app-secrets \
     --secret-string '{new secret JSON}'

   # Azure
   az keyvault secret set \
     --vault-name myKeyVault \
     --name app-secrets \
     --value '{new secret JSON}'
   ```

2. **Update in Application**
   - No restart needed if using initialization at request time
   - Or trigger application refresh

3. **Verify New Secret**

   ```bash
   curl http://localhost:3000/api/secrets/metadata
   ```

4. **Archive Old Secret** (optional, keep for recovery)

### Rotation Strategy Best Practices

| Strategy               | Frequency | Use Case                 |
| ---------------------- | --------- | ------------------------ |
| **API Keys**           | 30 days   | External API credentials |
| **Database Passwords** | 60 days   | Database credentials     |
| **Encryption Keys**    | 90 days   | Application encryption   |
| **JWT Secrets**        | 180 days  | Session management       |
| **Certificates**       | 365 days  | TLS/SSL certificates     |

## IAM & RBAC Configuration

### AWS IAM Policy Examples

**Development (Local Testing)**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecrets"
      ],
      "Resource": "*"
    }
  ]
}
```

**Production (EC2/ECS Role)**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:prod/*",
      "Condition": {
        "StringEquals": {
          "secretsmanager:VersionStage": "AWSCURRENT"
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:DescribeSecret"],
      "Resource": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:prod/*"
    }
  ]
}
```

**Rotation (Lambda Role)**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:DescribeSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:PutSecretValue",
        "secretsmanager:UpdateSecretVersionStage"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:*"
    },
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetRandomPassword"],
      "Resource": "*"
    }
  ]
}
```

### Azure RBAC Role Assignments

**Development (Local Testing)**

```bash
# Assign "Key Vault Secrets Officer" role
az role assignment create \
  --role "Key Vault Secrets Officer" \
  --assignee {principalId} \
  --scope /subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.KeyVault/vaults/{vaultName}
```

**Production (App Service)**

```bash
# Assign "Key Vault Secrets User" role (read-only)
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee {managedIdentityPrincipalId} \
  --scope /subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.KeyVault/vaults/{vaultName}
```

**Custom Role (Minimal Permissions)**

```json
{
  "Name": "Key Vault Secrets Reader",
  "Description": "Read secrets only",
  "Actions": ["Microsoft.KeyVault/vaults/secrets/read"],
  "NotActions": [],
  "DataActions": ["Microsoft.KeyVault/vaults/secrets/getValue/action"],
  "NotDataActions": []
}
```

## Troubleshooting

### AWS Issues

**Error: InvalidRequestException: You aren't authorized to perform this action**

- Verify IAM role has `secretsmanager:GetSecretValue` permission
- Check role is attached to EC2 instance or Lambda
- Ensure secret resource ARN matches in policy

```bash
# Check IAM role
aws sts get-caller-identity

# Check secret permissions
aws secretsmanager describe-secret --secret-id prod/app-secrets
```

**Error: ResourceNotFoundException: Secrets Manager can't find the specified secret**

- Verify secret exists: `aws secretsmanager list-secrets`
- Check secret name spelling and region
- Ensure region in code matches secret location

```bash
# List secrets in region
aws secretsmanager list-secrets --region us-east-1
```

### Azure Issues

**Error: CredentialUnavailableError: DefaultAzureCredential failed**

- Verify managed identity is enabled on App Service
- Check principal ID is assigned RBAC role
- Ensure `AZURE_KEYVAULT_NAME` environment variable is set

```bash
# Check managed identity
az webapp identity show --resource-group myResourceGroup --name myAppService

# Check RBAC assignments
az role assignment list --scope /subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.KeyVault/vaults/{vaultName}
```

**Error: AuthorizationFailed: The client with object id doesn't have permission**

- Assign "Key Vault Secrets User" role to managed identity
- Verify resource group and vault names
- Check RBAC propagation (can take minutes)

### Common Issues

**Secrets not loaded in process.env**

```typescript
// Verify initialization completed
import { getInitializationStatus } from "@/lib/secrets/initializeSecrets";

const status = getInitializationStatus();
console.log(status); // { initialized: true, cacheSize: 3, provider: 'aws' }
```

**API endpoint returns 401 Unauthorized**

- Development mode should allow access without token
- For production, verify `SECRETS_VERIFY_TOKEN` environment variable
- Check authorization header format: `Authorization: Bearer {token}`

**Secrets are null or undefined**

```typescript
// Check secret structure
const secret = await getSecret("prod/app-secrets");
console.log(secret); // Should be object with keys

// Verify specific value
const dbUrl = await getSecretValue("prod/app-secrets", "DATABASE_URL");
console.log(dbUrl); // Should be string
```

### Debugging

Enable debug logs:

```typescript
// In library code, add logging
const secret = await getSecret("prod/app-secrets");
console.log("[SECRETS]", { provider, secretId, success: !!secret });

// Check environment
console.log("[CONFIG]", {
  provider: process.env.SECRETS_PROVIDER,
  awsRegion: process.env.AWS_REGION,
  awsSecretId: process.env.AWS_SECRET_ID,
  azureVault: process.env.AZURE_KEYVAULT_NAME,
});
```

## Summary

This implementation provides enterprise-grade secret management with:

- ✅ **Secure storage** in AWS Secrets Manager or Azure Key Vault
- ✅ **Zero-trust authentication** with IAM roles and managed identities
- ✅ **Automatic rotation** support with metadata tracking
- ✅ **Runtime verification** via API endpoints
- ✅ **Type-safe** configuration and error handling
- ✅ **Production-ready** with comprehensive documentation

Next: Configure your cloud provider, set up environment variables, and integrate `initializeSecrets()` into your application startup.
