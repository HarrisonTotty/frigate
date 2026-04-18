/**
 * Bonus Item Component - Phase 4.12.3
 *
 * Displays individual bonus with formatted value, description tooltip,
 * and optional percentage bar for significant bonuses.
 */

import React from "react";
import type { ShipClassBonus } from "../types/shipClass";
import { Tooltip } from "../tooltip";

export interface BonusItemProps {
  /** Bonus data from API */
  bonus: ShipClassBonus;
  /** Whether to show percentage bar for this bonus */
  showBar?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Bonus Item
 *
 * Displays a single bonus with name, formatted value, and tooltip.
 * Optionally shows a visual bar for percentage-based bonuses.
 * Uses green for positive values, red for negative values.
 */
export function BonusItem({
  bonus,
  showBar = false,
  className = "",
}: BonusItemProps): React.ReactElement {
  // Determine if bonus is positive or negative
  const isPositive = bonus.value > 0;
  const isNegative = bonus.value < 0;

  // Color based on value
  const valueColor = isPositive
    ? "var(--frigate-success)"
    : isNegative
      ? "var(--frigate-danger)"
      : "var(--frigate-text-primary)";

  // Calculate bar width for percentage bonuses (cap at 100%)
  const barWidth =
    showBar && bonus.formatted_value.includes("%") ? Math.min(Math.abs(bonus.value), 100) : 0;

  // Build tooltip content
  const tooltipContent = (
    <div style={{ maxWidth: "250px" }}>
      <div
        style={{
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-small)",
          fontWeight: 600,
          marginBottom: "var(--frigate-space-1)",
          color: "var(--frigate-text-primary)",
        }}
      >
        {bonus.name}
      </div>
      <div
        style={{
          fontSize: "var(--frigate-font-small)",
          color: "var(--frigate-text-secondary)",
          marginBottom: "var(--frigate-space-2)",
        }}
      >
        {bonus.description}
      </div>
      {bonus.applies_to.length > 0 && (
        <div
          style={{
            fontSize: "var(--frigate-font-tiny)",
            color: "var(--frigate-text-muted)",
            fontStyle: "italic",
          }}
        >
          Applies to: {bonus.applies_to.join(", ")}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div
        className={className}
        style={{
          padding: "var(--frigate-space-2)",
          backgroundColor: "var(--frigate-bg-base)",
          border: "1px solid var(--frigate-border-base)",
          cursor: "help",
          transition: "border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--frigate-border-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--frigate-border-base)";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: showBar && barWidth > 0 ? "var(--frigate-space-1)" : "0",
          }}
        >
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-text-secondary)",
            }}
          >
            {bonus.name}
          </div>
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              fontWeight: 600,
              color: valueColor,
            }}
          >
            {bonus.formatted_value}
          </div>
        </div>

        {showBar && barWidth > 0 && (
          <div
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "var(--frigate-bg-surface)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${barWidth}%`,
                backgroundColor: valueColor,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        )}
      </div>
    </Tooltip>
  );
}
