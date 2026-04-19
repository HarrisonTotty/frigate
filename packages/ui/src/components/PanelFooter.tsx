import React from "react";

/**
 * Props for PanelFooter.
 */
export type PanelFooterProps = {
  /** Optional number of warnings. When supplied and > 0 the footer renders
   *  a `[STATUS: WARNING]` / `[N ISSUES]` pair. When `0`, renders
   *  `[STATUS: NOMINAL]`. */
  warningCount?: number;
  /** Optional arbitrary children to render in the footer instead of the
   *  warning-status text. If both are provided, `children` takes precedence. */
  children?: React.ReactNode;
  /** Optional CSS class merged onto the wrapper element. */
  className?: string;
};

/**
 * PanelFooter
 *
 * Standard footer for panels. Has two modes:
 *   - When `children` is provided, renders them as-is (free-form content).
 *   - Otherwise, when `warningCount` is provided, renders a status indicator:
 *     NOMINAL (0) or WARNING with an issue count.
 *   - With neither, renders an empty styled bar.
 */
export function PanelFooter({
  warningCount,
  children,
  className,
}: PanelFooterProps): React.ReactElement {
  const hasWarnings = warningCount !== undefined && warningCount > 0;

  return (
    <div
      className={className}
      style={{
        fontSize: "var(--frigate-font-tiny)",
        color: hasWarnings ? "var(--frigate-danger)" : "var(--frigate-text-muted)",
        backgroundColor: "var(--frigate-bg-base)",
        padding: "var(--frigate-space-1) var(--frigate-space-2)",
        borderTop: "1px solid var(--frigate-border-base)",
        letterSpacing: "0.05em",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {children !== undefined ? (
        children
      ) : warningCount !== undefined ? (
        <>
          <span>[STATUS: {hasWarnings ? "WARNING" : "NOMINAL"}]</span>
          {hasWarnings && (
            <span>
              [{warningCount} ISSUE{warningCount === 1 ? "" : "S"}]
            </span>
          )}
        </>
      ) : null}
    </div>
  );
}

export default PanelFooter;
