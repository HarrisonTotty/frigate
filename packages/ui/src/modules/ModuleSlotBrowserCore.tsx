import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { ModuleSlot, ModuleInstance } from '@frigate/api-client';
import { ModuleSlotCard } from '../lobby/ModuleSlotCard';
import { ModuleSlotCategoryTabs } from '../lobby/ModuleSlotCategoryTabs';
import { useCatalog } from '../hooks/useCatalog';

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
  blueprintId,
  installedModules = [],
  buildPointsUsed = 0,
  maxBuildPoints = 100,
  onModuleAdded,
  className = '',
}: ModuleSlotBrowserCoreProps) {
  const catalog = useCatalog(apiUrl);
  const [slots, setSlots] = useState<ModuleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load all available module slots from the API
  useEffect(() => {
    const loadSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedSlots = await catalog.getModuleSlots();
        setSlots(loadedSlots || []);

        // Set initial category to first available group if exists
        if (loadedSlots && loadedSlots.length > 0) {
          const allGroups = Array.from(
            new Set(loadedSlots.flatMap((slot) => slot.groups || []))
          );
          if (allGroups.length > 0) {
            setSelectedCategory(allGroups[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load module slots:', err);
        setError('Failed to load module slots');
      } finally {
        setLoading(false);
      }
    };

    void loadSlots();
  }, [catalog]);

  // Extract all unique categories from loaded slots
  const categories = useMemo(() => {
    const allGroups = Array.from(
      new Set(slots.flatMap((slot) => slot.groups || []))
    );
    return allGroups.sort();
  }, [slots]);

  // Filter slots based on search term and selected category
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        slot.name.toLowerCase().includes(searchLower) ||
        (slot.description || '').toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Filter by selected category
      if (selectedCategory && !slot.groups.includes(selectedCategory)) {
        return false;
      }

      return true;
    });
  }, [slots, searchTerm, selectedCategory]);

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
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.currentTarget.value);
    },
    []
  );

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--frigate-space-2)',
    padding: 'var(--frigate-space-2)',
    backgroundColor: 'var(--frigate-bg-base)',
    fontFamily: 'var(--frigate-font-mono)',
    color: 'var(--frigate-text-primary)',
    height: '100%',
    overflow: 'hidden',
  };

  const searchInputStyles: React.CSSProperties = {
    fontFamily: 'var(--frigate-font-mono)',
    fontSize: 'var(--frigate-font-body)',
    padding: 'var(--frigate-space-1) var(--frigate-space-2)',
    backgroundColor: 'var(--frigate-bg-surface)',
    color: 'var(--frigate-text-primary)',
    border: '1px solid var(--frigate-border-base)',
    borderRadius: 'var(--frigate-radius-none)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const scrollableAreaStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--frigate-space-1)',
  };

  const emptyStateStyles: React.CSSProperties = {
    padding: 'var(--frigate-space-4)',
    textAlign: 'center',
    color: 'var(--frigate-text-muted)',
    fontSize: 'var(--frigate-font-small)',
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={emptyStateStyles}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            [LOADING MODULE SLOTS...]
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyles}>
        <div style={{ ...emptyStateStyles, color: 'var(--frigate-danger)' }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            [ERROR: {error}]
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles} className={className}>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search modules..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={searchInputStyles}
        aria-label="Search module slots"
      />

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
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
