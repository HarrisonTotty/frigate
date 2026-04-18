import { useCallback, useEffect, useState } from "react";
import type { ShipClassDetails } from "../types/shipClass";
import { createApiClient } from "../api/client";

/**
 * Hook to fetch and cache ship class details by ID
 *
 * @param shipClassId The ID of the ship class to fetch
 * @param apiBase The API base URL
 * @returns Object containing:
 *   - shipClass: The fetched ship class details (or null if not loaded)
 *   - loading: Whether a fetch is in progress
 *   - error: Any error that occurred during fetch (or null)
 *   - refetch: Function to manually retry fetching the ship class
 */
export function useShipClass(shipClassId: string | null | undefined, apiBase = "") {
  const [shipClass, setShipClass] = useState<ShipClassDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchShipClass = useCallback(async () => {
    if (!shipClassId) {
      setShipClass(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = apiBase || "http://localhost:8000";
      const client = createApiClient({ baseUrl });
      const details = await client.getShipClass(shipClassId);
      setShipClass(details);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.error(`Failed to fetch ship class "${shipClassId}":`, errorObj.message);
      setError(errorObj);
      setShipClass(null);
    } finally {
      setLoading(false);
    }
  }, [shipClassId, apiBase]);

  useEffect(() => {
    fetchShipClass();
  }, [fetchShipClass]);

  // Expose refetch for manual retry
  const refetch = useCallback(() => {
    void fetchShipClass();
  }, [fetchShipClass]);

  return { shipClass, loading, error, refetch };
}
