/**
 * Catalog API client for Frigate module system (Phase 1.2)
 * Provides functions to fetch module slots and variants from the backend.
 * Uses new TypeScript types defined in types.ts.
 */
import type {
  ModuleSlot,
  ModuleVariant,
  ModuleSlotsResponse,
  ModuleVariantsResponse
} from './types';

// API endpoint paths (server exposes /v1/catalog/...)
const MODULE_SLOTS_ENDPOINT = '/v1/catalog/module-slots';
const MODULE_SLOT_DETAIL = (slotId: string) => `/v1/catalog/module-slots/${slotId}`;
const MODULE_VARIANTS_FOR_SLOT = (slotId: string) => `/v1/catalog/modules/${slotId}`;
const MODULE_VARIANT_DETAIL = (slotId: string, variantId: string) => `/v1/catalog/modules/${slotId}/${variantId}`;

/**
 * Fetch all module slots from the backend.
 */
export async function fetchModuleSlots(): Promise<ModuleSlot[]> {
  const res = await fetch(MODULE_SLOTS_ENDPOINT);
  if (!res.ok) throw new Error('Failed to fetch module slots');
  const data: { slots: string[] } = await res.json();
  // Fetch details for each slot ID
  const slotDetails = await Promise.all(
    data.slots.map(async (slotId) => {
      const detailRes = await fetch(MODULE_SLOT_DETAIL(slotId));
      if (!detailRes.ok) throw new Error(`Failed to fetch module slot: ${slotId}`);
      const slot = await detailRes.json();
      // Normalize fields
      return {
        ...slot,
        groups: Array.isArray(slot.groups) ? slot.groups : [],
        description: slot.description ?? slot.desc ?? '',
        extendedDescription: slot.extendedDescription ?? slot.extended_desc ?? '',
        hasVariants: typeof slot.hasVariants === 'boolean' ? slot.hasVariants : !!slot.has_varients,
      };
    })
  );
  return slotDetails;
}

/**
 * Fetch all module variants from the backend.
 */
export async function fetchModuleVariants(): Promise<ModuleVariant[]> {
  // This helper isn't used often; fetch all slots then their variants if needed.
  throw new Error('fetchModuleVariants() not implemented: use CatalogResource.getModuleVariants(slotId)');
}


/**
 * Catalog API resource for module slots and variants (Phase 1.4)
 */
export class CatalogResource {
  public constructor(private readonly http: { get: Function }) {}

  /**
   * Get all module slot types
   */
  public async getModuleSlots(): Promise<ModuleSlot[]> {
    const response = await this.http.get(MODULE_SLOTS_ENDPOINT);
    // assume http.get returns already-parsed JSON
    const data = (response as unknown) as { slots: string[] };
    // Fetch details for each slot ID and normalize
    const slotDetails = await Promise.all(
      data.slots.map(async (slotId) => {
        const slot = await this.http.get(MODULE_SLOT_DETAIL(slotId));
        return {
          ...slot,
          groups: Array.isArray(slot.groups) ? slot.groups : [],
          description: slot.description ?? slot.desc ?? '',
          extendedDescription: slot.extendedDescription ?? slot.extended_desc ?? '',
          hasVariants: typeof slot.hasVariants === 'boolean' ? slot.hasVariants : !!slot.has_varients,
        };
      })
    );
    return slotDetails;
  }

  /**
   * Get a specific module slot type
   */
  public async getModuleSlot(slotId: string): Promise<ModuleSlot> {
    const response = await this.http.get(MODULE_SLOT_DETAIL(slotId));
    return response as ModuleSlot;
  }

  /**
   * Get all variants for a module slot type
   */
  public async getModuleVariants(slotId: string): Promise<ModuleVariant[]> {
    const response = await this.http.get(MODULE_VARIANTS_FOR_SLOT(slotId));
    const data = (response as unknown) as ModuleVariantsResponse;
    return Array.from(data.variants);
  }

  /**
   * Get a specific module variant
   */
  public async getModuleVariant(slotId: string, variantId: string): Promise<ModuleVariant> {
    const response = await this.http.get(MODULE_VARIANT_DETAIL(slotId, variantId));
    return response as ModuleVariant;
  }
}
