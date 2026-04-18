/**
 * Bonus Category Section Component - Phase 4.12.3
 *
 * Collapsible section displaying bonuses within a specific category.
 * Shows category header with icon and description, with expandable bonus list.
 */

import React, { useState } from "react";
import type { ShipClassBonus, BonusCategory } from "../types/shipClass";
import { BonusItem } from "./BonusItem";

export interface BonusCategorySectionProps {
  /** Category identifier */
  category: BonusCategory;
  /** Bonuses in this category */
  bonuses: ShipClassBonus[];
  /** Whether section starts expanded */
  defaultExpanded?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Category metadata for display
 */
const CATEGORY_INFO: Record<
  BonusCategory,
  { name: string; description: string; color: string; icon: string }
> = {
  combat: {
    name: "COMBAT",
    description: "Offensive capabilities and weapon effectiveness",
    color: "var(--frigate-danger)",
    icon: "C",
  },
  defense: {
    name: "DEFENSE",
    description: "Hull integrity, shields, and damage mitigation",
    color: "var(--frigate-primary)",
    icon: "D",
  },
  mobility: {
    name: "MOBILITY",
    description: "Speed, acceleration, and maneuverability",
    color: "var(--frigate-accent)",
    icon: "M",
  },
  utility: {
    name: "UTILITY",
    description: "Sensors, cargo, and operational capabilities",
    color: "var(--frigate-success)",
    icon: "U",
  },
  efficiency: {
    name: "EFFICIENCY",
    description: "Power consumption, fuel usage, and resource optimization",
    color: "var(--frigate-warning)",
    icon: "E",
  },
};

/**
 * Bonus Category Section
 *
 * Collapsible section for displaying bonuses grouped by category.
 * Shows category header with icon, name, and description.
 * Displays bonuses with bars for significant percentage bonuses.
 */
export function BonusCategorySection({
  category,
  bonuses,
  defaultExpanded = true,
  className = "",
}: BonusCategorySectionProps): React.ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const categoryInfo = CATEGORY_INFO[category];

  // Sort bonuses by absolute value (most significant first)
  const sortedBonuses = [...bonuses].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  // Determine which bonuses should show bars (significant percentage bonuses)
  const shouldShowBar = (bonus: ShipClassBonus): boolean => {
    return bonus.formatted_value.includes("%") && Math.abs(bonus.value) >= 10;
  };

  return (
    <div className={className}>
      {/* Category Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "var(--frigate-space-2)",
          backgroundColor: "var(--frigate-bg-surface)",
          border: "1px solid var(--frigate-border-base)",
          cursor: "pointer",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--frigate-bg-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--frigate-bg-surface)";
        }}
      >
        {/* Expand/Collapse Indicator */}
        <div
          style={{
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-small)",
            color: "var(--frigate-text-secondary)",
            marginRight: "var(--frigate-space-2)",
            transition: "transform 0.2s ease",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          ▶
        </div>

        {/* Category Icon */}
        <div
          style={{
            fontSize: "var(--frigate-font-base)",
            marginRight: "var(--frigate-space-2)",
          }}
        >
          {categoryInfo.icon}
        </div>

        {/* Category Name */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              fontWeight: 600,
              color: categoryInfo.color,
              marginBottom: "var(--frigate-space-1)",
            }}
          >
            {categoryInfo.name}
          </div>
          <div
            style={{
              fontFamily: "var(--frigate-font-sans)",
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-muted)",
            }}
          >
            {categoryInfo.description}
          </div>
        </div>

        {/* Bonus Count Badge */}
        <div
          style={{
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-tiny)",
            padding: "2px 8px",
            backgroundColor: "var(--frigate-bg-base)",
            border: "1px solid var(--frigate-border-base)",
            color: categoryInfo.color,
            fontWeight: 600,
          }}
        >
          {bonuses.length}
        </div>
      </div>

      {/* Bonus List */}
      {expanded && (
        <div
          style={{
            borderLeft: "1px solid var(--frigate-border-base)",
            borderRight: "1px solid var(--frigate-border-base)",
            borderBottom: "1px solid var(--frigate-border-base)",
          }}
        >
          {sortedBonuses.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: "var(--frigate-space-1)",
                padding: "var(--frigate-space-2)",
              }}
            >
              {sortedBonuses.map((bonus) => (
                <BonusItem key={bonus.id} bonus={bonus} showBar={shouldShowBar(bonus)} />
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "var(--frigate-space-3)",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-muted)",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              No bonuses in this category
            </div>
          )}
        </div>
      )}
    </div>
  );
}
