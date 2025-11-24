import React from "react";
import { ProgressBar } from "../components/ProgressBar";

const componentStyles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gap: "var(--frigate-space-3)",
    width: "100%",
  },
  item: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--frigate-space-1)",
    padding: "var(--frigate-space-2)",
    background: "var(--frigate-bg-base)",
    border: "1px solid var(--frigate-primary)",
    borderRadius: "var(--frigate-radius-none)",
  },
  label: {
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-tiny)",
    fontWeight: "bold",
    color: "var(--frigate-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  textValue: {
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-body)",
    fontWeight: "bold",
    color: "var(--frigate-text-primary)",
  },
  unit: {
    fontSize: "var(--frigate-text-small)",
    color: "var(--frigate-text-secondary)",
    marginLeft: "0.25em",
    fontWeight: "normal",
  },
  progressContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--frigate-space-1)",
  },
  progressText: {
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-small)",
    fontWeight: "bold",
    color: "var(--frigate-text-primary)",
    textAlign: "center",
  },
  gaugeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "var(--frigate-space-2)",
    height: 24,
  },
  gaugeBar: {
    flex: 1,
    height: "100%",
    background: "linear-gradient(90deg, var(--frigate-success), var(--frigate-warning), var(--frigate-danger))",
    border: "1px solid var(--frigate-primary)",
    borderRadius: "var(--frigate-radius-none)",
    transition: "width 0.15s ease",
    minWidth: "20%",
  },
  gaugeText: {
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-small)",
    fontWeight: "bold",
    color: "var(--frigate-text-primary)",
    whiteSpace: "nowrap",
    minWidth: 60,
    textAlign: "right",
  },
};

/**
 * Represents a single stat item in the grid.
 *
 * @interface StatItem
 * @property {string} label - Label for the stat (e.g., "POWER DRAW")
 * @property {string | number} value - The value to display
 * @property {string} [unit] - Optional unit suffix (e.g., "MW", "kg")
 * @property {'text' | 'progress' | 'gauge'} [type] - Type of display ('text' default)
 * @property {number} [max] - Maximum value for progress/gauge types
 * @property {number} [current] - Current value for progress/gauge types
 */
interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
  type?: "text" | "progress" | "gauge";
  max?: number;
  current?: number;
}

/**
 * Props for the StatsGrid component.
 *
 * @interface StatsGridProps
 * @property {StatItem[]} items - Array of stat items to display
 * @property {number} [columns=2] - Number of columns in the grid
 * @property {number} [gap] - Custom gap between items (uses theme spacing)
 */
interface StatsGridProps {
  items: StatItem[];
  columns?: number;
  gap?: number;
}

/**
 * StatsGrid - Reusable component for displaying pairs of stat labels and values.
 *
 * Renders a flexible grid of statistics with support for text values, progress bars,
 * and gauge displays. Uses theme tokens for consistent styling and supports responsive
 * column layouts. All typography uses monospace for technical aesthetic.
 *
 * @component
 * @example
 * ```tsx
 * <StatsGrid
 *   items={[
 *     { label: "TOTAL COST", value: 250, unit: "BP" },
 *     { label: "WEIGHT", value: 150, unit: "kg" },
 *     { label: "BUILD POINTS", value: 250, type: "progress", current: 180, max: 250 },
 *     { label: "POWER DRAW", value: 80, unit: "MW" }
 *   ]}
 *   columns={2}
 * />
 * ```
 */
export const StatsGrid: React.FC<StatsGridProps> = ({
  items,
  columns = 2,
  gap = 3,
}) => {
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `var(--frigate-space-${gap})`,
  };

  return (
    <div
      style={{ ...componentStyles.grid, ...gridStyle }}
      role="region"
      aria-label="Statistics grid"
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={componentStyles.item}
          data-testid={`stat-item-${item.label.replace(/\s+/g, "-").toLowerCase()}`}
        >
          {/* Label */}
          <div style={componentStyles.label}>{item.label}</div>

          {/* Content based on type */}
          {item.type === "progress" && item.max !== undefined ? (
            <div style={componentStyles.progressContainer}>
              <ProgressBar
                value={item.current ?? 0}
                max={item.max}
                variant={
                  (item.current ?? 0) / item.max > 0.9
                    ? "danger"
                    : (item.current ?? 0) / item.max > 0.7
                      ? "warning"
                      : "success"
                }
                aria-label={`${item.label}: ${item.current} of ${item.max}`}
              />
              <div
                style={componentStyles.progressText}
                aria-label={`${item.current}/${item.max}${item.unit ? ` ${item.unit}` : ""}`}
              >
                {item.current}/{item.max}
                {item.unit && <span style={componentStyles.unit}> {item.unit}</span>}
              </div>
            </div>
          ) : item.type === "gauge" && item.max !== undefined ? (
            <div
              style={componentStyles.gaugeContainer}
              aria-label={`${item.label}: ${item.current} of ${item.max}`}
            >
              <div
                style={{
                  ...componentStyles.gaugeBar,
                  width: `${((item.current ?? 0) / item.max) * 100}%`,
                }}
              />
              <div style={componentStyles.gaugeText}>
                {item.current}
                {item.unit && <span style={componentStyles.unit}>{item.unit}</span>}
              </div>
            </div>
          ) : (
            <div style={componentStyles.textValue}>
              {item.value}
              {item.unit && <span style={componentStyles.unit}> {item.unit}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export type { StatItem, StatsGridProps };
