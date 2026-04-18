/**
 * Ship Class Bonus List Component - Phase 4.12.3
 *
 * Main component for displaying all bonuses grouped by category.
 * Manages overall layout and category organization.
 */

import React from "react";
import type { BonusCategory, ShipClassBonus } from "../types/shipClass";
import { BonusCategorySection } from "./BonusCategorySection";

export interface ShipClassBonusListProps {
  /** Bonuses grouped by category */
  bonuses: Record<BonusCategory, ShipClassBonus[]>;
  /** Categories to expand by default */
  defaultExpandedCategories?: BonusCategory[];
  /** Additional CSS class name */
  className?: string;
}

/**
 * Ship Class Bonus List
 *
 * Displays all ship class bonuses organized by category.
 * Categories are collapsible and sorted by impact.
 * Empty categories are hidden.
 */
export function ShipClassBonusList({
  bonuses,
  defaultExpandedCategories = ["combat", "defense", "mobility"],
  className = "",
}: ShipClassBonusListProps): React.ReactElement {
  // Define category order (prioritize combat/defense)
  const categoryOrder: BonusCategory[] = ["combat", "defense", "mobility", "utility", "efficiency"];

  // Filter out empty categories
  const categoriesWithBonuses = categoryOrder.filter(
    (category) => bonuses[category] && bonuses[category].length > 0
  );

  // Count total bonuses
  const totalBonuses = categoriesWithBonuses.reduce(
    (sum, category) => sum + (bonuses[category]?.length || 0),
    0
  );

  return (
    <div className={className}>
      <div
        style={{
          backgroundColor: "var(--frigate-bg-surface)",
          border: "1px solid var(--frigate-border-base)",
          padding: "var(--frigate-space-3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--frigate-space-3)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            SHIP CLASS BONUSES:
          </div>
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-accent)",
              fontWeight: 600,
            }}
          >
            {totalBonuses} {totalBonuses === 1 ? "BONUS" : "BONUSES"}
          </div>
        </div>

        {/* Category Sections */}
        {categoriesWithBonuses.length > 0 ? (
          <div
            style={{
              display: "grid",
              gap: "var(--frigate-space-2)",
            }}
          >
            {categoriesWithBonuses.map((category) => (
              <BonusCategorySection
                key={category}
                category={category}
                bonuses={bonuses[category]}
                defaultExpanded={defaultExpandedCategories.includes(category)}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "var(--frigate-space-4)",
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-text-muted)",
              textAlign: "center",
              fontStyle: "italic",
              backgroundColor: "var(--frigate-bg-base)",
              border: "1px solid var(--frigate-border-base)",
            }}
          >
            This ship class provides no bonuses
          </div>
        )}
      </div>
    </div>
  );
}
