/**
 * AmmunitionCard Component
 *
 * Individual ammunition item card for display in the AmmunitionBrowser.
 * Shows ammo name, cost/weight summary, compatibility status, and add button.
 * Wraps content in AmmunitionTooltip for hover details.
 * Follows the technical aesthetic with monospace typography and bracket notation.
 */
import React, { useState, useCallback } from "react";
import type { Ammunition } from "@frigate/api-client";
import { AmmunitionTooltip } from "../components/AmmunitionTooltip";

/**
 * AmmunitionCard Props
 */
export interface AmmunitionCardProps {
  /** Ammunition data to display */
  ammo: Ammunition;
  /** Whether this ammo is compatible with installed weapons */
  isCompatible: boolean;
  /** Reason for incompatibility (if not compatible) */
  incompatibilityReason?: string;
  /** Names of compatible weapons */
  compatibleWeapons?: string[];
  /** Whether adding is allowed (within constraints) */
  canAdd: boolean;
  /** Callback when add button is clicked */
  onAdd: () => void;
  /** Callback to show detail modal */
  onShowDetails: () => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Format number for compact display
 */
function formatCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(value);
}

/**
 * AmmunitionCard Component
 *
 * Displays a single ammunition item with:
 * - Name (clickable for details)
 * - Cost and weight summary
 * - Compatibility indicator
 * - Add button [+]
 */
export function AmmunitionCard({
  ammo,
  isCompatible,
  incompatibilityReason,
  compatibleWeapons = [],
  canAdd,
  onAdd,
  onShowDetails,
  className = "",
}: AmmunitionCardProps): React.ReactElement {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (canAdd) {
        onAdd();
      }
    },
    [canAdd, onAdd]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        onShowDetails();
      } else if (e.key === "+" || e.key === "=") {
        if (canAdd) {
          onAdd();
        }
      }
    },
    [canAdd, onAdd, onShowDetails]
  );

  // Determine styling based on state
  const borderColor = isHovered ? "var(--frigate-border-light)" : "var(--frigate-border-base)";
  const backgroundColor = isHovered ? "var(--frigate-bg-raised)" : "var(--frigate-bg-surface)";
  const opacity = isCompatible ? 1 : 0.6;

  return (
    <AmmunitionTooltip
      ammo={ammo}
      isCompatible={isCompatible}
      incompatibilityReason={incompatibilityReason}
      compatibleWeapons={compatibleWeapons}
    >
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--frigate-space-2)",
          backgroundColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 0,
          cursor: "pointer",
          fontFamily: "var(--frigate-font-mono)",
          opacity,
          transition: "all 0.1s ease",
        }}
        onClick={onShowDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${ammo.name} - ${ammo.cost} credits, ${ammo.weight} tons${!isCompatible ? " - incompatible" : ""}`}
      >
        {/* Left: Name and stats */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Ammo name */}
          <div
            style={{
              fontSize: "var(--frigate-font-small)",
              fontWeight: 600,
              color: "var(--frigate-text-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ammo.name}
          </div>

          {/* Stats row: cost | weight | compatibility */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--frigate-space-2)",
              marginTop: "2px",
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-secondary)",
            }}
          >
            <span>{formatCompact(ammo.cost)} CR</span>
            <span style={{ color: "var(--frigate-text-muted)" }}>|</span>
            <span>{ammo.weight} t</span>
            {!isCompatible && (
              <>
                <span style={{ color: "var(--frigate-text-muted)" }}>|</span>
                <span
                  style={{
                    color: "var(--frigate-warning)",
                    fontWeight: 600,
                  }}
                  title={incompatibilityReason}
                >
                  [NO WEAPON]
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Add button */}
        <button
          onClick={handleAddClick}
          disabled={!canAdd}
          style={{
            padding: "var(--frigate-space-1) var(--frigate-space-2)",
            backgroundColor: canAdd ? "var(--frigate-bg-base)" : "transparent",
            border: `1px solid ${canAdd ? "var(--frigate-border-light)" : "var(--frigate-border-base)"}`,
            borderRadius: 0,
            color: canAdd ? "var(--frigate-text-primary)" : "var(--frigate-text-muted)",
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-small)",
            fontWeight: 700,
            cursor: canAdd ? "pointer" : "not-allowed",
            opacity: canAdd ? 1 : 0.5,
            transition: "all 0.1s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (canAdd) {
              e.currentTarget.style.backgroundColor = "var(--frigate-primary)";
              e.currentTarget.style.borderColor = "var(--frigate-primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (canAdd) {
              e.currentTarget.style.backgroundColor = "var(--frigate-bg-base)";
              e.currentTarget.style.borderColor = "var(--frigate-border-light)";
            }
          }}
          aria-label={`Add ${ammo.name} to inventory`}
          title={canAdd ? "Add to inventory" : "Cannot add (weight or credit limit)"}
        >
          [+]
        </button>
      </div>
    </AmmunitionTooltip>
  );
}

export default AmmunitionCard;
