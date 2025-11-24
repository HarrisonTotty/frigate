import { useCallback, useReducer } from 'react';
import type { ModuleInstance } from '@frigate/api-client';
import blueprintReducer, { initialBlueprintState } from '@frigate/state/src/blueprint';

type UseBlueprintOptions = {
  apiBase?: string;
  blueprintId?: string | null;
  onRemoteChange?: () => void; // called after successful server mutation
};

export function useBlueprint(initial = initialBlueprintState, options: UseBlueprintOptions = {}) {
  const [state, dispatch] = useReducer(blueprintReducer, initial);
  const apiBase = options.apiBase ?? '';
  const blueprintId = options.blueprintId ?? initial.id;

  const addInstance = useCallback(async (slotTypeId: string, variantId?: string | null) => {
    // optimistic instance with temporary id
    const tempId = `tmp-${Math.random().toString(36).slice(2, 9)}`;
    const instance: ModuleInstance = { id: tempId, module_slot_id: slotTypeId, variant_id: variantId ?? null };
    dispatch({ type: 'blueprint/addInstance', payload: instance });

    if (!blueprintId) return instance;
    try {
      const res = await fetch(`${apiBase}/v1/blueprints/${blueprintId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_slot_id: slotTypeId, variant_id: variantId }),
      });
      if (res.ok) {
        const created = await res.json();
        // replace temporary instance with server-provided instance id
        dispatch({ type: 'blueprint/removeInstance', payload: { instanceId: tempId } });
        dispatch({ type: 'blueprint/addInstance', payload: created as ModuleInstance });
        options.onRemoteChange?.();
        return created as ModuleInstance;
      }
    } catch (err) {
      // rollback optimistic add
      dispatch({ type: 'blueprint/removeInstance', payload: { instanceId: tempId } });
      throw err;
    }
    return instance;
  }, [apiBase, blueprintId, options]);

  const removeInstance = useCallback(async (instanceId: string) => {
    // optimistic remove
    const backup = state.instances.find(i => i.id === instanceId) ?? null;
    dispatch({ type: 'blueprint/removeInstance', payload: { instanceId } });
    if (!blueprintId) return true;
    try {
      const res = await fetch(`${apiBase}/v1/blueprints/${blueprintId}/modules/${instanceId}`, { method: 'DELETE' });
      if (res.ok) {
        options.onRemoteChange?.();
        return true;
      }
      // rollback
      if (backup) dispatch({ type: 'blueprint/addInstance', payload: backup });
    } catch (err) {
      if (backup) dispatch({ type: 'blueprint/addInstance', payload: backup });
      throw err;
    }
    return false;
  }, [apiBase, blueprintId, state.instances, options]);

  const setVariant = useCallback(async (instanceId: string, variantId: string | null) => {
    // optimistic update
    dispatch({ type: 'blueprint/setVariant', payload: { instanceId, variantId } });
    if (!blueprintId) return true;
    try {
      const res = await fetch(`${apiBase}/v1/blueprints/${blueprintId}/modules/${instanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: variantId }),
      });
      if (res.ok) {
        options.onRemoteChange?.();
        return true;
      }
      // server rejected, can't easily get previous variant here — caller should reload
    } catch (err) {
      throw err;
    }
    return false;
  }, [apiBase, blueprintId, options]);

  return {
    blueprint: state,
    addInstance,
    removeInstance,
    setVariant,
    dispatch,
  } as const;
}

export default useBlueprint;
