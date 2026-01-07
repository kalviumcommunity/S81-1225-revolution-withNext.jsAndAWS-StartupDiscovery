import React from "react";

interface CardProps {
  /** Card title */
  title?: React.ReactNode;
  /** Card description text */
  description?: React.ReactNode;
  /** Main card content */
  children: React.ReactNode;
  /** Footer content (e.g., buttons) */
  footer?: React.ReactNode;
  /** Adds shadow and padding */
  variant?: "default" | "elevated" | "outlined";
  /** Card width class */
  className?: string;
  /** Click handler for clickable cards */
  onClick?: () => void;
  /** Semantic role if clickable */
  role?: string;
  /** ARIA label for accessibility */
  "aria-label"?: string;
}

/**
 * Card Component
 * Container for grouping related content with consistent styling
 *
 * Props Contract:
 * - title: Optional card heading
 * - description: Optional subtitle or description
 * - children: Main content area
 * - footer: Optional footer section for actions
 * - variant: 'default' | 'elevated' | 'outlined'
 * - className: Additional Tailwind classes
 * - onClick: Makes card clickable
 * - role: Semantic role for clickable cards
 * - aria-label: Accessibility label
 *
 * Accessibility:
 * - Semantic <article> or <div> based on content
 * - Proper heading hierarchy
 * - Keyboard accessible if clickable
 * - Focus management
 *
 * Usage:
 * <Card title="User Profile" description="Jane Doe">
 *   <p>User details here...</p>
 * </Card>
 *
 * <Card variant="elevated" onClick={handleClick}>
 *   Clickable card content
 * </Card>
 */
export default function Card({
  title,
  description,
  children,
  footer,
  variant = "default",
  className = "",
  onClick,
  role,
  "aria-label": ariaLabel,
}: CardProps) {
  // Variant styles
  const variantStyles: Record<string, string> = {
    default: "bg-white border border-slate-200",
    elevated: "bg-white shadow-lg",
    outlined: "bg-white border-2 border-blue-500",
  };

  // Base styles
  const baseStyles = "rounded-lg overflow-hidden";
  const interactiveStyles = onClick
    ? "cursor-pointer hover:shadow-lg transition-shadow"
    : "";

  // Determine element type
  const Element = title ? "article" : "div";

  return (
    <Element
      className={`${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Header section */}
      {(title || description) && (
        <div className="px-6 py-4 border-b border-slate-200">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Content section */}
      <div className="px-6 py-4">{children}</div>

      {/* Footer section */}
      {footer && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-2 justify-end">
          {footer}
        </div>
      )}
    </Element>
  );
}
