import { useCallback, useState } from 'react';
import type { ModuleSlot, ModuleVariant } from '@frigate/api-client';

function normalizeSlot(slot: any): ModuleSlot {
  // Ensure legacy fields exist for backward compatibility with UI that expects them
  const normalized = { ...slot } as any;
  normalized.groups = Array.isArray(slot.groups) ? slot.groups : [];
  normalized.description = slot.description ?? slot.desc ?? '';
  normalized.desc = normalized.desc ?? normalized.description;
  normalized.extendedDescription = slot.extendedDescription ?? slot.extended_desc ?? slot.extendedDescription ?? '';
  normalized.extended_desc = normalized.extended_desc ?? normalized.extendedDescription;
  normalized.hasVariants = slot.hasVariants ?? slot.has_varients ?? false;
  normalized.has_varients = normalized.has_varients ?? normalized.hasVariants;
  return normalized as ModuleSlot;
}

function normalizeVariant(variant: any): ModuleVariant {
  const normalized = { ...variant } as any;
  normalized.description = variant.description ?? variant.desc ?? '';
  normalized.desc = normalized.desc ?? normalized.description;
  return normalized as ModuleVariant;
}

export function useCatalog(apiBase = '') {
  const [slotsById, setSlotsById] = useState<Record<string, ModuleSlot>>({});
  const [variantsById, setVariantsById] = useState<Record<string, ModuleVariant>>({});
  const [slotsList, setSlotsList] = useState<ModuleSlot[]>([]);

  const fetchJson = useCallback(async (path: string) => {
    const url = apiBase ? `${apiBase}${path}` : path;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
    return res.json();
  }, [apiBase]);

  const getModuleSlots = useCallback(async () => {
    const data = await fetchJson('/v1/catalog/module-slots');
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
    setSlotsById(prev => ({ ...prev, ...byId }));
    return slotDetails;
  }, [fetchJson]);

  const getModuleSlot = useCallback(async (slotId: string) => {
    if (slotsById[slotId]) return slotsById[slotId];
    const data = await fetchJson(`/v1/catalog/module-slots/${slotId}`);
    const slot = normalizeSlot(data);
    setSlotsById(prev => ({ ...prev, [slotId]: slot }));
    return slot;
  }, [fetchJson, slotsById]);

  const getModuleVariants = useCallback(async (slotId: string) => {
    // If we already have variants for this slot in cache, return those
    const existing = Object.values(variantsById).filter(v => v.type === slotId);
    if (existing.length > 0) return existing;
    const data = await fetchJson(`/v1/catalog/modules/${slotId}`);
    const list = (data.variants || []).map(normalizeVariant);
    const byId: Record<string, ModuleVariant> = {};
    for (const v of list) byId[v.id] = v;
    setVariantsById(prev => ({ ...prev, ...byId }));
    return list;
  }, [fetchJson, variantsById]);

  const getModuleVariant = useCallback(async (slotId: string, variantId: string) => {
    if (variantsById[variantId]) return variantsById[variantId];
    const data = await fetchJson(`/v1/catalog/modules/${slotId}/${variantId}`);
    const v = normalizeVariant(data);
    setVariantsById(prev => ({ ...prev, [variantId]: v }));
    return v;
  }, [fetchJson, variantsById]);

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
