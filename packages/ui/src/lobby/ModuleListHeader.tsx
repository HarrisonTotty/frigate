import React from "react";

const componentStyles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    background: "var(--frigate-bg-surface)",
    borderRadius: "var(--frigate-radius-none)",
    borderBottom: "2px solid var(--frigate-primary)",
  },
  top: {
    height: 1,
    background: "var(--frigate-primary)",
    borderTop: "1px solid var(--frigate-primary)",
    borderBottom: "1px solid var(--frigate-primary)",
  },
  content: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "var(--frigate-space-2)",
    gap: "var(--frigate-space-2)",
  },
  titleSection: {
    display: "flex",
    alignItems: "center",
    gap: "var(--frigate-space-1)",
  },
  title: {
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-heading)",
    fontWeight: "bold",
    color: "var(--frigate-text-primary)",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
  },
  count: {
    display: "flex",
    gap: "var(--frigate-space-1)",
    alignItems: "center",
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-body)",
    color: "var(--frigate-text-primary)",
  },
  countAtMax: {
    color: "var(--frigate-warning)",
  },
  countLabel: {
    fontSize: "var(--frigate-text-small)",
    color: "var(--frigate-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  countValue: {
    fontWeight: "bold",
    fontSize: "var(--frigate-text-body)",
  },
  maxWarning: {
    padding: "var(--frigate-space-1) var(--frigate-space-2)",
    background: "rgba(200, 84, 80, 0.1)",
    color: "var(--frigate-danger)",
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-tiny)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderTop: "1px dashed var(--frigate-danger)",
    textAlign: "center",
  },
};

/**
 * Props for the ModuleListHeader component.
 *
 * @interface ModuleListHeaderProps
 * @property {number} count - Current number of modules installed
 * @property {number} max - Maximum number of modules allowed
 * @property {'online' | 'warning' | 'critical'} [status='online'] - Status indicator
 */
interface ModuleListHeaderProps {
  count: number;
  max: number;
  status?: "online" | "warning" | "critical";
}

/**
 * ModuleListHeader - Header component for the installed modules list.
 *
 * Displays the "INSTALLED MODULES" title with a module count display
 * "COUNT: X / MAX", ASCII top border, and optional status indicator. Supports
 * keyboard navigation and accessibility.
 *
 * @component
 * @example
 * ```tsx
 * <ModuleListHeader count={8} max={12} status="online" />
 * ```
 */
export const ModuleListHeader: React.FC<ModuleListHeaderProps> = ({
  count,
  max,
  status = "online",
}) => {
  const statusVariant =
    status === "critical"
      ? "danger"
      : status === "warning"
        ? "warning"
        : "success";

  const statusLabel =
    status === "critical"
      ? "CRITICAL"
      : status === "warning"
        ? "WARNING"
        : "ONLINE";

  const isAtMax = count >= max;

  return (
    <div
      style={componentStyles.header}
      role="region"
      aria-label="Installed modules header"
    >
      <div style={componentStyles.top} />

      <div style={componentStyles.content}>
        <div style={componentStyles.titleSection}>
          <h3 style={componentStyles.title}>INSTALLED MODULES</h3>
        </div>

        <div
          style={{
            ...componentStyles.count,
            ...(isAtMax ? componentStyles.countAtMax : {}),
          }}
          aria-label={`Module count: ${count} of ${max}`}
          role="status"
        >
          <span style={componentStyles.countLabel}>COUNT:</span>
          <span style={componentStyles.countValue}>
            {count}/{max}
          </span>
        </div>
      </div>

      {isAtMax && (
        <div style={componentStyles.maxWarning} role="alert">
          ⚠ MAXIMUM MODULES INSTALLED
        </div>
      )}
    </div>
  );
};

export type { ModuleListHeaderProps };
