/**
 * Storage Upload Component
 * Example React component for uploading files to cloud storage
 * Supports both AWS S3 and Azure Blob Storage
 *
 * Usage:
 * ```tsx
 * <StorageUploadComponent onUploadSuccess={(url) => console.log('Uploaded:', url)} />
 * ```
 */

"use client";

import React, { useState } from "react";

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface UploadComponentProps {
  onUploadSuccess?: (fileUrl: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in bytes
}

/**
 * Main upload component
 */
export function StorageUploadComponent({
  onUploadSuccess,
  onUploadError,
  acceptedTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}: UploadComponentProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check type
    if (!acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed: ${file.type}`,
      };
    }

    // Check size
    if (file.size > maxFileSize) {
      const maxMB = (maxFileSize / 1024 / 1024).toFixed(1);
      return {
        valid: false,
        error: `File too large (max ${maxMB}MB)`,
      };
    }

    return { valid: true };
  };

  /**
   * Upload file to cloud storage
   */
  const uploadFile = async (file: File) => {
    // Validate
    const validation = validateFile(file);
    if (!validation.valid) {
      const errorMsg = validation.error || "Invalid file";
      onUploadError?.(errorMsg);
      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === file.name
            ? { ...u, status: "error", error: errorMsg }
            : u
        )
      );
      return;
    }

    try {
      // Step 1: Get presigned URL from server
      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === file.name
            ? { ...u, status: "uploading", progress: 25 }
            : u
        )
      );

      const uploadUrlRes = await fetch(
        `/api/storage/upload-url?${new URLSearchParams({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size.toString(),
        })}`
      );

      if (!uploadUrlRes.ok) {
        throw new Error("Failed to generate upload URL");
      }

      const { uploadUrl, downloadUrl } = await uploadUrlRes.json();

      // Step 2: Upload file directly to cloud storage
      setUploads((prev) =>
        prev.map((u) => (u.fileName === file.name ? { ...u, progress: 50 } : u))
      );

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file to storage");
      }

      // Step 3: Success
      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === file.name
            ? { ...u, status: "success", progress: 100 }
            : u
        )
      );

      onUploadSuccess?.(downloadUrl, file.name);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed";
      onUploadError?.(errorMsg);
      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === file.name
            ? { ...u, status: "error", error: errorMsg }
            : u
        )
      );
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      // Add to uploads list
      setUploads((prev) => [
        ...prev,
        {
          fileName: file.name,
          progress: 0,
          status: "pending",
        },
      ]);

      // Upload file
      await uploadFile(file);
    }
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  /**
   * Clear completed uploads
   */
  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status === "uploading"));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <div className="mb-4">
          <svg
            className="w-12 h-12 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Files</h3>

        <p className="text-gray-600 mb-4">
          Drag and drop files here or click to select
        </p>

        <input
          type="file"
          multiple
          onChange={handleInputChange}
          accept={acceptedTypes.join(",")}
          className="hidden"
          id="file-input"
        />

        <label
          htmlFor="file-input"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition"
        >
          Choose Files
        </label>

        <p className="text-sm text-gray-500 mt-4">
          Accepted formats: {acceptedTypes.join(", ")}
        </p>
        <p className="text-sm text-gray-500">
          Maximum file size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB
        </p>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Uploads</h4>
            {uploads.some(
              (u) => u.status === "success" || u.status === "error"
            ) && (
              <button
                onClick={clearCompleted}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Completed
              </button>
            )}
          </div>

          <div className="space-y-4">
            {uploads.map((upload) => (
              <UploadItem key={upload.fileName} upload={upload} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual upload item component
 */
function UploadItem({ upload }: { upload: UploadProgress }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{upload.fileName}</p>
          {upload.error && (
            <p className="text-sm text-red-600">{upload.error}</p>
          )}
        </div>

        <StatusBadge status={upload.status} />
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            upload.status === "success"
              ? "bg-green-500"
              : upload.status === "error"
                ? "bg-red-500"
                : "bg-blue-500"
          }`}
          style={{ width: `${upload.progress}%` }}
        />
      </div>

      <p className="text-sm text-gray-600 mt-2">{upload.progress}%</p>
    </div>
  );
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: UploadProgress["status"] }) {
  const statusStyles = {
    pending: "bg-gray-100 text-gray-800",
    uploading: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    pending: "Pending",
    uploading: "Uploading",
    success: "Completed",
    error: "Failed",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        statusStyles[status]
      }`}
    >
      {statusLabels[status]}
    </span>
  );
}

/**
 * Simple file input example
 */
export function SimpleFileUpload({
  onSuccess,
  onError,
}: {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Get presigned URL
      const res = await fetch(
        `/api/storage/upload-url?${new URLSearchParams({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size.toString(),
        })}`
      );

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, downloadUrl } = await res.json();

      // Upload to storage
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      onSuccess?.(downloadUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      onError?.(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        onChange={handleUpload}
        disabled={isUploading}
        className="text-sm"
      />
      {isUploading && (
        <span className="text-sm text-gray-600">Uploading...</span>
      )}
    </div>
  );
}
