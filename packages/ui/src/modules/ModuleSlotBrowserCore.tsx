import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { ModuleSlot, ModuleInstance } from "@frigate/api-client";
import { ModuleSlotCard } from "../lobby/ModuleSlotCard";
import { ModuleSlotCategoryTabs } from "../lobby/ModuleSlotCategoryTabs";
import { useCatalog } from "../hooks/useCatalog";

/** Sort options for the module slot browser */
export type ModuleSlotSortOption = "name" | "cost" | "required";

/** Sort labels for display */
const SORT_LABELS: Record<ModuleSlotSortOption, string> = {
  name: "NAME",
  cost: "COST",
  required: "REQUIRED",
};

/**
 * Props for the ModuleSlotBrowserCore component
 */
export interface ModuleSlotBrowserCoreProps {
  /** API base URL */
  apiUrl: string;
  /** Blueprint ID for this design session */
  blueprintId: string;
  /** Currently installed module instances */
  installedModules?: ModuleInstance[];
  /** Pre-loaded module slots list (optional - if provided, skips fetching) */
  moduleSlots?: ModuleSlot[];
  /** Build points currently used */
  buildPointsUsed?: number;
  /** Maximum build points available */
  maxBuildPoints?: number;
  /** Callback when a module is added */
  onModuleAdded?: (slotId: string) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Module Slot Browser Core Component
 *
 * Core browsing logic for module slots in the Ship Design Workspace.
 * Handles:
 * - Loading available module slots from the API
 * - Filtering by category/group
 * - Searching module slots
 * - Displaying slot cards with add functionality
 * - Tracking which slots have been added to the blueprint
 *
 * This is the actual browser content component (lower-level).
 * The `ModuleSlotBrowser` component in the lobby folder wraps this
 * with header/footer and workspace integration.
 *
 * @example
 * ```tsx
 * <ModuleSlotBrowserCore
 *   apiUrl="http://localhost:3000"
 *   blueprintId="bp1"
 *   buildPointsUsed={45}
 *   maxBuildPoints={100}
 *   onModuleAdded={(slotId) => console.log('Added:', slotId)}
 * />
 * ```
 */
export function ModuleSlotBrowserCore({
  apiUrl,
  blueprintId: _blueprintId,
  installedModules = [],
  moduleSlots: propModuleSlots,
  buildPointsUsed = 0,
  maxBuildPoints = 100,
  onModuleAdded,
  className = "",
}: ModuleSlotBrowserCoreProps) {
  const catalog = useCatalog(apiUrl);
  const [slots, setSlots] = useState<ModuleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<ModuleSlotSortOption>("name");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use a ref to track if we've already attempted to load slots
  // This prevents infinite loops caused by the catalog object being recreated
  const loadAttemptedRef = useRef(false);

  // If moduleSlots are provided via props, use them directly
  useEffect(() => {
    if (propModuleSlots && propModuleSlots.length > 0) {
      setSlots(propModuleSlots);
      setLoading(false);
      setError(null);
      // Set initial category if not already set
      if (!selectedCategory) {
        const allGroups = Array.from(new Set(propModuleSlots.flatMap((slot) => slot.groups || [])));
        if (allGroups.length > 0) {
          setSelectedCategory(allGroups[0]);
        }
      }
    }
  }, [propModuleSlots, selectedCategory]);

  // Load all available module slots from the API (only if not provided via props)
  useEffect(() => {
    // Skip if moduleSlots are provided via props
    if (propModuleSlots && propModuleSlots.length > 0) {
      return;
    }
    // Skip if we've already attempted to load or if apiUrl is empty
    if (loadAttemptedRef.current || !apiUrl) {
      return;
    }

    loadAttemptedRef.current = true;

    const loadSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedSlots = await catalog.getModuleSlots();
        setSlots(loadedSlots || []);

        // Set initial category to first available group if exists
        if (loadedSlots && loadedSlots.length > 0) {
          const allGroups = Array.from(new Set(loadedSlots.flatMap((slot) => slot.groups || [])));
          if (allGroups.length > 0) {
            setSelectedCategory(allGroups[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load module slots:", err);
        setError("Failed to load module slots");
      } finally {
        setLoading(false);
      }
    };

    void loadSlots();
  }, [apiUrl, catalog, propModuleSlots]);

  // Extract all unique categories from loaded slots
  const categories = useMemo(() => {
    const allGroups = Array.from(new Set(slots.flatMap((slot) => slot.groups || [])));
    return allGroups.sort();
  }, [slots]);

  // Filter and sort slots based on search term, selected category, and sort option
  const filteredSlots = useMemo(() => {
    const filtered = slots.filter((slot) => {
      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        slot.name.toLowerCase().includes(searchLower) ||
        (slot.description || "").toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Filter by selected category
      if (selectedCategory && !slot.groups.includes(selectedCategory)) {
        return false;
      }

      return true;
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "cost":
          return (a.base_cost ?? 0) - (b.base_cost ?? 0);
        case "required":
          // Required slots first, then by name
          if (a.required === b.required) {
            return a.name.localeCompare(b.name);
          }
          return a.required ? -1 : 1;
        default:
          return 0;
      }
    });
  }, [slots, searchTerm, selectedCategory, sortBy]);

  // Count how many instances of each slot are installed
  const slotInstanceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    installedModules.forEach((instance) => {
      const current = counts.get(instance.module_slot_id) || 0;
      counts.set(instance.module_slot_id, current + 1);
    });
    return counts;
  }, [installedModules]);

