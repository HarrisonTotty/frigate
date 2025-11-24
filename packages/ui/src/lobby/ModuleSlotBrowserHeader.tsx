import React from "react";
import { ProgressBar } from "../components/ProgressBar";

const componentStyles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--frigate-space-2)",
    padding: "var(--frigate-space-2)",
    background: "var(--frigate-bg-surface)",
    borderBottom: "2px solid var(--frigate-primary)",
    borderRadius: "var(--frigate-radius-none)",
  },
  title: {
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-heading)",
    fontWeight: "bold",
    color: "var(--frigate-text-primary)",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  bpSection: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--frigate-space-2)",
  },
  bpDisplay: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "var(--frigate-font-mono)",
  },
  bpLabel: {
    fontSize: "var(--frigate-text-small)",
    color: "var(--frigate-text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  bpValue: {
    fontSize: "var(--frigate-text-body)",
    fontWeight: "bold",
    color: "var(--frigate-text-primary)",
  },
  progressContainer: {
    display: "flex",
    gap: "var(--frigate-space-1)",
    alignItems: "center",
  },
  percentageDisplay: {
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-small)",
    color: "var(--frigate-text-secondary)",
    minWidth: 40,
    textAlign: "right",
  },
  hints: {
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-tiny)",
    color: "var(--frigate-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderTop: "1px dashed var(--frigate-primary)",
    paddingTop: "var(--frigate-space-1)",
    marginTop: "var(--frigate-space-1)",
  },
};

/**
 * Props for the ModuleSlotBrowserHeader component.
 *
 * @interface ModuleSlotBrowserHeaderProps
 * @property {number} buildPointsUsed - Current build points used
 * @property {number} buildPointsMax - Maximum build points available
 */
interface ModuleSlotBrowserHeaderProps {
  buildPointsUsed: number;
  buildPointsMax: number;
}

/**
 * ModuleSlotBrowserHeader - Header component for the module slot browser.
 *
 * Displays the "MODULE SLOT BROWSER" title with a "BUILD POINTS: XX/YY" display
 * and progress bar showing BP usage with dynamic color coding (green 0-70%, yellow
 * 71-89%, red 90%+). Includes keyboard navigation hints in footer.
 *
 * @component
 * @example
 * ```tsx
 * <ModuleSlotBrowserHeader buildPointsUsed={180} buildPointsMax={250} />
 * ```
 */
export const ModuleSlotBrowserHeader: React.FC<
  ModuleSlotBrowserHeaderProps
> = ({ buildPointsUsed, buildPointsMax }) => {
  const usagePercent = (buildPointsUsed / buildPointsMax) * 100;
  let variant: "success" | "warning" | "danger" = "success";

  if (usagePercent >= 90) {
    variant = "danger";
  } else if (usagePercent >= 71) {
    variant = "warning";
  }

  return (
    <div style={componentStyles.header} role="region" aria-label="Module slot browser header">
      <h2 style={componentStyles.title}>MODULE SLOT BROWSER</h2>

      <div style={componentStyles.bpSection}>
        <div style={componentStyles.bpDisplay}>
          <span style={componentStyles.bpLabel}>BUILD POINTS:</span>
          <span
            style={{
              ...componentStyles.bpValue,
              color: variant === "danger" ? "var(--frigate-danger)" : variant === "warning" ? "var(--frigate-warning)" : "var(--frigate-success)",
            }}
            aria-label={`Build points: ${buildPointsUsed} of ${buildPointsMax}`}
          >
            {buildPointsUsed}/{buildPointsMax}
          </span>
        </div>

        <div style={{ ...componentStyles.progressContainer, flex: 1 }}>
          <ProgressBar
            value={buildPointsUsed}
            max={buildPointsMax}
            variant={variant}
            aria-label={`Build points usage: ${usagePercent.toFixed(1)}%`}
          />
          <div style={componentStyles.percentageDisplay}>
            {usagePercent.toFixed(1)}%
          </div>
        </div>
      </div>

      <div style={componentStyles.hints} role="status">
        <span style={{ display: "block" }}>
          [↑/↓] Navigate • [ENTER] Add • [ESC] Close
        </span>
      </div>
    </div>
  );
};

export type { ModuleSlotBrowserHeaderProps };
