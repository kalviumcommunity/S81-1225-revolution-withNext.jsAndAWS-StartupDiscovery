/**
 * File validation utilities for secure storage uploads
 * Validates file type, size, and format before storage
 */

// Whitelist of allowed MIME types
export const ALLOWED_MIME_TYPES = {
  IMAGES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  DOCUMENTS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
  SPREADSHEETS: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ALL: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};

// Maximum file sizes in bytes
export const MAX_FILE_SIZES = {
  "image/jpeg": 5 * 1024 * 1024, // 5MB
  "image/png": 5 * 1024 * 1024, // 5MB
  "image/webp": 5 * 1024 * 1024, // 5MB
  "image/gif": 5 * 1024 * 1024, // 5MB
  "application/pdf": 20 * 1024 * 1024, // 20MB
  "application/msword": 10 * 1024 * 1024, // 10MB
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    10 * 1024 * 1024, // 10MB
  "text/plain": 10 * 1024 * 1024, // 10MB
  "application/vnd.ms-excel": 10 * 1024 * 1024, // 10MB
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    10 * 1024 * 1024, // 10MB
};

// File extensions to MIME type mapping for verification
export const EXTENSION_TO_MIME_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Validate file MIME type against whitelist
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[] = ALLOWED_MIME_TYPES.ALL
): ValidationResult {
  if (!mimeType) {
    return {
      valid: false,
      error: "File type not detected",
    };
  }

  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type not allowed: ${mimeType}. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size against maximum limits
 */
export function validateFileSize(
  fileSize: number,
  mimeType: string
): ValidationResult {
  const maxSize = MAX_FILE_SIZES[mimeType as keyof typeof MAX_FILE_SIZES];

  if (!maxSize) {
    return {
      valid: false,
      error: `No size limit configured for type: ${mimeType}`,
    };
  }

  if (fileSize > maxSize) {
    const maxMB = (maxSize / 1024 / 1024).toFixed(1);
    const fileMB = (fileSize / 1024 / 1024).toFixed(1);

    return {
      valid: false,
      error: `File too large (${fileMB}MB). Maximum allowed: ${maxMB}MB`,
    };
  }

  if (fileSize === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}

/**
 * Validate filename for security issues
 */
export function validateFilename(filename: string): ValidationResult {
  if (!filename || filename.trim().length === 0) {
    return {
      valid: false,
      error: "Filename is required",
    };
  }

  // Check for valid characters (alphanumeric, dots, hyphens, underscores)
  if (!/^[a-zA-Z0-9._\-]+$/.test(filename)) {
    return {
      valid: false,
      error:
        "Filename contains invalid characters. Use only alphanumeric, dots, hyphens, and underscores.",
    };
  }

  // Check for path traversal attempts
  if (
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("..")
  ) {
    return {
      valid: false,
      error: "Filename cannot contain path separators",
    };
  }

  // Check filename length
  if (filename.length > 255) {
    return {
      valid: false,
      error: "Filename too long (max 255 characters)",
    };
  }

  return { valid: true };
}

/**
 * Verify file extension matches MIME type
 */
export function validateExtensionMimeMatch(
  filename: string,
  mimeType: string
): ValidationResult {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (!extension) {
    return {
      valid: false,
      error: "File has no extension",
    };
  }

  const expectedMime =
    EXTENSION_TO_MIME_TYPE[extension as keyof typeof EXTENSION_TO_MIME_TYPE];

  if (!expectedMime) {
    return {
      valid: true,
      warnings: [`Unknown file extension: ${extension}`],
    };
  }

  if (expectedMime !== mimeType) {
    return {
      valid: false,
      error: `File extension (${extension}) doesn't match MIME type (${mimeType})`,
    };
  }

  return { valid: true };
}

/**
 * Comprehensive file validation combining all checks
 */
export function validateFile(
  filename: string,
  mimeType: string,
  fileSize: number,
  allowedTypes: string[] = ALLOWED_MIME_TYPES.ALL
): ValidationResult {
  // Check filename
  const filenameValidation = validateFilename(filename);
  if (!filenameValidation.valid) {
    return filenameValidation;
  }

  // Check MIME type
  const typeValidation = validateFileType(mimeType, allowedTypes);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Check extension matches MIME type
  const extensionValidation = validateExtensionMimeMatch(filename, mimeType);
  if (!extensionValidation.valid) {
    return extensionValidation;
  }

  // Check file size
  const sizeValidation = validateFileSize(fileSize, mimeType);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // Combine warnings from all validations
  const warnings: string[] = [];
  if (extensionValidation.warnings) {
    warnings.push(...extensionValidation.warnings);
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Generate safe filename by sanitizing special characters
 */
export function generateSafeFilename(originalFilename: string): string {
  // Remove path separators
  let safe = originalFilename.replace(/[\/\\]/g, "");

  // Replace spaces with underscores
  safe = safe.replace(/\s+/g, "_");

  // Remove any character that's not alphanumeric, dot, hyphen, or underscore
  safe = safe.replace(/[^a-zA-Z0-9._\-]/g, "");

  // Ensure it's not empty
  if (!safe) {
    safe = `file_${Date.now()}`;
  }

  // Limit length
  if (safe.length > 200) {
    const ext = safe.substring(safe.lastIndexOf("."));
    safe = safe.substring(0, 200 - ext.length) + ext;
  }

  return safe;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Get MIME type from filename extension
 */
export function getMimeTypeFromExtension(filename: string): string | null {
  const extension = getFileExtension(filename);
  return (
    EXTENSION_TO_MIME_TYPE[extension as keyof typeof EXTENSION_TO_MIME_TYPE] ||
    null
  );
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validate file object (used in browser)
 */
export function validateFileObject(file: File): ValidationResult {
  return validateFile(file.name, file.type, file.size);
}
