/**
 * Storage client initialization and configuration
 * Provides type-safe storage client access
 */

export interface StorageConfig {
  provider: "aws" | "azure";
  maxFileSize: number;
  allowedMimeTypes: string[];
  presignedUrlExpiry: number;
}

/**
 * Load storage configuration from environment
 */
export function loadStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER || "aws") as "aws" | "azure";
  const maxFileSize = parseInt(
    process.env.STORAGE_MAX_FILE_SIZE || String(5 * 1024 * 1024),
    10
  );
  const presignedUrlExpiry = parseInt(
    process.env.STORAGE_PRESIGNED_URL_EXPIRY || "300",
    10
  );

  // Validate allowed MIME types from env or use defaults
  const allowedMimeTypesEnv = process.env.STORAGE_ALLOWED_MIME_TYPES;
  const allowedMimeTypes = allowedMimeTypesEnv
    ? allowedMimeTypesEnv.split(",").map((t) => t.trim())
    : [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

  return {
    provider,
    maxFileSize,
    allowedMimeTypes,
    presignedUrlExpiry,
  };
}

/**
 * Validate storage configuration
 */
export function validateStorageConfig(config: StorageConfig): string[] {
  const errors: string[] = [];

  if (config.provider !== "aws" && config.provider !== "azure") {
    errors.push(
      `Invalid provider: ${config.provider}. Must be 'aws' or 'azure'`
    );
  }

  if (config.maxFileSize <= 0) {
    errors.push("maxFileSize must be positive");
  }

  if (config.maxFileSize > 100 * 1024 * 1024) {
    errors.push(
      "maxFileSize is very large (>100MB). This may impact performance"
    );
  }

  if (config.allowedMimeTypes.length === 0) {
    errors.push("At least one MIME type must be allowed");
  }

  if (config.presignedUrlExpiry < 60) {
    errors.push("presignedUrlExpiry should be at least 60 seconds");
  }

  if (config.presignedUrlExpiry > 604800) {
    errors.push(
      "presignedUrlExpiry is very long (>7 days). Consider shortening for security"
    );
  }

  // Validate provider-specific config
  if (config.provider === "aws") {
    if (!process.env.AWS_REGION) {
      errors.push("AWS_REGION not configured");
    }
    if (!process.env.AWS_ACCESS_KEY_ID) {
      errors.push("AWS_ACCESS_KEY_ID not configured");
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      errors.push("AWS_SECRET_ACCESS_KEY not configured");
    }
    if (!process.env.AWS_S3_BUCKET_NAME) {
      errors.push("AWS_S3_BUCKET_NAME not configured");
    }
  }

  if (config.provider === "azure") {
    const hasConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const hasAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const hasAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (!hasConnectionString && (!hasAccountName || !hasAccountKey)) {
      errors.push(
        "Azure credentials not configured. Set either AZURE_STORAGE_CONNECTION_STRING or both AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY"
      );
    }
  }

  return errors;
}

/**
 * Initialize and validate storage configuration
 * Throws error if validation fails
 */
export function initializeStorageConfig(): StorageConfig {
  const config = loadStorageConfig();
  const errors = validateStorageConfig(config);

  if (errors.length > 0) {
    throw new Error(
      `Storage configuration validation failed:\n${errors.join("\n")}`
    );
  }

  return config;
}

/**
 * Get human-readable provider name
 */
export function getProviderDisplayName(provider: string): string {
  const names: Record<string, string> = {
    aws: "AWS S3",
    azure: "Azure Blob Storage",
  };

  return names[provider] || provider;
}

/**
 * Get storage info for diagnostics
 */
export function getStorageInfo(): {
  provider: string;
  configured: boolean;
  bucket?: string;
  container?: string;
  region?: string;
  account?: string;
} {
  const provider = process.env.STORAGE_PROVIDER || "aws";

  const info: {
    provider: string;
    configured: boolean;
    bucket?: string;
    container?: string;
    region?: string;
    account?: string;
  } = {
    provider,
    configured: false,
  };

  if (provider === "aws") {
    info.bucket = process.env.AWS_S3_BUCKET_NAME;
    info.region = process.env.AWS_REGION;
    info.configured =
      !!process.env.AWS_ACCESS_KEY_ID &&
      !!process.env.AWS_SECRET_ACCESS_KEY &&
      !!process.env.AWS_S3_BUCKET_NAME;
  } else if (provider === "azure") {
    info.container = process.env.AZURE_BLOB_CONTAINER_NAME;
    info.account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    info.configured =
      !!process.env.AZURE_STORAGE_CONNECTION_STRING ||
      (!!process.env.AZURE_STORAGE_ACCOUNT_NAME &&
        !!process.env.AZURE_STORAGE_ACCOUNT_KEY);
  }

  return info;
}
