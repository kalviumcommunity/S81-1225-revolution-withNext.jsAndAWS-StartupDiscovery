import React from "react";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "neutral";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button text or content */
  label?: React.ReactNode;
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading state */
  isLoading?: boolean;
  /** Icon displayed before text */
  icon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Whether button is disabled */
  disabled?: boolean;
}

/**
 * Button Component
 * Reusable button with multiple variants, sizes, and states
 *
 * Props Contract:
 * - label: Text content to display
 * - variant: 'primary' | 'secondary' | 'success' | 'danger' | 'neutral'
 * - size: 'sm' | 'md' | 'lg'
 * - isLoading: Shows spinner and disables button
 * - icon: Optional icon element
 * - fullWidth: Stretch to container width
 * - disabled: Disable user interaction
 * - All standard HTML button attributes supported
 *
 * Accessibility:
 * - Semantic <button> element
 * - Supports aria-label for icon-only buttons
 * - Keyboard navigation (Enter, Space)
 * - Focus management and visible focus ring
 * - Disabled state properly communicated
 *
 * Usage:
 * <Button label="Click Me" variant="primary" onClick={handleClick} />
 * <Button label="Delete" variant="danger" size="lg" />
 * <Button icon={<IconComponent />} aria-label="Settings" variant="neutral" />
 */
export default function Button({
  label,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  fullWidth = false,
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) {
  // Variant styles
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 active:bg-blue-800",
    secondary:
      "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400 active:bg-slate-400",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-300 active:bg-green-800",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 active:bg-red-800",
    neutral:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300 active:bg-slate-300",
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm rounded",
    md: "px-4 py-2 text-base rounded-md",
    lg: "px-6 py-3 text-lg rounded-lg",
  };

  // Combined styles
  const baseStyles =
    "font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const widthStyle = fullWidth ? "w-full" : "";
  const stateStyle = isLoading ? "opacity-75 cursor-wait" : "";

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${stateStyle} ${className || ""}`}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
      )}

      {/* Icon */}
      {icon && !isLoading && <span className="flex-shrink-0">{icon}</span>}

      {/* Text content */}
      {label || children}
    </button>
  );
}
