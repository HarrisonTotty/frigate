import React from "react";
import { ProgressBar } from "./ProgressBar";

/**
 * Props for ConstraintBar.
 */
export type ConstraintBarProps = {
  /** Current value consumed against the budget. */
  current: number;
  /** Budget/capacity the value is measured against. */
  max: number;
  /** Percentage (0-100) at which the bar renders in the warning color.
   *  Defaults to 90. */
  warningThreshold?: number;
  /** Percentage (0-100) at which the bar renders in the danger color and
   *  shows the over-limit indicator when the current value exceeds `max`.
   *  Defaults to 100. */
  dangerThreshold?: number;
  /** Optional label shown above the bar. */
  label?: React.ReactNode;
  /** Optional unit suffix appended to the numeric readout (e.g. " CR"). */
  unit?: string;
  /** Optional formatter for the numeric readout (e.g. thousand separators). */
  formatValue?: (value: number) => string;
  /** Show the ` [!]` indicator next to the readout when over-limit. */
  showOverLimit?: boolean;
  /** Optional CSS class merged onto the wrapper element. */
  className?: string;
};

/**
 * ConstraintBar
 *
 * Displays a labeled progress bar for a consumable budget (weight, credits,
 * build points, etc.). Bar color escalates through warning and danger
 * thresholds based on the percent consumed. When `current` exceeds `max`,
 * the readout renders in danger color; `showOverLimit` additionally appends
 * a ` [!]` indicator.
 */
export function ConstraintBar({
  current,
  max,
  warningThreshold = 90,
  dangerThreshold = 100,
  label,
  unit,
  formatValue,
  showOverLimit = false,
  className,
}: ConstraintBarProps): React.ReactElement {
  const percent = max > 0 ? (current / max) * 100 : 0;
  const exceeded = current > max && max > 0;
  const variant =
    percent >= dangerThreshold || exceeded
      ? "danger"
      : percent >= warningThreshold
        ? "warning"
        : "primary";
  const fmt = formatValue ?? ((v: number) => String(v));

  return (
    <div className={className} style={{ marginBottom: "var(--frigate-space-2)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2px",
        }}
      >
        {label !== undefined && (
          <span
            style={{
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </span>
        )}
        <span
          style={{
            fontSize: "var(--frigate-font-tiny)",
            color: exceeded ? "var(--frigate-danger)" : "var(--frigate-text-muted)",
            fontWeight: exceeded ? 700 : 400,
          }}
        >
          {fmt(current)}/{max > 0 ? fmt(max) : "—"}
          {unit}
          {exceeded && showOverLimit && " [!]"}
        </span>
      </div>
      <ProgressBar
        value={Math.min(current, max)}
        max={max > 0 ? max : 1}
        variant={variant}
        showLabel={false}
        blocks={15}
      />
    </div>
  );
}

export default ConstraintBar;
