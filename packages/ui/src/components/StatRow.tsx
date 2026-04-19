import React from "react";

/**
 * Props for StatRow.
 */
export type StatRowProps = {
  /** Left-aligned field name. */
  label: React.ReactNode;
  /** Right-aligned value. Accepts a `ReactNode` so callers can wrap it to
   *  signal warning/error states (e.g. red coloring). */
  value: React.ReactNode;
  /** Optional unit suffix appended after the value (e.g. " CR", " HP"). */
  unit?: string;
  /** Optional CSS class name merged onto the row container. */
  className?: string;
};

/**
 * StatRow
 *
 * Renders a labeled statistic as a label/value pair in a flex row.
 * Used throughout panels to present key/value metrics consistently.
 *
 * The value span uses `color: inherit` so a wrapping element passed via
 * `value` can control the displayed color without extra props.
 */
export function StatRow({ label, value, unit, className }: StatRowProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--frigate-space-1) 0",
      }}
    >
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
      <span
        style={{
          fontSize: "var(--frigate-font-small)",
          color: "inherit",
          fontWeight: 600,
          fontFamily: "var(--frigate-font-mono)",
        }}
      >
        {value}
        {unit}
      </span>
    </div>
  );
}

export default StatRow;
