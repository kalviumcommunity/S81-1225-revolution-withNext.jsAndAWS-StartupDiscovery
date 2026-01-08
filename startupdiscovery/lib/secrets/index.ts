/**
 * Unified Secrets Client
 * Abstracts AWS Secrets Manager and Azure Key Vault
 * Provides a consistent interface for both cloud providers
 */

import {
  getAwsSecret,
  getAwsSecretValue,
  loadAwsSecretsAsEnv,
  verifyAwsSecretAccess,
  getAwsSecretMetadata,
  updateAwsSecret,
} from "./awsSecretsManager";

import {
  getAzureSecret,
  getAzureSecretValue,
  loadAzureSecretsAsEnv,
  verifyAzureSecretAccess,
  getAzureSecretMetadata,
  updateAzureSecret,
} from "./azureKeyVault";

export type SecretsProvider = "aws" | "azure";
export type SecretValue = Record<string, string>;

export interface SecretMetadata {
  name: string;
  accessible: boolean;
  lastUpdated: Date;
  enabled?: boolean;
  error?: string;
}

/**
 * Initialize secrets provider based on configuration
 */
export function getSecretsProvider(): SecretsProvider {
  const provider = process.env.SECRETS_PROVIDER || "aws";

  if (provider !== "aws" && provider !== "azure") {
    throw new Error(
      `Invalid SECRETS_PROVIDER: ${provider}. Must be 'aws' or 'azure'`
    );
  }

  return provider as SecretsProvider;
}

/**
 * Retrieve a secret from the configured provider
 */
export async function getSecret(
  secretId: string
): Promise<string | SecretValue> {
  const provider = getSecretsProvider();

  if (provider === "aws") {
    return getAwsSecret(secretId);
  } else {
    return getAzureSecret(secretId);
  }
}

/**
 * Get a specific value from a secret
 */
export async function getSecretValue(
  secretId: string,
  key?: string
): Promise<string> {
  const provider = getSecretsProvider();

  if (provider === "aws") {
    return getAwsSecretValue(secretId, key || "");
  } else {
    return getAzureSecretValue(secretId, key);
  }
}

/**
 * Load all secrets as environment variables
 */
export async function loadSecretsAsEnv(secretId: string): Promise<void> {
  const provider = getSecretsProvider();

  if (provider === "aws") {
    return loadAwsSecretsAsEnv(secretId);
  } else {
    return loadAzureSecretsAsEnv(secretId);
  }
}

/**
 * Verify access to a secret
 */
export async function verifySecretAccess(
  secretId: string
): Promise<SecretMetadata> {
  const provider = getSecretsProvider();

  if (provider === "aws") {
    const result = await verifyAwsSecretAccess(secretId);
    return {
      name: result.name,
      accessible: result.accessible,
      lastUpdated: result.lastUpdated,
      error: result.error,
    };
  } else {
    const result = await verifyAzureSecretAccess(secretId);
    return {
      name: result.name,
      accessible: result.accessible,
      lastUpdated: result.properties?.updatedOn || new Date(),
      enabled: result.properties?.enabled,
      error: result.error,
    };
  }
}

/**
 * Get secret metadata
 */
export async function getSecretMetadata(
  secretId: string
): Promise<SecretMetadata> {
  const provider = getSecretsProvider();

  if (provider === "aws") {
    const result = await getAwsSecretMetadata(secretId);
    return {
      name: result.name,
      accessible: !result.error,
      lastUpdated: result.lastRotatedDate || result.createdDate,
      error: result.error,
    };
  } else {
    const result = await getAzureSecretMetadata(secretId);
    return {
      name: result.name,
      accessible: !result.error,
      lastUpdated: result.updatedOn || new Date(),
      enabled: result.enabled,
      error: result.error,
    };
  }
}

/**
 * Update a secret
 */
export async function updateSecret(
  secretId: string,
  secretValue: string | SecretValue
): Promise<{
  success: boolean;
  version?: string;
  error?: string;
}> {
  const provider = getSecretsProvider();

  if (provider === "aws") {
    const value =
      typeof secretValue === "string" ? JSON.parse(secretValue) : secretValue;
    return updateAwsSecret(secretId, value);
  } else {
    return updateAzureSecret(secretId, secretValue);
  }
}

/**
 * Validate secrets provider configuration
 */
export function validateSecretsConfig(): string[] {
  const errors: string[] = [];
  const provider = process.env.SECRETS_PROVIDER || "aws";

  if (provider === "aws") {
    if (!process.env.AWS_REGION) {
      errors.push("AWS_REGION not configured");
    }
    if (!process.env.AWS_SECRET_ID) {
      errors.push("AWS_SECRET_ID not configured");
    }
  } else if (provider === "azure") {
    if (!process.env.AZURE_KEYVAULT_NAME) {
      errors.push("AZURE_KEYVAULT_NAME not configured");
    }
    if (!process.env.AZURE_SECRET_NAME) {
      errors.push("AZURE_SECRET_NAME not configured");
    }
  }

  return errors;
}

/**
 * Get configuration information for diagnostics
 */
export function getSecretsConfig(): {
  provider: SecretsProvider;
  configured: boolean;
  details: Record<string, string | undefined>;
} {
  const provider = getSecretsProvider();
  const errors = validateSecretsConfig();

  if (provider === "aws") {
    return {
      provider,
      configured: errors.length === 0,
      details: {
        region: process.env.AWS_REGION,
        secretId: process.env.AWS_SECRET_ID,
        configured: errors.length === 0 ? "yes" : "no",
      },
    };
  } else {
    return {
      provider,
      configured: errors.length === 0,
      details: {
        vaultName: process.env.AZURE_KEYVAULT_NAME,
        secretName: process.env.AZURE_SECRET_NAME,
        configured: errors.length === 0 ? "yes" : "no",
      },
    };
  }
}
