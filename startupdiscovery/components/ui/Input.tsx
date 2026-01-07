import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below input */
  helperText?: string;
  /** Show loading state */
  isLoading?: boolean;
  /** Icon displayed in input */
  icon?: React.ReactNode;
  /** Required field indicator */
  required?: boolean;
}

/**
 * Input Component
 * Text input with labels, error handling, and accessibility features
 *
 * Props Contract:
 * - label: Display label above input
 * - error: Error message shown in red
 * - helperText: Info text shown below input
 * - isLoading: Shows loading spinner
 * - icon: Optional icon element
 * - required: Marks field as required
 * - type: HTML input type
 * - All standard HTML input attributes supported
 *
 * Accessibility:
 * - Associated label via htmlFor/id
 * - ARIA attributes for error states
 * - Focus management with visible focus ring
 * - Error messaging properly associated
 * - Required field properly indicated
 *
 * Usage:
 * <Input
 *   label="Email Address"
 *   type="email"
 *   placeholder="your@email.com"
 *   required
 * />
 *
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password is required"
 * />
 */
export default function Input({
  label,
  error,
  helperText,
  isLoading = false,
  icon,
  required = false,
  disabled = false,
  id: providedId,
  className,
  type = "text",
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = providedId || generatedId;

  const hasError = !!error;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-2 ${
            hasError ? "text-red-600" : "text-slate-700"
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Input field */}
        <input
          id={inputId}
          type={type}
          disabled={disabled || isLoading}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={`
            w-full px-4 py-2 rounded-md border-2 transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:bg-slate-100 disabled:cursor-not-allowed
            ${
              hasError
                ? "border-red-500 focus:border-red-500 focus:ring-red-300"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
            }
            ${icon ? "pl-10" : ""}
            ${isLoading ? "opacity-75" : ""}
            ${className || ""}
          `}
          {...props}
        />

        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-sm text-slate-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
