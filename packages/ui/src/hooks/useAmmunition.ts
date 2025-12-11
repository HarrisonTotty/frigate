/**
 * useAmmunition Hook
 *
 * React hook for fetching and caching ammunition data from the HYPERION catalog API.
 * Provides loading state, error handling, and refetch capability.
 *
 * @example
 * ```tsx
 * const { ammunition, loading, error, refetch } = useAmmunition(apiUrl);
 *
 * if (loading) return <LoadingText text="Loading ammunition..." />;
 * if (error) return <ErrorBanner message={error} onRetry={refetch} />;
 *
 * return <AmmunitionBrowser ammunition={ammunition} />;
 * ```
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Ammunition, AmmoCategory } from '@frigate/api-client';

// API endpoint paths
const AMMO_CATEGORIES_ENDPOINT = '/v1/catalog/ammo';
const AMMO_CATEGORY_LIST = (category: string) => `/v1/catalog/ammo/${category}`;
const AMMO_DETAIL = (category: string, ammoId: string) =>
  `/v1/catalog/ammo/${category}/${ammoId}`;

// API response types
interface AmmoCategoryListResponse {
  categories: AmmoCategory[];
}

interface AmmoListResponse {
  ammunition: string[];
}

/**
 * Result type for useAmmunition hook
 */
export interface UseAmmunitionResult {
  /** All loaded ammunition data */
  ammunition: Ammunition[];

  /** Ammunition grouped by category for easier rendering */
  ammunitionByCategory: Record<AmmoCategory, Ammunition[]>;

  /** Whether data is currently being fetched */
  loading: boolean;

  /** Error message if fetch failed, null otherwise */
  error: string | null;

  /** Function to manually refetch ammunition data */
  refetch: () => Promise<void>;

  /** Get ammunition by ID */
  getAmmoById: (id: string) => Ammunition | undefined;
}

/**
 * Fetch JSON from a URL with error handling
 */
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Hook for fetching and managing ammunition data
 *
 * @param apiUrl - Base URL for the HYPERION API (e.g., 'http://localhost:3000')
 * @returns Ammunition data, loading state, and error handling
 */
export function useAmmunition(apiUrl: string): UseAmmunitionResult {
  const [ammunition, setAmmunition] = useState<Ammunition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all ammunition from the API
   */
  const fetchAmmunition = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Get all categories
      const categoriesUrl = `${apiUrl}${AMMO_CATEGORIES_ENDPOINT}`;
      const categoriesResponse = await fetchJson<AmmoCategoryListResponse>(categoriesUrl);
      const categories = categoriesResponse.categories;

      const allAmmo: Ammunition[] = [];

      // Step 2: For each category, get all ammo IDs and then fetch details
      for (const category of categories) {
        const categoryListUrl = `${apiUrl}${AMMO_CATEGORY_LIST(category)}`;
        const ammoListResponse = await fetchJson<AmmoListResponse>(categoryListUrl);
        const ammoIds = ammoListResponse.ammunition;

        // Fetch details for each ammo in parallel within the category
        const categoryAmmo = await Promise.all(
          ammoIds.map(async (ammoId) => {
            const detailUrl = `${apiUrl}${AMMO_DETAIL(category, ammoId)}`;
            const data = await fetchJson<Omit<Ammunition, 'category'>>(detailUrl);
            // Add category to the response
            return {
              ...data,
              category,
            } as Ammunition;
          })
        );

        allAmmo.push(...categoryAmmo);
      }

      setAmmunition(allAmmo);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load ammunition';
      setError(message);
      console.error('[useAmmunition] Error fetching ammunition:', e);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Fetch on mount and when apiUrl changes
  useEffect(() => {
    fetchAmmunition();
  }, [fetchAmmunition]);

  /**
   * Ammunition grouped by category for easier rendering
   */
  const ammunitionByCategory = useMemo(() => {
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
  }, [ammunition]);

  /**
   * Get ammunition by ID
   */
  const getAmmoById = useCallback(
    (id: string): Ammunition | undefined => {
      return ammunition.find((a) => a.id === id);
    },
    [ammunition]
  );

  return {
    ammunition,
    ammunitionByCategory,
    loading,
    error,
    refetch: fetchAmmunition,
    getAmmoById,
  };
}

export default useAmmunition;
