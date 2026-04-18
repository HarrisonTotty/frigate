/**
 * Ship class data store
 *
 * Manages ship class data with caching, faction filtering, and invalidation.
 */

import { create } from "zustand";
import type {
  ShipClassSummary,
  ShipClassDetails,
  ShipClassFilter,
  ShipClassSortBy,
  SortOrder,
} from "../types/shipClass";
import { defaultApiClient } from "../api/client";

/**
 * Ship class store state
 */
export interface ShipClassStore {
  // Data
  /** All ship classes (cached) */
  shipClasses: ShipClassSummary[];
  /** Detailed ship class data (cached by ID) */
  shipClassDetails: Record<string, ShipClassDetails>;

  // Loading states
  /** Whether ship classes are currently loading */
  isLoading: boolean;
  /** Whether a specific ship class is loading */
  isLoadingDetail: boolean;

  // Error states
  /** Error message if loading failed */
  error: string | null;

  // Filters
  /** Current active faction filter */
  activeFaction: string | null;

  // Cache metadata
  /** Timestamp when ship classes were last loaded */
  lastFetchedAt: number | null;
  /** API version to detect invalidation */
  apiVersion: string | null;

  // Actions
  /** Load all ship classes (with optional faction filter) */
  loadShipClasses: (faction?: string, forceRefresh?: boolean) => Promise<void>;

  /** Load detailed information for a specific ship class */
  loadShipClassDetail: (classId: string, forceRefresh?: boolean) => Promise<void>;

  /** Set the active faction filter */
  setActiveFaction: (faction: string | null) => void;

  /** Filter ship classes */
  filterShipClasses: (filter: ShipClassFilter) => ShipClassSummary[];

  /** Sort ship classes */
  sortShipClasses: (
    classes: ShipClassSummary[],
    sortBy: ShipClassSortBy,
    order: SortOrder
  ) => ShipClassSummary[];

  /** Get a specific ship class detail from cache */
  getShipClassDetail: (classId: string) => ShipClassDetails | null;

  /** Invalidate cache (force refresh on next load) */
  invalidateCache: () => void;

  /** Clear all data and reset store */
  reset: () => void;
}

/**
 * Cache duration in milliseconds (5 minutes)
 */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Ship class data store
 */
