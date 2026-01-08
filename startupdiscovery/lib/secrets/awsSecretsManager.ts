/**
 * AWS Secrets Manager Integration
 * Securely retrieve secrets from AWS Secrets Manager at runtime
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
  DescribeSecretCommand,
  UpdateSecretCommand,
} from "@aws-sdk/client-secrets-manager";

let client: SecretsManagerClient | null = null;

/**
 * Initialize AWS Secrets Manager client
 */
function initializeClient(): SecretsManagerClient {
  if (client) return client;

  const region = process.env.AWS_REGION || "us-east-1";

  client = new SecretsManagerClient({ region });

  return client;
}

export interface SecretValue {
  [key: string]: string;
}

/**
 * Retrieve a secret from AWS Secrets Manager
 * @param secretId - The secret ID or ARN
 * @returns Parsed secret object
 */
export async function getAwsSecret(secretId: string): Promise<SecretValue> {
  if (!secretId) {
    throw new Error("Secret ID is required");
  }

  try {
    const awsClient = initializeClient();

    const command = new GetSecretValueCommand({
      SecretId: secretId,
    });

    const response = await awsClient.send(command);

    // Parse the secret string
    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    } else if (response.SecretBinary) {
      // Handle binary secrets
      const decodedBinary = Buffer.from(
        response.SecretBinary as unknown as string,
        "base64"
      );
      return JSON.parse(decodedBinary.toString("ascii"));
    }

    throw new Error("No secret value found");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to retrieve secret: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get a specific secret value by key
 * @param secretId - The secret ID or ARN
 * @param key - The key within the secret
 * @returns The secret value
 */
export async function getAwsSecretValue(
  secretId: string,
  key: string
): Promise<string | undefined> {
  const secret = await getAwsSecret(secretId);
  return secret[key];
}

/**
 * Get all secrets as environment variables
 * Useful for injecting into process.env at runtime
 */
export async function loadAwsSecretsAsEnv(secretId: string): Promise<void> {
  const secrets = await getAwsSecret(secretId);

  for (const [key, value] of Object.entries(secrets)) {
    if (typeof value === "string") {
      process.env[key] = value;
    }
  }
}

/**
 * Verify secret exists and is accessible
 */
export async function verifyAwsSecretAccess(secretId: string): Promise<{
  accessible: boolean;
  name: string;
  lastUpdated: Date;
  error?: string;
}> {
  try {
    const awsClient = initializeClient();

    const command = new DescribeSecretCommand({
      SecretId: secretId,
    });

    const response = await awsClient.send(command);

    return {
      accessible: true,
      name: response.Name || "",
      lastUpdated: response.LastChangedDate || new Date(),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return {
      accessible: false,
      name: secretId,
      lastUpdated: new Date(),
      error: errorMsg,
    };
  }
}

/**
 * Update a secret in AWS Secrets Manager
 * Note: Typically used for rotation, not general updates
 */
export async function updateAwsSecret(
  secretId: string,
  secretValue: SecretValue
): Promise<{
  success: boolean;
  versionId?: string;
  error?: string;
}> {
  try {
    const awsClient = initializeClient();

    const command = new UpdateSecretCommand({
      SecretId: secretId,
      SecretString: JSON.stringify(secretValue),
    });

    const response = await awsClient.send(command);

    return {
      success: true,
      versionId: response.VersionId,
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
 * Get secret metadata without retrieving the actual value
 * Useful for checking rotation dates and other metadata
 */
export async function getAwsSecretMetadata(secretId: string): Promise<{
  name: string;
  arn: string;
  createdDate: Date;
  lastAccessedDate?: Date;
  lastRotatedDate?: Date;
  rotationEnabled: boolean;
  error?: string;
}> {
  try {
    const awsClient = initializeClient();

    const command = new DescribeSecretCommand({
      SecretId: secretId,
    });

    const response = await awsClient.send(command);

    return {
      name: response.Name || "",
      arn: response.ARN || "",
      createdDate: response.CreatedDate || new Date(),
      lastAccessedDate: response.LastAccessedDate,
      lastRotatedDate: response.LastRotatedDate,
      rotationEnabled: response.RotationEnabled || false,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return {
      name: secretId,
      arn: "",
      createdDate: new Date(),
      rotationEnabled: false,
      error: errorMsg,
    };
  }
}
