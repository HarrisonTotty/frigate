/**
 * Inventory State Management Store
 *
 * Zustand store for managing ship inventory (ammunition and cargo)
 * during the inventory workspace step. Tracks selections, calculates
 * totals, and enforces weight/credit constraints.
 */

import { create } from "zustand";
import type { Ammunition, InventoryItem } from "@frigate/api-client";

/**
 * Inventory store state interface
 */
export interface InventoryState {
  /** Current ammunition selections: ammoId -> quantity */
  ammunition: Map<string, number>;

  /** Ammunition catalog loaded from API */
  ammoCatalog: Ammunition[];

  /** Ship's remaining weight capacity (from design step) */
  availableWeight: number;

  /** Team's remaining credits (after ship construction) */
  availableCredits: number;

  /** Set of compatible kinetic ammo type keys ("ammo_type:ammo_size") */
  compatibleAmmoTypes: Set<string>;

  /** Whether ship has missile launchers installed */
  compatibleMissiles: boolean;

  /** Whether ship has torpedo tubes installed */
  compatibleTorpedos: boolean;

  // Actions
  setAmmoCatalog: (catalog: Ammunition[]) => void;
  setConstraints: (weight: number, credits: number) => void;
  setCompatibility: (ammoTypes: Set<string>, hasMissiles: boolean, hasTorpedos: boolean) => void;

  addAmmo: (ammoId: string, quantity?: number) => void;
  removeAmmo: (ammoId: string, quantity?: number) => void;
  setAmmoQuantity: (ammoId: string, quantity: number) => void;
  clearInventory: () => void;

  // Computed values
  getTotalWeight: () => number;
  getTotalCost: () => number;
  getInventoryItems: () => InventoryItem[];
  isOverWeight: () => boolean;
  isOverBudget: () => boolean;
  canAddAmmo: (ammoId: string, quantity?: number) => boolean;

  /** Get ammunition by ID from catalog */
  getAmmoById: (ammoId: string) => Ammunition | undefined;

  /** Get current quantity of a specific ammo type */
  getAmmoQuantity: (ammoId: string) => number;

  /** Check if a specific ammunition is compatible with installed weapons */
  isAmmoCompatible: (ammoId: string) => boolean;
}

/**
 * Inventory store for managing ship cargo during inventory workspace
 */