export const useShipClassStore = create<ShipClassStore>((set, get) => ({
  // Initial state
  shipClasses: [],
  shipClassDetails: {},
  isLoading: false,
  isLoadingDetail: false,
  error: null,
  activeFaction: null,
  lastFetchedAt: null,
  apiVersion: null,

  // Load all ship classes
  loadShipClasses: async (faction?: string, forceRefresh = false) => {
    const state = get();

    // Check if we need to refresh
    const needsRefresh =
      forceRefresh ||
      state.shipClasses.length === 0 ||
      !state.lastFetchedAt ||
      Date.now() - state.lastFetchedAt > CACHE_DURATION ||
      state.activeFaction !== faction;

    if (!needsRefresh) {
      console.log("[ShipClassStore] Using cached ship classes");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log("[ShipClassStore] Fetching ship classes", { faction });
      const shipClasses = await defaultApiClient.getShipClasses(faction);

      set({
        shipClasses,
        activeFaction: faction || null,
        lastFetchedAt: Date.now(),
        isLoading: false,
        error: null,
      });

      console.log("[ShipClassStore] Loaded", shipClasses.length, "ship classes");
    } catch (error) {
      console.error("[ShipClassStore] Failed to load ship classes:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load ship classes",
        isLoading: false,
      });
    }
  },

  // Load detailed ship class information
  loadShipClassDetail: async (classId: string, forceRefresh = false) => {
    const state = get();

    // Check if we already have this detail cached
    if (!forceRefresh && state.shipClassDetails[classId]) {
      console.log("[ShipClassStore] Using cached detail for", classId);
      return;
    }

    set({ isLoadingDetail: true, error: null });

    try {
      console.log("[ShipClassStore] Fetching detail for", classId);
      const detail = await defaultApiClient.getShipClass(classId);

      set((state) => ({
        shipClassDetails: {
          ...state.shipClassDetails,
          [classId]: detail,
        },
        isLoadingDetail: false,
        error: null,
      }));

      console.log("[ShipClassStore] Loaded detail for", classId);
    } catch (error) {
      console.error("[ShipClassStore] Failed to load ship class detail:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load ship class detail",
        isLoadingDetail: false,
      });
    }
  },

  // Set active faction filter
  setActiveFaction: (faction: string | null) => {
    const state = get();
    if (state.activeFaction !== faction) {
      console.log("[ShipClassStore] Changing faction filter to", faction);
      // Trigger reload with new faction
      get().loadShipClasses(faction || undefined, true);
    }
  },

  // Filter ship classes
  filterShipClasses: (filter: ShipClassFilter) => {
    const state = get();
    let filtered = [...state.shipClasses];

    if (filter.size) {
      filtered = filtered.filter((sc) => sc.size === filter.size);
    }

    if (filter.role) {
      filtered = filtered.filter((sc) => sc.role === filter.role);
    }

    if (filter.minBuildPoints !== undefined) {
      filtered = filtered.filter((sc) => sc.build_points >= filter.minBuildPoints!);
    }

    if (filter.maxBuildPoints !== undefined) {
      filtered = filtered.filter((sc) => sc.build_points <= filter.maxBuildPoints!);
    }

    return filtered;
  },

  // Sort ship classes
  sortShipClasses: (classes: ShipClassSummary[], sortBy: ShipClassSortBy, order: SortOrder) => {
    const sorted = [...classes];
    const multiplier = order === "asc" ? 1 : -1;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "size": {
          const sizeOrder = { Small: 1, Medium: 2, Large: 3 };
          comparison = sizeOrder[a.size] - sizeOrder[b.size];
          break;
        }
        case "role":
          comparison = a.role.localeCompare(b.role);
          break;
        case "buildPoints":
          comparison = a.build_points - b.build_points;
          break;
        case "maxWeight":
          comparison = a.max_weight - b.max_weight;
          break;
        case "maxModules":
          comparison = a.max_modules - b.max_modules;
          break;
      }

      return comparison * multiplier;
    });

    return sorted;
  },

  // Get ship class detail from cache
  getShipClassDetail: (classId: string) => {
    return get().shipClassDetails[classId] || null;
  },

  // Invalidate cache
  invalidateCache: () => {
    console.log("[ShipClassStore] Cache invalidated");
    set({
      lastFetchedAt: null,
      apiVersion: null,
    });
  },

  // Reset store
  reset: () => {
    console.log("[ShipClassStore] Store reset");
    set({
      shipClasses: [],
      shipClassDetails: {},
      isLoading: false,
      isLoadingDetail: false,
      error: null,
      activeFaction: null,
      lastFetchedAt: null,
      apiVersion: null,
    });
  },
}));

/**
 * Hook to get ship classes with automatic loading
 */
export function useShipClasses(faction?: string) {
  const store = useShipClassStore();

  // Auto-load on mount or faction change
  React.useEffect(() => {
    store.loadShipClasses(faction);
  }, [faction]);

  return {
    shipClasses: store.shipClasses,
    isLoading: store.isLoading,
    error: store.error,
    reload: () => store.loadShipClasses(faction, true),
  };
}

/**
 * Hook to get a specific ship class detail with automatic loading
 */
export function useShipClassDetail(classId: string | null) {
  const store = useShipClassStore();

  // Auto-load on mount or classId change
  React.useEffect(() => {
    if (classId) {
      store.loadShipClassDetail(classId);
    }
  }, [classId]);

  return {
    detail: classId ? store.getShipClassDetail(classId) : null,
    isLoading: store.isLoadingDetail,
    error: store.error,
    reload: () => classId && store.loadShipClassDetail(classId, true),
  };
}

// Add React import for hooks
import React from "react";
