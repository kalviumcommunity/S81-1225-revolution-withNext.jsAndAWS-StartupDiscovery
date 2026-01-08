# Secrets Management - Quick Reference

Fast lookup for common tasks and code patterns.

## Configuration

### Set Provider

```bash
# AWS
export SECRETS_PROVIDER=aws
export AWS_REGION=us-east-1
export AWS_SECRET_ID=prod/app-secrets

# Azure
export SECRETS_PROVIDER=azure
export AZURE_KEYVAULT_NAME=myKeyVault
export AZURE_SECRET_NAME=app-secrets
```

### Environment File

```env
# .env.production
SECRETS_PROVIDER=aws
AWS_REGION=us-east-1
AWS_SECRET_ID=prod/app-secrets
SECRETS_VERIFY_TOKEN=your-secure-token
```

## Code Examples

### Initialize at Startup (Server Component)

```typescript
// app/layout.tsx
import { initializeSecrets } from '@/lib/secrets/initializeSecrets';

export default async function RootLayout({ children }) {
  await initializeSecrets({
    loadEnv: true,
    verify: true,
    secretId: process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME,
    throwOnError: process.env.NODE_ENV === 'production',
  });

  return <html><body>{children}</body></html>;
}
```

### Retrieve Secret

```typescript
import { getSecret, getSecretValue } from "@/lib/secrets";

// Get entire secret object
const secrets = await getSecret("prod/app-secrets");

// Get specific value
const dbUrl = await getSecretValue("prod/app-secrets", "DATABASE_URL");
const apiKey = await getSecretValue("prod/app-secrets", "API_KEY");
```

### Verify Access

```typescript
import { verifySecretAccess } from "@/lib/secrets";

const metadata = await verifySecretAccess("prod/app-secrets");
console.log(metadata);
// {
//   name: 'prod/app-secrets',
//   accessible: true,
//   lastUpdated: Date,
//   enabled: true
// }
```

### Get Metadata

```typescript
import { getSecretMetadata } from "@/lib/secrets";

const meta = await getSecretMetadata("prod/app-secrets");
console.log(`Last updated: ${meta.lastUpdated}`);
```

### Update Secret

```typescript
import { updateSecret } from "@/lib/secrets";

// During rotation
const result = await updateSecret("prod/app-secrets", {
  DATABASE_URL: "postgresql://new-url",
  JWT_SECRET: "new-secret-key",
});

console.log(result);
// { success: true, version: 'v2' }
```

### Use in API Handler

```typescript
// app/api/data/route.ts
import { getSecretValue } from "@/lib/secrets";

export async function GET() {
  try {
    const dbUrl = await getSecretValue("prod/app-secrets", "DATABASE_URL");

    // Use secret...
    const response = await fetch(dbUrl);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}
```

### Check Initialization

```typescript
import { getInitializationStatus } from "@/lib/secrets/initializeSecrets";

const status = getInitializationStatus();
if (status.initialized) {
  console.log(`Secrets loaded for ${status.provider}`);
}
```

## API Endpoints

### Verify Secrets

```bash
# Check if secrets are accessible
curl http://localhost:3000/api/secrets/verify \
  -H "Authorization: Bearer your-token"

# Response
{
  "configured": true,
  "provider": "aws",
  "accessible": true,
  "secretName": "prod/app-secrets",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### Get Metadata

```bash
# Get rotation info
curl http://localhost:3000/api/secrets/metadata \
  -H "Authorization: Bearer your-token"

# Response
{
  "name": "prod/app-secrets",
  "accessible": true,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "rotationInfo": {
    "nextRotationDue": "2024-04-15T10:30:00Z",
    "rotationFrequency": "90 days"
  }
}
```

## AWS CLI Commands

### Create Secret

```bash
aws secretsmanager create-secret \
  --name prod/app-secrets \
  --secret-string '{
    "DATABASE_URL": "postgresql://...",
    "JWT_SECRET": "...",
    "API_KEY": "..."
  }' \
  --region us-east-1
```

### Update Secret

```bash
aws secretsmanager put-secret-value \
  --secret-id prod/app-secrets \
  --secret-string '{new JSON}'
```

### List Secrets

```bash
aws secretsmanager list-secrets --region us-east-1
```

### Get Secret

```bash
aws secretsmanager get-secret-value \
  --secret-id prod/app-secrets \
  --region us-east-1 \
  --query 'SecretString' \
  --output text
```

### Check Permissions

```bash
# Get current IAM identity
aws sts get-caller-identity

# Describe secret (check permissions)
aws secretsmanager describe-secret --secret-id prod/app-secrets
```

## Azure CLI Commands

### Create Key Vault

```bash
az keyvault create \
  --resource-group myResourceGroup \
  --name myKeyVault \
  --location eastus
```

### Create Secret

```bash
az keyvault secret set \
  --vault-name myKeyVault \
  --name app-secrets \
  --value '{
    "DATABASE_URL": "...",
    "JWT_SECRET": "...",
    "API_KEY": "..."
  }'
