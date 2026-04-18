import React from "react";
import clsx from "clsx";

/**
 * Button Component
 *
 * TUI-inspired button with ASCII borders and technical styling.
 * Follows hard sci-fi aesthetic with bracketed labels and keyboard shortcuts.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Keyboard shortcut to display */
  shortcut?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  shortcut,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    fontFamily: "var(--frigate-font-mono)",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    transition: "all 50ms ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--frigate-space-2)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    width: fullWidth ? "100%" : undefined,
    opacity: disabled || loading ? 0.5 : 1,
    boxShadow: "none",
    borderRadius: 0,
    position: "relative",
  };

  const sizeStyles: React.CSSProperties = {
    sm: {
      padding: "var(--frigate-space-2) var(--frigate-space-3)",
      fontSize: "var(--frigate-font-small)",
    },
    md: {
      padding: "var(--frigate-space-3) var(--frigate-space-4)",
      fontSize: "var(--frigate-font-body)",
    },
    lg: {
      padding: "var(--frigate-space-4) var(--frigate-space-6)",
      fontSize: "var(--frigate-font-heading)",
    },
  }[size];

  const variantStyles: React.CSSProperties = {
    primary: {
      backgroundColor: "var(--frigate-primary)",
      color: "var(--frigate-text-primary)",
      border: "2px solid var(--frigate-primary)",
    },
    secondary: {
      backgroundColor: "var(--frigate-bg-surface)",
      color: "var(--frigate-text-primary)",
      border: "1px solid var(--frigate-border-light)",
    },
    danger: {
      backgroundColor: "var(--frigate-danger)",
      color: "var(--frigate-text-primary)",
      border: "2px solid var(--frigate-danger)",
    },
    success: {
      backgroundColor: "var(--frigate-success)",
      color: "var(--frigate-text-primary)",
      border: "2px solid var(--frigate-success)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--frigate-text-secondary)",
      border: "none",
    },
  }[variant];

  const hoverStyles =
    !disabled && !loading
      ? {
          primary: {
            backgroundColor: "var(--frigate-primary-hover)",
            borderColor: "var(--frigate-primary-hover)",
          },
          secondary: {
            borderColor: "var(--frigate-text-primary)",
            color: "var(--frigate-text-primary)",
            backgroundColor: "var(--frigate-bg-raised)",
          },
          danger: {
            backgroundColor: "var(--frigate-danger-hover)",
            borderColor: "var(--frigate-danger-hover)",
          },
          success: {
            backgroundColor: "var(--frigate-success-hover)",
            borderColor: "var(--frigate-success-hover)",
          },
          ghost: { color: "var(--frigate-text-primary)" },
        }[variant]
      : {};

  // Format children with brackets if not already present
  const formattedChildren =
    typeof children === "string" && !children.startsWith("[") ? `[${children}]` : children;

  return (
    <button
      className={clsx("frigate-button", className)}
      style={{ ...baseStyles, ...sizeStyles, ...variantStyles }}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, variantStyles);
        }
      }}
      {...props}
    >
      {loading ? (
        <span style={{ opacity: 0.7 }}>[...]</span>
      ) : (
        <>
          {formattedChildren}
          {shortcut && (
            <span
              style={{
                marginLeft: "var(--frigate-space-2)",
                fontSize: "var(--frigate-font-tiny)",
                opacity: 0.6,
              }}
            >
              {shortcut}
            </span>
          )}
        </>
      )}
    </button>
  );
}
