/**
 * Ammunition Compatibility Utilities
 *
 * Utilities for determining ammunition compatibility with installed weapon modules.
 * Used by the Inventory Workspace to filter and display ammunition based on
 * what weapons the ship has installed.
 */
import type { ModuleInstance, ModuleVariant, Ammunition } from "@frigate/api-client";

/**
 * Weapon compatibility information extracted from installed modules
 */
export interface WeaponCompatibility {
  /** Set of "ammo_type:ammo_size" strings for kinetic weapons */
  kineticAmmoTypes: Set<string>;
  /** Whether ship has missile launchers installed */
  hasMissileLaunchers: boolean;
  /** Whether ship has torpedo tubes installed */
  hasTorpedoTubes: boolean;
  /** Map of ammo type key to weapon names for tooltip display */
  weaponsByAmmoType: Map<string, string[]>;
}

/**
 * Result of compatibility check for an ammunition type
 */
export interface CompatibilityResult {
  /** Whether the ammunition is compatible with installed weapons */
  compatible: boolean;
  /** Human-readable reason for incompatibility */
  reason?: string;
  /** Names of compatible weapons (for kinetic ammo) */
  weapons?: string[];
}

/**
 * Extract weapon compatibility from installed module variants
 *
 * Analyzes the installed modules to determine what ammunition types
 * the ship can use. This includes:
 * - Kinetic weapons with specific ammo_type and ammo_size
 * - Missile launchers (detected by slot ID or variant name)
 * - Torpedo tubes (detected by slot ID or variant name)
 *
 * @param modules - Array of installed module instances
 * @param variantsById - Record mapping variant IDs to variant data
 * @returns WeaponCompatibility object with all detected weapon capabilities
 */
export function extractWeaponCompatibility(
  modules: ModuleInstance[],
  variantsById: Record<string, ModuleVariant>
): WeaponCompatibility {
  const compatibility: WeaponCompatibility = {
    kineticAmmoTypes: new Set(),
    hasMissileLaunchers: false,
    hasTorpedoTubes: false,
    weaponsByAmmoType: new Map(),
  };

  for (const module of modules) {
    if (!module.variant_id) continue;
    const variant = variantsById[module.variant_id] as unknown as Record<string, unknown>;
    if (!variant) continue;

    // Check for kinetic weapons with ammo_type and ammo_size
    if (variant.ammo_type && variant.ammo_size) {
      const key = `${variant.ammo_type}:${variant.ammo_size}`;
      compatibility.kineticAmmoTypes.add(key);

      // Track weapon names for this ammo type
      const weapons = compatibility.weaponsByAmmoType.get(key) || [];
      const variantName = variant.name as string;
      if (variantName && !weapons.includes(variantName)) {
        weapons.push(variantName);
      }
      compatibility.weaponsByAmmoType.set(key, weapons);
    }

    // Check for missile launchers (slot type or variant name pattern)
    const slotId = module.module_slot_id.toLowerCase();
    const variantName = ((variant.name as string) || "").toLowerCase();
    if (slotId.includes("missile") || variantName.includes("missile")) {
      compatibility.hasMissileLaunchers = true;
    }

    // Check for torpedo tubes
    if (slotId.includes("torpedo") || variantName.includes("torpedo")) {
      compatibility.hasTorpedoTubes = true;
    }
  }

  return compatibility;
}

/**
 * Check if ammunition is compatible with installed weapons
 *
 * Determines whether a specific ammunition type can be used by the ship
 * based on its installed weapons.
 *
 * @param ammo - The ammunition to check
 * @param compatibility - WeaponCompatibility from extractWeaponCompatibility
 * @returns CompatibilityResult with compatible status, reason, and weapon names
 */
export function checkAmmoCompatibility(
  ammo: Ammunition,
  compatibility: WeaponCompatibility
): CompatibilityResult {
  if (ammo.category === "kinetic") {
    const key = `${ammo.ammo_type}:${ammo.ammo_size}`;
    const weapons = compatibility.weaponsByAmmoType.get(key);
    if (weapons && weapons.length > 0) {
      return { compatible: true, weapons };
    }
    return {
      compatible: false,
      reason: `No ${ammo.ammo_size} ${ammo.ammo_type} weapons installed`,
    };
  }

  if (ammo.category === "missiles") {
    if (compatibility.hasMissileLaunchers) {
      return { compatible: true };
    }
    return { compatible: false, reason: "No missile launchers installed" };
  }

  if (ammo.category === "torpedos") {
    if (compatibility.hasTorpedoTubes) {
      return { compatible: true };
    }
    return { compatible: false, reason: "No torpedo tubes installed" };
  }

  // Unknown category - assume compatible
  return { compatible: true };
}

/**
 * Get incompatibility reason for ammunition
 *
 * Convenience function that returns only the reason string (or undefined).
 * Useful for displaying in tooltips and cards.
 *
 * @param ammo - The ammunition to check
 * @param compatibility - WeaponCompatibility from extractWeaponCompatibility
 * @returns Reason string if incompatible, undefined if compatible
 */
export function getIncompatibilityReason(
  ammo: Ammunition,
  compatibility: WeaponCompatibility
): string | undefined {
  const result = checkAmmoCompatibility(ammo, compatibility);
  return result.compatible ? undefined : result.reason;
}

/**
 * Get compatible weapon names for ammunition
 *
 * Returns the names of installed weapons that can use this ammunition.
 * Useful for displaying in tooltips.
 *
 * @param ammo - The ammunition to check
 * @param compatibility - WeaponCompatibility from extractWeaponCompatibility
 * @returns Array of weapon names, empty if no compatible weapons
 */
export function getCompatibleWeapons(
  ammo: Ammunition,
  compatibility: WeaponCompatibility
): string[] {
  if (ammo.category === "kinetic") {
    const key = `${ammo.ammo_type}:${ammo.ammo_size}`;
    return compatibility.weaponsByAmmoType.get(key) || [];
  }
  // For missiles/torpedos, we don't track individual weapon names
  return [];
}

/**
 * Filter ammunition list by compatibility
 *
 * Returns only ammunition that is compatible with installed weapons.
 *
 * @param ammunition - Array of all ammunition
 * @param compatibility - WeaponCompatibility from extractWeaponCompatibility
 * @returns Filtered array of compatible ammunition
 */
export function filterCompatibleAmmo(
  ammunition: Ammunition[],
  compatibility: WeaponCompatibility
): Ammunition[] {
  return ammunition.filter((ammo) => {
    const result = checkAmmoCompatibility(ammo, compatibility);
    return result.compatible;
  });
}
