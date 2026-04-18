import { useEffect, useState, useCallback } from "react";

export function useRemoteBlueprint(apiUrl: string, blueprintId: string) {
  const [blueprint, setBlueprint] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/v1/blueprints/${blueprintId}`);
      if (!res.ok) {
        const err = new Error(`Failed to load blueprint: ${res.status}`);
        setError(err);
        return null;
      }
      const data = await res.json();
      setBlueprint(data);
      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setBlueprint(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiUrl, blueprintId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { blueprint, loading, error, reload: load, setBlueprint } as const;
}
