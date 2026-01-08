/**
 * Azure Key Vault Integration
 * Securely retrieve secrets from Azure Key Vault at runtime
 */

import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

let client: SecretClient | null = null;

/**
 * Initialize Azure Key Vault client
 */
function initializeClient(): SecretClient {
  if (client) return client;

  const vaultName = process.env.AZURE_KEYVAULT_NAME;
  if (!vaultName) {
    throw new Error("AZURE_KEYVAULT_NAME environment variable is not set");
  }

  const vaultUrl = `https://${vaultName}.vault.azure.net`;
  const credential = new DefaultAzureCredential();

  client = new SecretClient(vaultUrl, credential);

  return client;
}

export interface SecretValue {
  [key: string]: string;
}

/**
 * Retrieve a secret from Azure Key Vault
 * @param secretName - The secret name
 * @returns Parsed secret object or string value
 */
export async function getAzureSecret(
  secretName: string
): Promise<string | SecretValue> {
  if (!secretName) {
    throw new Error("Secret name is required");
  }

  try {
    const kvClient = initializeClient();

    const secret = await kvClient.getSecret(secretName);

    if (!secret.value) {
      throw new Error("No secret value found");
    }

    // Try to parse as JSON, otherwise return as string
    try {
      return JSON.parse(secret.value);
    } catch {
      return secret.value;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to retrieve secret: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get a specific secret value from Key Vault
 * Parses JSON secrets and extracts specific key
 */
export async function getAzureSecretValue(
  secretName: string,
  key?: string
): Promise<string> {
  const secret = await getAzureSecret(secretName);

  if (typeof secret === "string") {
    return secret;
  }

  if (!key) {
    throw new Error("Key is required for JSON secrets");
  }

  const value = secret[key];
  if (!value) {
    throw new Error(`Key '${key}' not found in secret`);
  }

  return value;
}

/**
 * Get all secrets from a JSON stored secret and load as environment variables
 */
export async function loadAzureSecretsAsEnv(secretName: string): Promise<void> {
  const secret = await getAzureSecret(secretName);

  if (typeof secret === "string") {
    throw new Error("Secret is not JSON parseable");
  }

  for (const [key, value] of Object.entries(secret)) {
    if (typeof value === "string") {
      process.env[key] = value;
    }
  }
}

/**
 * List all secrets in Key Vault
 */
export async function listAzureSecrets(): Promise<string[]> {
  try {
    const kvClient = initializeClient();

    const secretNames: string[] = [];
    for await (const secretProperties of kvClient.listPropertiesOfSecrets()) {
      if (secretProperties.name) {
        secretNames.push(secretProperties.name);
      }
    }

    return secretNames;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to list secrets: ${errorMsg}`);
  }
}

/**
 * Verify secret exists and is accessible
 */
export async function verifyAzureSecretAccess(secretName: string): Promise<{
  accessible: boolean;
  name: string;
  properties?: {
    createdOn?: Date;
    updatedOn?: Date;
    enabled?: boolean;
  };
  error?: string;
}> {
  try {
    const kvClient = initializeClient();

    const secret = await kvClient.getSecret(secretName);

    return {
      accessible: true,
      name: secret.name || "",
      properties: {
        createdOn: secret.properties.createdOn,
        updatedOn: secret.properties.updatedOn,
        enabled: secret.properties.enabled,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return {
      accessible: false,
      name: secretName,
      error: errorMsg,
    };
  }
}

/**
 * Update a secret in Azure Key Vault
 */
export async function updateAzureSecret(
  secretName: string,
  secretValue: string | SecretValue
): Promise<{
  success: boolean;
  version?: string;
  error?: string;
}> {
  try {
    const kvClient = initializeClient();

    const value =
      typeof secretValue === "string"
        ? secretValue
        : JSON.stringify(secretValue);

    const secret = await kvClient.setSecret(secretName, value);

    return {
      success: true,
      version: secret.properties.version,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Get secret properties and metadata
 */
export async function getAzureSecretMetadata(secretName: string): Promise<{
  name: string;
  enabled: boolean;
  createdOn?: Date;
  updatedOn?: Date;
  recoveryLevel?: string;
  error?: string;
}> {
  try {
    const kvClient = initializeClient();

    const secret = await kvClient.getSecret(secretName);

    return {
      name: secret.name || "",
      enabled: secret.properties.enabled || false,
      createdOn: secret.properties.createdOn,
      updatedOn: secret.properties.updatedOn,
      recoveryLevel: secret.properties.recoveryLevel,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return {
      name: secretName,
      enabled: false,
      error: errorMsg,
    };
  }
}
