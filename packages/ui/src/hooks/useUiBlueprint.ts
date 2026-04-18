import { useCallback } from "react";
import type { ModuleInstance } from "@frigate/api-client";
import { useFrigateStore } from "@frigate/state";

type UseUiBlueprintOptions = {
  apiBase?: string;
  blueprintId: string;
  onRemoteChange?: () => void;
};

export function useUiBlueprint(options: UseUiBlueprintOptions) {
  const apiBase = options.apiBase ?? "";
  const blueprintId = options.blueprintId;

  // blueprint selector remains reactive
  const blueprint = useFrigateStore((s) =>
    s.uiBlueprints ? s.uiBlueprints[blueprintId] : undefined
  );

  // Select required store actions from the single shared store
  const openUiBlueprintAction = useFrigateStore((s) => s.openUiBlueprint);

  const ensureOpen = useCallback(
    (initial?: Partial<Record<string, unknown>>) => {
      // rely on the store action; tests/components must use the shared singleton store
      openUiBlueprintAction(blueprintId, initial as Parameters<typeof openUiBlueprintAction>[1]);
    },
    [blueprintId, openUiBlueprintAction]
  );

  const addInstance = useCallback(
    async (slotTypeId: string, variantId?: string | null) => {
      // addInstanceRemote handles both optimistic add and remote call
      const created = await useFrigateStore
        .getState()
        .addInstanceRemote(apiBase, blueprintId, slotTypeId, variantId);
      options.onRemoteChange?.();
      return created as ModuleInstance;
    },
    [apiBase, blueprintId, options]
  );

  const removeInstance = useCallback(
    async (instanceId: string) => {
      const ok = await useFrigateStore
        .getState()
        .removeInstanceRemote(apiBase, blueprintId, instanceId);
      if (ok) options.onRemoteChange?.();
      return ok;
    },
    [apiBase, blueprintId, options]
  );

  const setVariant = useCallback(
    async (instanceId: string, variantId: string | null) => {
      const ok = await useFrigateStore
        .getState()
        .setInstanceVariantRemote(apiBase, blueprintId, instanceId, variantId);
      if (ok) options.onRemoteChange?.();
      return ok;
    },
    [apiBase, blueprintId, options]
  );

  return {
    blueprint,
    ensureOpen,
    addInstance,
    removeInstance,
    setVariant,
  } as const;
}

export default useUiBlueprint;