  // Handle adding a module
  const handleAddModule = useCallback(
    (slot: ModuleSlot) => {
      if (onModuleAdded) {
        onModuleAdded(slot.id);
      }
    },
    [onModuleAdded]
  );

  // Handle category selection
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // Handle search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.currentTarget.value);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((option: ModuleSlotSortOption) => {
    setSortBy(option);
  }, []);

  // Cycle through sort options
  const cycleSortOption = useCallback(() => {
    const options: ModuleSlotSortOption[] = ["name", "cost", "required"];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex]);
  }, [sortBy]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // "/" to focus search
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // "s" to cycle sort (when not in search input)
      if (e.key === "s" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        cycleSortOption();
      }
    },
    [cycleSortOption]
  );

  const containerStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--frigate-space-2)",
    padding: "var(--frigate-space-2)",
    backgroundColor: "var(--frigate-bg-base)",
    fontFamily: "var(--frigate-font-mono)",
    color: "var(--frigate-text-primary)",
    height: "100%",
    overflow: "hidden",
  };

  const searchInputStyles: React.CSSProperties = {
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-font-body)",
    padding: "var(--frigate-space-1) var(--frigate-space-2)",
    backgroundColor: "var(--frigate-bg-surface)",
    color: "var(--frigate-text-primary)",
    border: "1px solid var(--frigate-border-base)",
    borderRadius: "var(--frigate-radius-none)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const scrollableAreaStyles: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    overflowX: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "var(--frigate-space-1)",
    paddingRight: "var(--frigate-space-2)",
    minWidth: 0,
  };

  const emptyStateStyles: React.CSSProperties = {
    padding: "var(--frigate-space-4)",
    textAlign: "center",
    color: "var(--frigate-text-muted)",
    fontSize: "var(--frigate-font-small)",
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={emptyStateStyles}>
          <div style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
            [LOADING MODULE SLOTS...]
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyles}>
        <div style={{ ...emptyStateStyles, color: "var(--frigate-danger)" }}>
          <div style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
            [ERROR: {error}]
          </div>
        </div>
      </div>
    );
  }

  const sortButtonStyles: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "var(--frigate-text-secondary)",
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-font-tiny)",
    padding: "2px 4px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const activeSortButtonStyles: React.CSSProperties = {
    ...sortButtonStyles,
    color: "var(--frigate-primary)",
    fontWeight: 700,
  };

  return (
    <div style={containerStyles} className={className} onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Search Input */}
      <input
        ref={searchInputRef}
        type="text"
        placeholder="[/] Search modules..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={searchInputStyles}
        aria-label="Search module slots"
      />

      {/* Sort Options */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--frigate-space-1)",
          fontSize: "var(--frigate-font-tiny)",
          color: "var(--frigate-text-muted)",
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>SORT:</span>
        {(["name", "cost", "required"] as ModuleSlotSortOption[]).map((option) => (
          <button
            key={option}
            onClick={() => handleSortChange(option)}
            style={sortBy === option ? activeSortButtonStyles : sortButtonStyles}
            aria-pressed={sortBy === option}
            aria-label={`Sort by ${SORT_LABELS[option]}`}
          >
            [{SORT_LABELS[option]}]
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <ModuleSlotCategoryTabs
          categories={categories}
          selectedCategory={selectedCategory || categories[0]}
          onSelect={handleCategorySelect}
        />
      )}

      {/* Module Slots List */}
      <div style={scrollableAreaStyles}>
        {filteredSlots.length === 0 ? (
          <div style={emptyStateStyles}>
            <div style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              [NO MODULES FOUND]
            </div>
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <ModuleSlotCard
              key={slot.id}
              slot={slot}
              currentCount={slotInstanceCounts.get(slot.id) || 0}
              maxBuildPoints={maxBuildPoints}
              buildPointsUsed={buildPointsUsed}
              onAdd={handleAddModule}
              onToggleDetails={() => {
                /* details toggling handled in ModuleSlotCard */
              }}
              isExpanded={false}
              disabled={
                buildPointsUsed + slot.base_cost > maxBuildPoints ||
                (slotInstanceCounts.get(slot.id) || 0) >= slot.max_slots
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ModuleSlotBrowserCore;
