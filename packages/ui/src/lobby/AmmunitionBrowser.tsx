/**
 * AmmunitionBrowser Component
 *
 * Searchable, filterable ammunition list with category grouping.
 * Allows players to browse and add ammunition to their ship inventory.
 * Follows the technical aesthetic with monospace typography and ASCII styling.
 */
import React, { useState, useMemo, useRef, useEffect } from "react";
import type { Ammunition, AmmoCategory } from "@frigate/api-client";
import { AmmunitionCard } from "./AmmunitionCard";
import { Select } from "../components";

/**
 * Category display labels
 */
const CATEGORY_LABELS: Record<AmmoCategory, string> = {
  kinetic: "KINETIC",
  missiles: "MISSILES",
  torpedos: "TORPEDOS",
};

/**
 * Sort options for ammunition
 */
type SortOption = "name" | "cost" | "weight" | "damage";

const SORT_LABELS: Record<SortOption, string> = {
  name: "NAME",
  cost: "COST",
  weight: "WEIGHT",
  damage: "DAMAGE",
};

/**
 * AmmunitionBrowser Props
 */
export interface AmmunitionBrowserProps {
  /** All available ammunition */
  ammunition: Ammunition[];
  /** Whether data is loading */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Filter to show only compatible ammo (based on installed weapons) */
  showCompatibleOnly: boolean;
  /** Callback to toggle compatibility filter */
  onToggleCompatibleFilter: () => void;
  /** Callback when ammo is added */
  onAddAmmo: (ammoId: string) => void;
  /** Callback to show ammo detail modal */
  onShowAmmoDetails: (ammo: Ammunition) => void;
  /** Check if adding ammo is allowed (weight/credit constraints) */
  canAddAmmo: (ammoId: string) => boolean;
  /** Check if ammo is compatible with installed weapons */
  isAmmoCompatible: (ammoId: string) => boolean;
  /** Get incompatibility reason for ammo */
  getIncompatibilityReason?: (ammo: Ammunition) => string | undefined;
  /** Get compatible weapon names for ammo */
  getCompatibleWeapons?: (ammo: Ammunition) => string[];
  /** Optional CSS class name */
  className?: string;
}

/**
 * Group ammunition by category
 */
function groupByCategory(ammunition: Ammunition[]): Record<AmmoCategory, Ammunition[]> {
  const grouped: Record<AmmoCategory, Ammunition[]> = {
    kinetic: [],
    missiles: [],
    torpedos: [],
  };

  for (const ammo of ammunition) {
    if (grouped[ammo.category]) {
      grouped[ammo.category].push(ammo);
    }
  }

  return grouped;
}

/**
 * Sort ammunition by specified field
 */
function sortAmmunition(ammunition: Ammunition[], sortBy: SortOption): Ammunition[] {
  return [...ammunition].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "cost":
        return a.cost - b.cost;
      case "weight":
        return a.weight - b.weight;
      case "damage":
        return b.impact_damage - a.impact_damage;
      default:
        return 0;
    }
  });
}

/**
 * Browser Header Component
 */
function BrowserHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  showCompatibleOnly,
  onToggleFilter,
  searchInputRef,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  showCompatibleOnly: boolean;
  onToggleFilter: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--frigate-space-2)",
        backgroundColor: "var(--frigate-bg-base)",
        padding: "var(--frigate-space-2)",
        borderBottom: "1px solid var(--frigate-border-base)",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontWeight: 800,
          fontSize: "var(--frigate-font-heading)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        AMMUNITION CATALOG
      </div>

      {/* Search Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--frigate-space-1)",
          backgroundColor: "var(--frigate-bg-surface)",
          border: "1px solid var(--frigate-border-base)",
          padding: "var(--frigate-space-1) var(--frigate-space-2)",
        }}
      >
        <span
          style={{
            color: "var(--frigate-text-muted)",
            fontSize: "var(--frigate-font-small)",
          }}
        >
          [/]
        </span>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="SEARCH..."
          style={{
            flex: 1,
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            color: "var(--frigate-text-primary)",
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-small)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
          aria-label="Search ammunition"
        />
      </div>

      {/* Filter and Sort Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--frigate-space-2)",
        }}
      >
        {/* Compatibility Filter Toggle */}
        <button
          onClick={onToggleFilter}
          style={{
            padding: "var(--frigate-space-1) var(--frigate-space-2)",
            backgroundColor: showCompatibleOnly
              ? "var(--frigate-primary)"
              : "var(--frigate-bg-surface)",
            border: `1px solid ${showCompatibleOnly ? "var(--frigate-primary)" : "var(--frigate-border-base)"}`,
            borderRadius: 0,
            color: "var(--frigate-text-primary)",
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-tiny)",
            fontWeight: 600,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
          aria-pressed={showCompatibleOnly}
          aria-label="Toggle compatible only filter"
        >
          {showCompatibleOnly ? "[COMPATIBLE ONLY]" : "[SHOW ALL]"}
        </button>

        {/* Sort Selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--frigate-space-1)",
          }}
        >
          <span
            style={{
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-muted)",
              textTransform: "uppercase",
            }}
          >
            SORT:
          </span>
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            size="sm"
            aria-label="Sort ammunition by"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}

/**
 * Browser Footer Component
 */
function BrowserFooter({ itemCount }: { itemCount: number }) {
  return (
    <div
      style={{
        fontSize: "var(--frigate-font-tiny)",
        color: "var(--frigate-text-muted)",
        backgroundColor: "var(--frigate-bg-base)",
        padding: "var(--frigate-space-1) var(--frigate-space-2)",
        borderTop: "1px solid var(--frigate-border-base)",
        letterSpacing: "0.05em",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>[/] SEARCH [F] FILTER [ENTER] DETAILS [+] ADD</span>
      <span>{itemCount} ITEMS</span>
    </div>
  );
}

/**
 * Category Group Component
 */
function CategoryGroup({
  category,
  ammunition,
  canAddAmmo,
  isAmmoCompatible,
  getIncompatibilityReason,
  getCompatibleWeapons,
  onAddAmmo,
  onShowAmmoDetails,
}: {
  category: AmmoCategory;
  ammunition: Ammunition[];
  canAddAmmo: (ammoId: string) => boolean;
  isAmmoCompatible: (ammoId: string) => boolean;
  getIncompatibilityReason?: (ammo: Ammunition) => string | undefined;
  getCompatibleWeapons?: (ammo: Ammunition) => string[];
  onAddAmmo: (ammoId: string) => void;
  onShowAmmoDetails: (ammo: Ammunition) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (ammunition.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "var(--frigate-space-2)" }}>
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--frigate-space-1)",
          width: "100%",
          padding: "var(--frigate-space-1) var(--frigate-space-2)",
          backgroundColor: "var(--frigate-bg-base)",
          border: "none",
          borderBottom: "1px solid var(--frigate-border-base)",
          color: "var(--frigate-text-secondary)",
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-small)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          cursor: "pointer",
          textAlign: "left",
        }}
        aria-expanded={isExpanded}
        aria-label={`${CATEGORY_LABELS[category]} - ${ammunition.length} items`}
      >
        <span style={{ color: "var(--frigate-text-muted)" }}>{isExpanded ? "[-]" : "[+]"}</span>
        <span>{CATEGORY_LABELS[category]}</span>
        <span style={{ color: "var(--frigate-text-muted)", marginLeft: "auto" }}>
          ({ammunition.length})
        </span>
      </button>

      {/* Category Items */}
      {isExpanded && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--frigate-space-1)",
            padding: "var(--frigate-space-1)",
          }}
        >
          {ammunition.map((ammo) => (
            <AmmunitionCard
              key={ammo.id}
              ammo={ammo}
              isCompatible={isAmmoCompatible(ammo.id)}
              incompatibilityReason={getIncompatibilityReason?.(ammo)}
              compatibleWeapons={getCompatibleWeapons?.(ammo)}
              canAdd={canAddAmmo(ammo.id)}
              onAdd={() => onAddAmmo(ammo.id)}
              onShowDetails={() => onShowAmmoDetails(ammo)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * AmmunitionBrowser Component
 *
 * Main ammunition browsing interface with:
 * - Search input with / shortcut
 * - Compatibility filter toggle (enabled by default)
 * - Sort options (name, cost, weight, damage)
 * - Category grouping (kinetic, missiles, torpedos)
 * - Individual ammo cards with add buttons
 */
export function AmmunitionBrowser({
  ammunition,
  loading,
  error,
  showCompatibleOnly,
  onToggleCompatibleFilter,
  onAddAmmo,
  onShowAmmoDetails,
  canAddAmmo,
  isAmmoCompatible,
  getIncompatibilityReason,
  getCompatibleWeapons,
  className = "",
}: AmmunitionBrowserProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const searchInputRef = useRef<HTMLInputElement>(null!);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on /
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Toggle filter on F
      if (e.key === "f" || e.key === "F") {
        if (document.activeElement !== searchInputRef.current) {
          e.preventDefault();
          onToggleCompatibleFilter();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onToggleCompatibleFilter]);

  // Filter and sort ammunition
  const filteredAmmo = useMemo(() => {
    let result = ammunition;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.name.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
      );
    }

    // Apply compatibility filter
    if (showCompatibleOnly) {
      result = result.filter((a) => isAmmoCompatible(a.id));
    }

    // Sort
    result = sortAmmunition(result, sortBy);

    return result;
  }, [ammunition, searchQuery, showCompatibleOnly, sortBy, isAmmoCompatible]);

  // Group by category
  const groupedAmmo = useMemo(() => groupByCategory(filteredAmmo), [filteredAmmo]);

  // Loading state
  if (loading) {
    return (
      <div
        className={className}
        style={{
          fontFamily: "var(--frigate-font-mono)",
          background: "var(--frigate-bg-base)",
          color: "var(--frigate-text-primary)",
          border: "1px solid var(--frigate-border-base)",
          borderRadius: 0,
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--frigate-space-4)",
        }}
        aria-busy="true"
        aria-label="Loading ammunition catalog"
      >
        <div
          style={{
            fontSize: "var(--frigate-font-small)",
            color: "var(--frigate-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          [LOADING AMMUNITION CATALOG...]
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={className}
        style={{
          fontFamily: "var(--frigate-font-mono)",
          background: "var(--frigate-bg-base)",
          color: "var(--frigate-text-primary)",
          border: "1px solid var(--frigate-border-base)",
          borderRadius: 0,
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--frigate-space-4)",
        }}
        role="alert"
      >
        <div
          style={{
            fontSize: "var(--frigate-font-small)",
            color: "var(--frigate-danger)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            textAlign: "center",
          }}
        >
          [ERROR] FAILED TO LOAD AMMUNITION
        </div>
        <div
          style={{
            marginTop: "var(--frigate-space-2)",
            fontSize: "var(--frigate-font-tiny)",
            color: "var(--frigate-text-muted)",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        fontFamily: "var(--frigate-font-mono)",
        background: "var(--frigate-bg-base)",
        color: "var(--frigate-text-primary)",
        border: "1px solid var(--frigate-border-base)",
        borderRadius: 0,
        boxShadow: "none",
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      aria-label="Ammunition Browser"
      role="region"
    >
      {/* Header with search and filters */}
      <BrowserHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showCompatibleOnly={showCompatibleOnly}
        onToggleFilter={onToggleCompatibleFilter}
        searchInputRef={searchInputRef}
      />

      {/* Content - Category Groups */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "var(--frigate-bg-surface)",
        }}
      >
        {filteredAmmo.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--frigate-space-4)",
              height: "100%",
            }}
          >
            <div
              style={{
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              [NO AMMUNITION FOUND]
            </div>
            {showCompatibleOnly && (
              <div
                style={{
                  marginTop: "var(--frigate-space-2)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-muted)",
                }}
              >
                Try disabling compatibility filter
              </div>
            )}
          </div>
        ) : (
          <>
            {(["kinetic", "missiles", "torpedos"] as AmmoCategory[]).map((category) => (
              <CategoryGroup
                key={category}
                category={category}
                ammunition={groupedAmmo[category]}
                canAddAmmo={canAddAmmo}
                isAmmoCompatible={isAmmoCompatible}
                getIncompatibilityReason={getIncompatibilityReason}
                getCompatibleWeapons={getCompatibleWeapons}
                onAddAmmo={onAddAmmo}
                onShowAmmoDetails={onShowAmmoDetails}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer with keyboard hints */}
      <BrowserFooter itemCount={filteredAmmo.length} />
    </div>
  );
}

export default AmmunitionBrowser;