```

### List Secrets

```bash
az keyvault secret list --vault-name myKeyVault
```

### Get Secret

```bash
az keyvault secret show \
  --vault-name myKeyVault \
  --name app-secrets \
  --query 'value' \
  -o tsv
```

### Assign RBAC

```bash
# Get managed identity principal ID
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

## Testing

### Run Test Suite

```bash
npx ts-node scripts/test-secrets.ts
```

### Test Specific Provider

```bash
# AWS
SECRETS_PROVIDER=aws \
AWS_REGION=us-east-1 \
AWS_SECRET_ID=prod/app-secrets \
npx ts-node scripts/test-secrets.ts

# Azure
SECRETS_PROVIDER=azure \
AZURE_KEYVAULT_NAME=myKeyVault \
AZURE_SECRET_NAME=app-secrets \
npx ts-node scripts/test-secrets.ts
```

## Troubleshooting

### AWS Connection Issues

```bash
# Check IAM role
aws sts get-caller-identity

# Check secret exists
aws secretsmanager list-secrets --region us-east-1

# Check secret content
aws secretsmanager get-secret-value --secret-id prod/app-secrets

# Test permissions
aws secretsmanager describe-secret --secret-id prod/app-secrets
```

### Azure Connection Issues

```bash
# Check managed identity
az webapp identity show --resource-group myResourceGroup --name myAppService

# Check RBAC
az role assignment list \
  --scope /subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.KeyVault/vaults/{vaultName}

# Check vault access
az keyvault secret list --vault-name myKeyVault
```

### Debug Logs

```typescript
// Enable debug output
console.log("[SECRETS]", {
  provider: process.env.SECRETS_PROVIDER,
  configured: process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME,
});

// Check initialization
import { getInitializationStatus } from "@/lib/secrets/initializeSecrets";
console.log(getInitializationStatus());
```

## Key Files

| File                                | Purpose                |
| ----------------------------------- | ---------------------- |
| `lib/secrets/index.ts`              | Unified secrets client |
| `lib/secrets/awsSecretsManager.ts`  | AWS integration        |
| `lib/secrets/azureKeyVault.ts`      | Azure integration      |
| `lib/secrets/initializeSecrets.ts`  | Startup initialization |
| `app/api/secrets/verify/route.ts`   | Health check endpoint  |
| `app/api/secrets/metadata/route.ts` | Metadata endpoint      |
| `scripts/test-secrets.ts`           | Test suite             |
| `ENVIRONMENT_SETUP_CLOUD.md`        | Full documentation     |

## Common Patterns

### Development vs Production

```typescript
// app/layout.tsx
export default async function RootLayout({ children }) {
  const shouldThrow = process.env.NODE_ENV === 'production';

  const result = await initializeSecrets({
    loadEnv: true,
    verify: true,
    secretId: process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME,
    throwOnError: shouldThrow,
  });

  if (!result.success) {
    console.warn('Secrets warning:', result.message);
    // In dev: continue with fallback
    // In prod: application may have already thrown
  }

  return <html><body>{children}</body></html>;
}
```

### Fallback to Local .env

```typescript
// lib/config.ts
async function loadConfig() {
  try {
    const dbUrl = await getSecretValue("prod/app-secrets", "DATABASE_URL");
    return { DATABASE_URL: dbUrl };
  } catch (error) {
    // Fallback to environment variables
    console.warn("Using local .env");
    return { DATABASE_URL: process.env.DATABASE_URL };
  }
}
```

### Secret Refresh

```typescript
import { refreshSecrets } from "@/lib/secrets/initializeSecrets";

// Refresh after rotation
async function onSecretRotation() {
  const success = await refreshSecrets(process.env.AWS_SECRET_ID!);
  if (success) {
    console.log("Secrets refreshed");
  }
}
```

## Environment Variables Summary

### AWS

- `SECRETS_PROVIDER=aws`
- `AWS_REGION=us-east-1`
- `AWS_SECRET_ID=prod/app-secrets`
- `SECRETS_VERIFY_TOKEN=token` (for API endpoint)

### Azure

- `SECRETS_PROVIDER=azure`
- `AZURE_KEYVAULT_NAME=myKeyVault`
- `AZURE_SECRET_NAME=app-secrets`
- `SECRETS_VERIFY_TOKEN=token` (for API endpoint)

## Performance Tips

1. **Cache secrets** - Use `setCachedSecret()` after loading
2. **Lazy loading** - Load secrets only when needed in API handlers
3. **Batch retrieval** - Load all secrets in one call, not individually
4. **TTL management** - Set appropriate cache TTL to balance freshness vs performance
5. **Async initialization** - Load secrets during app startup, not on every request

## Security Best Practices

- ✅ Use IAM roles instead of static credentials
- ✅ Use managed identities in Azure
- ✅ Implement least-privilege access
- ✅ Rotate secrets regularly (30-90 days)
- ✅ Audit secret access
- ✅ Never log secret values
- ✅ Use HTTPS for all API endpoints
- ✅ Validate secret access on startup
