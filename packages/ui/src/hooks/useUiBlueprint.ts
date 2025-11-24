import { useCallback } from 'react';
import type { ModuleInstance } from '@frigate/api-client';
import { useFrigateStore } from '@frigate/state';

type UseUiBlueprintOptions = {
  apiBase?: string;
  blueprintId: string;
  onRemoteChange?: () => void;
};

export function useUiBlueprint(options: UseUiBlueprintOptions) {
  const apiBase = options.apiBase ?? '';
  const blueprintId = options.blueprintId;

  // blueprint selector remains reactive
  const blueprint = useFrigateStore((s) => (s.uiBlueprints ? s.uiBlueprints[blueprintId] : undefined));

  // Select required store actions from the single shared store
  const openUiBlueprintAction = useFrigateStore((s) => s.openUiBlueprint);
  const uiAddInstanceAction = useFrigateStore((s) => s.uiAddInstance);
  const uiRemoveInstanceAction = useFrigateStore((s) => s.uiRemoveInstance);
  const uiSetInstanceVariantAction = useFrigateStore((s) => s.uiSetInstanceVariant);

  const ensureOpen = useCallback((initial?: Partial<Record<string, unknown>>) => {
    // rely on the store action; tests/components must use the shared singleton store
    openUiBlueprintAction(blueprintId, initial as any);
  }, [blueprintId, openUiBlueprintAction]);

  const addInstance = useCallback(async (slotTypeId: string, variantId?: string | null) => {
    try {
      // addInstanceRemote handles both optimistic add and remote call
      const created = await useFrigateStore.getState().addInstanceRemote(apiBase, blueprintId, slotTypeId, variantId);
      options.onRemoteChange?.();
      return created as ModuleInstance;
    } catch (err) {
      // rollback handled in store helper
      throw err;
    }
  }, [apiBase, blueprintId, options, uiRemoveInstanceAction]);

  const removeInstance = useCallback(async (instanceId: string) => {
    try {
      const ok = await useFrigateStore.getState().removeInstanceRemote(apiBase, blueprintId, instanceId);
      if (ok) options.onRemoteChange?.();
      return ok;
    } catch (err) {
      throw err;
    }
  }, [apiBase, blueprintId, options, uiRemoveInstanceAction]);

  const setVariant = useCallback(async (instanceId: string, variantId: string | null) => {
    try {
      const ok = await useFrigateStore.getState().setInstanceVariantRemote(apiBase, blueprintId, instanceId, variantId);
      if (ok) options.onRemoteChange?.();
      return ok;
    } catch (err) {
      throw err;
    }
  }, [apiBase, blueprintId, options, uiSetInstanceVariantAction]);

  return {
    blueprint,
    ensureOpen,
    addInstance,
    removeInstance,
    setVariant,
  } as const;
}

export default useUiBlueprint;
