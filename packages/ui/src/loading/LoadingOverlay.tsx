/**
 * Full-screen loading overlay with text indicator
 *
 * @example
 * ```tsx
 * <LoadingOverlay visible={isLoading} message="COMPILING SHIP" />
 * ```
 */
import React from "react";
import { LoadingText } from "./LoadingText";

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Loading message */
  message?: string;
  /** Whether to show with backdrop */
  backdrop?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function LoadingOverlay({
  visible,
  message = "PROCESSING",
  backdrop = true,
  className = "",
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: backdrop ? "var(--frigate-bg-overlay)" : "transparent",
        zIndex: "var(--frigate-z-overlay)",
        pointerEvents: "all",
      }}
    >
      <div
        style={{
          padding: "24px 32px",
          backgroundColor: "var(--frigate-bg-surface)",
          border: "1px solid var(--frigate-border-base)",
          fontFamily: "var(--frigate-font-mono)",
        }}
      >
        <LoadingText message={message} size="large" />
      </div>
    </div>
  );
}
