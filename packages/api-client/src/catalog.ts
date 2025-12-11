/**
 * Catalog API client for Frigate module system
 * Provides functions to fetch module slots, variants, and ammunition from the backend.
 * Uses TypeScript types defined in types.ts.
 */
import type {
  ModuleSlot,
  ModuleVariant,
  ModuleSlotsResponse,
  ModuleVariantsResponse,
  Ammunition,
  AmmoCategory,
} from './types';

// API endpoint paths (server exposes /v1/catalog/...)
const MODULE_SLOTS_ENDPOINT = '/v1/catalog/module-slots';
const MODULE_SLOT_DETAIL = (slotId: string) => `/v1/catalog/module-slots/${slotId}`;
const MODULE_VARIANTS_FOR_SLOT = (slotId: string) => `/v1/catalog/modules/${slotId}`;
const MODULE_VARIANT_DETAIL = (slotId: string, variantId: string) => `/v1/catalog/modules/${slotId}/${variantId}`;

// Ammunition API endpoint paths
const AMMO_CATEGORIES_ENDPOINT = '/v1/catalog/ammo';
const AMMO_CATEGORY_LIST = (category: AmmoCategory) => `/v1/catalog/ammo/${category}`;
const AMMO_DETAIL = (category: AmmoCategory, ammoId: string) => `/v1/catalog/ammo/${category}/${ammoId}`;

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

  // ============================================================================
  // Ammunition Catalog Methods
  // ============================================================================

  /**
   * Get all ammunition categories
   * @returns Array of category identifiers ('kinetic', 'missiles', 'torpedos')
   */
  public async getAmmoCategories(): Promise<AmmoCategory[]> {
    const response = await this.http.get(AMMO_CATEGORIES_ENDPOINT);
    return response as AmmoCategory[];
  }

  /**
   * Get all ammunition IDs in a category
   * @param category - The ammunition category
   * @returns Array of ammunition IDs
   */
  public async getAmmoInCategory(category: AmmoCategory): Promise<string[]> {
    const response = await this.http.get(AMMO_CATEGORY_LIST(category));
    return response as string[];
  }

  /**
   * Get detailed ammunition information
   * @param category - The ammunition category
   * @param ammoId - The ammunition ID
   * @returns Ammunition details
   */
  public async getAmmoDetails(category: AmmoCategory, ammoId: string): Promise<Ammunition> {
    const response = await this.http.get(AMMO_DETAIL(category, ammoId));
    // Normalize and add category field if not present
    return {
      ...response,
      category,
    } as Ammunition;
  }

  /**
   * Get all ammunition across all categories with full details
   * @returns Array of all ammunition with complete details
   */
  public async getAllAmmunition(): Promise<Ammunition[]> {
    const categories = await this.getAmmoCategories();
    const allAmmo: Ammunition[] = [];

    for (const category of categories) {
      const ammoIds = await this.getAmmoInCategory(category);
      const ammoDetails = await Promise.all(
        ammoIds.map(async (ammoId) => this.getAmmoDetails(category, ammoId))
      );
      allAmmo.push(...ammoDetails);
    }

    return allAmmo;
  }
}

// ============================================================================
// Standalone Ammunition Functions (for use without CatalogResource)
// ============================================================================

/**
 * Fetch ammunition categories from the backend
 * @param apiBase - Base URL for the API (e.g., 'http://localhost:3000')
 * @returns Array of category identifiers
 */
export async function fetchAmmoCategories(apiBase = ''): Promise<AmmoCategory[]> {
  const url = apiBase ? `${apiBase}${AMMO_CATEGORIES_ENDPOINT}` : AMMO_CATEGORIES_ENDPOINT;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ammo categories: ${res.status}`);
  return res.json();
}

/**
 * Fetch ammunition IDs in a category
 * @param category - The ammunition category
 * @param apiBase - Base URL for the API
 * @returns Array of ammunition IDs
 */
export async function fetchAmmoInCategory(
  category: AmmoCategory,
  apiBase = ''
): Promise<string[]> {
  const url = apiBase ? `${apiBase}${AMMO_CATEGORY_LIST(category)}` : AMMO_CATEGORY_LIST(category);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ammo in ${category}: ${res.status}`);
  return res.json();
}

/**
 * Fetch detailed ammunition information
 * @param category - The ammunition category
 * @param ammoId - The ammunition ID
 * @param apiBase - Base URL for the API
 * @returns Ammunition details
 */
export async function fetchAmmoDetails(
  category: AmmoCategory,
  ammoId: string,
  apiBase = ''
): Promise<Ammunition> {
  const url = apiBase ? `${apiBase}${AMMO_DETAIL(category, ammoId)}` : AMMO_DETAIL(category, ammoId);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ammo ${ammoId}: ${res.status}`);
  const data = await res.json();
  // Normalize and add category field if not present
  return {
    ...data,
    category,
  } as Ammunition;
}

/**
 * Fetch all ammunition across all categories with full details
 * @param apiBase - Base URL for the API
 * @returns Array of all ammunition with complete details
 */
export async function fetchAllAmmunition(apiBase = ''): Promise<Ammunition[]> {
  const categories = await fetchAmmoCategories(apiBase);
  const allAmmo: Ammunition[] = [];

  for (const category of categories) {
    const ammoIds = await fetchAmmoInCategory(category, apiBase);
    const ammoDetails = await Promise.all(
      ammoIds.map(async (ammoId) => fetchAmmoDetails(category, ammoId, apiBase))
    );
    allAmmo.push(...ammoDetails);
  }

  return allAmmo;
}