export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  ammunition: new Map(),
  ammoCatalog: [],
  availableWeight: 0,
  availableCredits: 0,
  compatibleAmmoTypes: new Set(),
  compatibleMissiles: false,
  compatibleTorpedos: false,

  /**
   * Set the ammunition catalog from API
   */
  setAmmoCatalog: (catalog) => set({ ammoCatalog: catalog }),

  /**
   * Set weight and credit constraints from design step
   */
  setConstraints: (weight, credits) =>
    set({
      availableWeight: weight,
      availableCredits: credits,
    }),

  /**
   * Set weapon compatibility info based on installed modules
   */
  setCompatibility: (ammoTypes, hasMissiles, hasTorpedos) =>
    set({
      compatibleAmmoTypes: ammoTypes,
      compatibleMissiles: hasMissiles,
      compatibleTorpedos: hasTorpedos,
    }),

  /**
   * Add ammunition to inventory
   * @param ammoId - ID of the ammunition to add
   * @param quantity - Number of units to add (default: 1)
   */
  addAmmo: (ammoId, quantity = 1) => {
    const state = get();
    if (!state.canAddAmmo(ammoId, quantity)) return;

    const current = state.ammunition.get(ammoId) || 0;
    const newAmmo = new Map(state.ammunition);
    newAmmo.set(ammoId, current + quantity);
    set({ ammunition: newAmmo });
  },

  /**
   * Remove ammunition from inventory
   * @param ammoId - ID of the ammunition to remove
   * @param quantity - Number of units to remove (default: 1)
   */
  removeAmmo: (ammoId, quantity = 1) => {
    const state = get();
    const current = state.ammunition.get(ammoId) || 0;
    const newAmmo = new Map(state.ammunition);

    if (current <= quantity) {
      newAmmo.delete(ammoId);
    } else {
      newAmmo.set(ammoId, current - quantity);
    }
    set({ ammunition: newAmmo });
  },

  /**
   * Set exact quantity for ammunition
   * @param ammoId - ID of the ammunition
   * @param quantity - New quantity (0 or negative removes the item)
   */
  setAmmoQuantity: (ammoId, quantity) => {
    const newAmmo = new Map(get().ammunition);
    if (quantity <= 0) {
      newAmmo.delete(ammoId);
    } else {
      newAmmo.set(ammoId, quantity);
    }
    set({ ammunition: newAmmo });
  },

  /**
   * Clear all ammunition from inventory
   */
  clearInventory: () => set({ ammunition: new Map() }),

  /**
   * Calculate total weight of loaded ammunition
   */
  getTotalWeight: () => {
    const state = get();
    let total = 0;
    state.ammunition.forEach((qty, ammoId) => {
      const ammo = state.ammoCatalog.find((a) => a.id === ammoId);
      if (ammo) total += ammo.weight * qty;
    });
    return total;
  },

  /**
   * Calculate total cost of loaded ammunition
   */
  getTotalCost: () => {
    const state = get();
    let total = 0;
    state.ammunition.forEach((qty, ammoId) => {
      const ammo = state.ammoCatalog.find((a) => a.id === ammoId);
      if (ammo) total += ammo.cost * qty;
    });
    return total;
  },

  /**
   * Get inventory items as array for submission
   */
  getInventoryItems: () => {
    const items: InventoryItem[] = [];
    get().ammunition.forEach((quantity, itemId) => {
      items.push({ itemId, quantity });
    });
    return items;
  },

  /**
   * Check if current cargo exceeds weight capacity
   */
  isOverWeight: () => {
    const state = get();
    return state.getTotalWeight() > state.availableWeight;
  },

  /**
   * Check if current cargo exceeds credit budget
   */
  isOverBudget: () => {
    const state = get();
    return state.getTotalCost() > state.availableCredits;
  },

  /**
   * Check if adding ammunition is allowed (within constraints)
   * @param ammoId - ID of the ammunition to check
   * @param quantity - Number of units to potentially add (default: 1)
   */
  canAddAmmo: (ammoId, quantity = 1) => {
    const state = get();
    const ammo = state.ammoCatalog.find((a) => a.id === ammoId);
    if (!ammo) return false;

    const currentWeight = state.getTotalWeight();
    const currentCost = state.getTotalCost();
    const addedWeight = ammo.weight * quantity;
    const addedCost = ammo.cost * quantity;

    return (
      currentWeight + addedWeight <= state.availableWeight &&
      currentCost + addedCost <= state.availableCredits
    );
  },

  /**
   * Get ammunition by ID from catalog
   */
  getAmmoById: (ammoId) => {
    return get().ammoCatalog.find((a) => a.id === ammoId);
  },

  /**
   * Get current quantity of a specific ammo type
   */
  getAmmoQuantity: (ammoId) => {
    return get().ammunition.get(ammoId) || 0;
  },

  /**
   * Check if ammunition is compatible with installed weapons
   */
  isAmmoCompatible: (ammoId) => {
    const state = get();
    const ammo = state.ammoCatalog.find((a) => a.id === ammoId);
    if (!ammo) return false;

    if (ammo.category === "kinetic") {
      const key = `${ammo.ammo_type}:${ammo.ammo_size}`;
      return state.compatibleAmmoTypes.has(key);
    }

    if (ammo.category === "missiles") {
      return state.compatibleMissiles;
    }

    if (ammo.category === "torpedos") {
      return state.compatibleTorpedos;
    }

    return true;
  },
}));

export default useInventoryStore;
