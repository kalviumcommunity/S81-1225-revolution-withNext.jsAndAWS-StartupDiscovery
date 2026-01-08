/**
 * Storage module exports
 * Public API for file validation and upload utilities
 */

// File validation exports
export {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
  EXTENSION_TO_MIME_TYPE,
  validateFileType,
  validateFileSize,
  validateFilename,
  validateExtensionMimeMatch,
  validateFile,
  validateFileObject,
  generateSafeFilename,
  getFileExtension,
  getMimeTypeFromExtension,
  formatFileSize,
  type ValidationResult,
} from "./fileValidation";

// Upload utilities exports
export {
  generateS3PresignedUrl,
  generateAzureSasUrl,
  generatePresignedUrl,
  getS3ObjectMetadata,
  getAzureBlobMetadata,
  deleteS3Object,
  deleteAzureBlob,
  deleteStorageObject,
  generateDownloadUrl,
  type StorageProvider,
  type PresignedUrlResponse,
} from "./uploadUtils";

// Storage client exports
export {
  loadStorageConfig,
  validateStorageConfig,
  initializeStorageConfig,
  getProviderDisplayName,
  getStorageInfo,
  type StorageConfig,
} from "./storageClient";
