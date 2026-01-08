"use client";

/**
 * Safe UI Components for Rendering User-Generated Content
 * These components ensure proper sanitization of data before display
 */

import React from "react";
import {
  SafeHtml,
  SafeText,
  sanitizeText,
  sanitizeHtml,
} from "@/lib/security/clientSanitizer";

/**
 * Component for displaying safe user-generated content
 * Automatically sanitizes and encodes output
 */
export const SafeComment: React.FC<{
  content: string;
  author?: string;
  createdAt?: string;
}> = ({ content, author, createdAt }) => {
  return (
    <div className="comment-container border-l-4 border-blue-500 pl-4 py-2">
      {author && (
        <p className="font-semibold text-sm text-gray-700">
          <SafeText>{author}</SafeText>
        </p>
      )}
      <div className="comment-content text-gray-800 my-2">
        <SafeHtml html={content} />
      </div>
      {createdAt && (
        <p className="text-xs text-gray-500">
          <SafeText>{createdAt}</SafeText>
        </p>
      )}
    </div>
  );
};

/**
 * Component for displaying safe startup information
 */
export const SafeStartupCard: React.FC<{
  title: string;
  tagline: string;
  description: string;
  industry?: string;
  website?: string;
}> = ({ title, tagline, description, industry, website }) => {
  return (
    <div className="startup-card border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold text-gray-900">
        <SafeText>{title}</SafeText>
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        <SafeText>{tagline}</SafeText>
      </p>
      <div className="description mt-3 text-gray-700">
        <SafeHtml html={description} />
      </div>
      {industry && (
        <p className="text-xs text-gray-500 mt-2">
          Industry: <SafeText>{industry}</SafeText>
        </p>
      )}
      {website && (
        <p className="text-xs text-blue-600 mt-1">
          <SafeText>{website}</SafeText>
        </p>
      )}
    </div>
  );
};

/**
 * Component for safe user profile display
 */
export const SafeUserProfile: React.FC<{
  name: string;
  email: string;
  role?: string;
}> = ({ name, email, role }) => {
  return (
    <div className="user-profile">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <p className="font-semibold text-gray-900">
            <SafeText>{name}</SafeText>
          </p>
          <p className="text-sm text-gray-600">
            <SafeText>{email}</SafeText>
          </p>
        </div>
      </div>
      {role && (
        <p className="text-xs text-gray-500 mt-2">
          Role:{" "}
          <span className="font-medium">
            <SafeText>{role}</SafeText>
          </span>
        </p>
      )}
    </div>
  );
};

/**
 * Component for safe form input with validation feedback
 */
export const SafeFormInput: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
  required?: boolean;
  sanitize?: boolean;
}> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  maxLength = 500,
  required = false,
  sanitize = true,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const finalValue = sanitize ? sanitizeText(newValue) : newValue;
    onChange(finalValue);
  };

  return (
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700">
        <SafeText>{label}</SafeText>
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        className={`w-full mt-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">
          <SafeText>{error}</SafeText>
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        {value.length} / {maxLength}
      </p>
    </div>
  );
};

/**
 * Component for safe rich text area
 */
export const SafeTextArea: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
  required?: boolean;
  rows?: number;
}> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  maxLength = 1000,
  required = false,
  rows = 4,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // For textarea, we sanitize HTML to prevent injection
    onChange(sanitizeHtml(newValue));
  };

  return (
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700">
        <SafeText>{label}</SafeText>
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        rows={rows}
        className={`w-full mt-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">
          <SafeText>{error}</SafeText>
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        {value.length} / {maxLength} characters
      </p>
    </div>
  );
};

/**
 * Component for displaying security warnings
 */
export const SecurityWarning: React.FC<{
  title: string;
  message: string;
  type?: "danger" | "warning" | "info";
}> = ({ title, message, type = "warning" }) => {
  const bgColor = {
    danger: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  }[type];

  const textColor = {
    danger: "text-red-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  }[type];

  return (
    <div className={`border-l-4 p-4 rounded ${bgColor}`}>
      <h4 className={`font-semibold ${textColor}`}>
        <SafeText>{title}</SafeText>
      </h4>
      <p className={`text-sm mt-1 ${textColor}`}>
        <SafeText>{message}</SafeText>
      </p>
    </div>
  );
};
