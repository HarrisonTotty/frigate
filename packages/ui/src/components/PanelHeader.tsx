import React from "react";

/**
 * Props for PanelHeader.
 */
export type PanelHeaderProps = {
  /** Panel title rendered as the primary heading. */
  title: React.ReactNode;
  /** Optional subtitle rendered beneath the title. Mutually useful with
   *  `itemCount`; if `itemCount` is supplied it becomes the default subtitle. */
  subtitle?: React.ReactNode;
  /** Optional item count to render as "N ITEM(S)" in the subtitle slot.
   *  Ignored if `subtitle` is explicitly provided. */
  itemCount?: number;
  /** Singular/plural noun used with `itemCount`. Defaults to "ITEM". */
  itemLabel?: string;
  /** Optional action slot rendered on the right edge (e.g. buttons). */
  actions?: React.ReactNode;
  /** Optional CSS class merged onto the wrapper element. */
  className?: string;
};

/**
 * PanelHeader
 *
 * Standard header for panels. Shows a bold monospace title and an optional
 * subtitle (or derived item-count line). An optional `actions` slot renders
 * inline on the right edge for controls.
 */
export function PanelHeader({
  title,
  subtitle,
  itemCount,
  itemLabel = "ITEM",
  actions,
  className,
}: PanelHeaderProps): React.ReactElement {
  const derivedSubtitle =
    subtitle ??
    (itemCount !== undefined
      ? `${itemCount} ${itemLabel}${itemCount === 1 ? "" : "S"} LOADED`
      : undefined);

  return (
    <div
      className={className}
      style={{
        backgroundColor: "var(--frigate-bg-base)",
        padding: "var(--frigate-space-2)",
        borderBottom: "1px solid var(--frigate-border-base)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: actions ? "center" : "flex-start",
        gap: "var(--frigate-space-2)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: "var(--frigate-font-heading)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        {derivedSubtitle !== undefined && (
          <div
            style={{
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginTop: "var(--frigate-space-1)",
            }}
          >
            {derivedSubtitle}
          </div>
        )}
      </div>
      {actions}
    </div>
  );
}

export default PanelHeader;
