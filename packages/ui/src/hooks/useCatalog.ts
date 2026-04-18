import { useCallback, useState } from "react";
import type { ModuleSlot, ModuleVariant } from "@frigate/api-client";

function normalizeSlot(slot: Record<string, unknown>): ModuleSlot {
  // Normalize API response fields to consistent camelCase names.
  // The API may return snake_case (has_varients) or camelCase (hasVariants).
  // After normalization, consumers should use the camelCase versions only.
  const normalized = { ...slot } as Record<string, unknown>;
  normalized.groups = Array.isArray(slot.groups) ? slot.groups : [];
  normalized.description = slot.description ?? slot.desc ?? "";
  normalized.desc = normalized.description; // Keep for backward compat
  normalized.extendedDescription = slot.extendedDescription ?? slot.extended_desc ?? "";
  normalized.extended_desc = normalized.extendedDescription; // Keep for backward compat
  // hasVariants is the canonical field - normalize from legacy "has_varients" (note typo in API)
  // Use typeof check because the API may only send one field, and we need to handle explicit false values
  normalized.hasVariants =
    typeof slot.hasVariants === "boolean" ? slot.hasVariants : !!slot.has_varients;
  normalized.has_varients = normalized.hasVariants; // Keep for backward compat
  return normalized as unknown as ModuleSlot;
}

function normalizeVariant(variant: Record<string, unknown>): ModuleVariant {
  const normalized = { ...variant } as Record<string, unknown>;
  normalized.description = variant.description ?? variant.desc ?? "";
  normalized.desc = normalized.desc ?? normalized.description;
  return normalized as unknown as ModuleVariant;
}

export function useCatalog(apiBase = "") {
  const [slotsById, setSlotsById] = useState<Record<string, ModuleSlot>>({});
  const [variantsById, setVariantsById] = useState<Record<string, ModuleVariant>>({});
  const [slotsList, setSlotsList] = useState<ModuleSlot[]>([]);

  const fetchJson = useCallback(
    async (path: string) => {
      const url = apiBase ? `${apiBase}${path}` : path;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
      return res.json();
    },
    [apiBase]
  );

  const getModuleSlots = useCallback(async () => {
    const data = await fetchJson("/v1/catalog/module-slots");
    // data.slots is an array of slot IDs
    const slotDetails = await Promise.all(
      (data.slots || []).map(async (slotId: string) => {
        const slotData = await fetchJson(`/v1/catalog/module-slots/${slotId}`);
        return normalizeSlot(slotData);
      })
    );
    const byId: Record<string, ModuleSlot> = {};
    for (const s of slotDetails) byId[s.id] = s;
    setSlotsList(slotDetails);
    setSlotsById((prev) => ({ ...prev, ...byId }));
    return slotDetails;
  }, [fetchJson]);

  const getModuleSlot = useCallback(
    async (slotId: string) => {
      if (slotsById[slotId]) return slotsById[slotId];
      const data = await fetchJson(`/v1/catalog/module-slots/${slotId}`);
      const slot = normalizeSlot(data);
      setSlotsById((prev) => ({ ...prev, [slotId]: slot }));
      return slot;
    },
    [fetchJson, slotsById]
  );

  const getModuleVariants = useCallback(
    async (slotId: string) => {
      // If we already have variants for this slot in cache, return those
      const existing = Object.values(variantsById).filter((v) => v.type === slotId);
      if (existing.length > 0) return existing;

      // Fetch the list of variant IDs
      const data = await fetchJson(`/v1/catalog/modules/${slotId}`);

      // data.variants is an array of variant IDs (strings), not variant objects
      // We need to fetch each variant's details
      const variantIds = data.variants || [];
      const variantDetails = await Promise.all(
        variantIds.map(async (variantId: string) => {
          const variantData = await fetchJson(`/v1/catalog/modules/${slotId}/${variantId}`);
          return normalizeVariant({ ...variantData, type: slotId });
        })
      );

      const byId: Record<string, ModuleVariant> = {};
      for (const v of variantDetails) byId[v.id] = v;
      setVariantsById((prev) => ({ ...prev, ...byId }));
      return variantDetails;
    },
    [fetchJson, variantsById]
  );

  const getModuleVariant = useCallback(
    async (slotId: string, variantId: string) => {
      if (variantsById[variantId]) return variantsById[variantId];
      const data = await fetchJson(`/v1/catalog/modules/${slotId}/${variantId}`);
      const v = normalizeVariant(data);
      setVariantsById((prev) => ({ ...prev, [variantId]: v }));
      return v;
    },
    [fetchJson, variantsById]
  );

  return {
    // caches
    slotsById,
    variantsById,
    slotsList,
    // getters
    getModuleSlots,
    getModuleSlot,
    getModuleVariants,
    getModuleVariant,
  };
}

export default useCatalog;
