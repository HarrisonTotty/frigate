import React from "react";
import { AlertSeverity } from "../alerts/types";
import { getSeverityClasses } from "../alerts/utils";

export interface AlertBannerProps {
  severity: AlertSeverity;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export function AlertBanner({
  severity,
  title,
  message,
  onClose,
  className = "",
}: AlertBannerProps) {
  const classes = getSeverityClasses(severity);

  return (
    <div
      className={className}
      style={{
        padding: "12px",
        backgroundColor: classes.bg,
        border: `1px solid ${classes.border}`,
        fontFamily: "var(--frigate-font-mono)",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <div
        style={{
          fontSize: "var(--frigate-font-small)",
          fontWeight: 600,
          color: classes.text,
          flexShrink: 0,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {classes.label}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            color: classes.text,
            fontSize: "var(--frigate-font-small)",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        {message && (
          <div
            style={{
              marginTop: "4px",
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-secondary)",
            }}
          >
            {message}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            fontSize: "var(--frigate-font-small)",
            color: "var(--frigate-text-muted)",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            flexShrink: 0,
            padding: "0 4px",
            transition: "color 50ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--frigate-text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--frigate-text-muted)")}
        >
          [X]
        </button>
      )}
    </div>
  );
}
