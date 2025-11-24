import { useCallback, useEffect, useState } from 'react';
import type { ShipClassDetails } from '../types/shipClass';
import { createApiClient } from '../api/client';

/**
 * Hook to fetch and cache ship class details by ID
 * 
 * @param shipClassId The ID of the ship class to fetch
 * @param apiBase The API base URL
 * @returns Object containing shipClass, loading state, and error
 */
export function useShipClass(shipClassId: string | null | undefined, apiBase = '') {
  const [shipClass, setShipClass] = useState<ShipClassDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchShipClass = useCallback(async () => {
    if (!shipClassId) {
      setShipClass(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = apiBase || 'http://localhost:8000';
      const client = createApiClient({ baseUrl });
      const details = await client.getShipClass(shipClassId);
      setShipClass(details);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setShipClass(null);
    } finally {
      setLoading(false);
    }
  }, [shipClassId, apiBase]);

  useEffect(() => {
    fetchShipClass();
  }, [fetchShipClass]);

  return { shipClass, loading, error };
}
