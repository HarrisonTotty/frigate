/**
 * Text-based loading indicator (no spinner)
 *
 * Displays "LOADING..." with animated dots following TUI aesthetic.
 *
 * @example
 * ```tsx
 * <LoadingText message="INITIALIZING" />
 * <LoadingText message="PROCESSING DATA" size="small" />
 * ```
 */
import React from "react";

export interface LoadingTextProps {
  /** Loading message to display */
  message?: string;
  /** Size variant */
  size?: "small" | "medium" | "large";
  /** Additional CSS classes */
  className?: string;
}

export function LoadingText({
  message = "LOADING",
  size = "medium",
  className = "",
}: LoadingTextProps) {
  const fontSize =
    size === "small"
      ? "var(--frigate-font-tiny)"
      : size === "large"
        ? "var(--frigate-font-body)"
        : "var(--frigate-font-small)";

  return (
    <div
      className={className}
      style={{
        fontFamily: "var(--frigate-font-mono)",
        fontSize,
        color: "var(--frigate-text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      <span className="frigate-loading">{message}</span>
    </div>
  );
}
