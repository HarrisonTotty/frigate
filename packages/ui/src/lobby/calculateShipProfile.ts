import type { ShipProfile } from './ShipStatsPanel';

/**
 * Module slot definition with groups
 */
export interface ModuleSlotDef {
  id: string;
  groups?: readonly string[] | string[];
}

/**
 * Module variant data for profile calculation
 */
export interface ModuleVariantData {
  max_shield_strength?: number;
  max_thrust?: number;
  angular_thrust?: number;
  scan_range?: number;
  generated_cooling?: number;
  energy_production?: number;
  detectability_reduction?: number;
  warp_type?: string;
}

/**
 * Installed module instance
 */
export interface ModuleInstanceData {
  module_slot_id: string;
  variant_id?: string | null;
}

/**
 * Configuration for profile calculation maximums
 */
export interface ProfileConfig {
  maxShields: number;
  maxHpBonus: number;
  maxThrust: number;
  maxAngular: number;
  maxOffenseSlots: number;
  totalSlotTypes: number;
  maxScanRange: number;
  maxCooling: number;
  maxPower: number;
  maxStealth: number;
}

/**
 * Default configuration based on Hyperion module data ranges
 */
export const DEFAULT_PROFILE_CONFIG: ProfileConfig = {
  maxShields: 4000,       // Heavy Shield Mk3
  maxHpBonus: 200,        // Reasonable max from modules
  maxThrust: 1800,        // Plasma engines
  maxAngular: 1600,       // Plasma thrusters
  maxOffenseSlots: 10,    // Reasonable max weapon slots
  totalSlotTypes: 18,     // Default total slot types
  maxScanRange: 30000,    // Long-range sensors
  maxCooling: 600,        // Cryogenic cooling
  maxPower: 500,          // High-energy boson reactor
  maxStealth: 0.90,       // Active cloaking field
};

/**
 * Calculate ship capability profile from installed modules
 *
 * Returns normalized 0-1 values for each axis:
 * - Defense: HP bonus + shield strength
 * - Mobility: Thrust + angular thrust
 * - Offense: Count of offense modules
 * - Versatility: Unique module types installed
 * - Utility: Weighted combination of support capabilities
 */
export function calculateShipProfile(
  instances: ModuleInstanceData[],
  slotsById: Record<string, ModuleSlotDef>,
  variantsById: Record<string, ModuleVariantData | Record<string, unknown>>,
  totalHp: number,
  config: Partial<ProfileConfig> = {}
): ShipProfile | undefined {
  const cfg = { ...DEFAULT_PROFILE_CONFIG, ...config };
  if (instances.length === 0) {
    return undefined;
  }

  // Track unique slot types and collect profile data
  const installedSlotTypes = new Set<string>();
  let totalShields = 0;
  let totalThrust = 0;
  let totalAngularThrust = 0;
  let offenseModuleCount = 0;
  let totalScanRange = 0;
  let totalCooling = 0;
  let totalPowerProduction = 0;
  let totalStealthReduction = 0;
  let hasWarpDrive = false;

  for (const inst of instances) {
    const slot = slotsById[inst.module_slot_id];
    if (!slot) continue;

    installedSlotTypes.add(slot.id);

    // Count offense modules
    const isWeapon = Array.isArray(slot.groups) && slot.groups.includes('Offense');
    if (isWeapon) {
      offenseModuleCount++;
    }

    // Collect variant data
    if (inst.variant_id && variantsById[inst.variant_id]) {
      const variant = variantsById[inst.variant_id];

      if (typeof variant.max_shield_strength === 'number') {
        totalShields += variant.max_shield_strength;
      }
      if (typeof variant.max_thrust === 'number') {
        totalThrust += variant.max_thrust;
      }
      if (typeof variant.angular_thrust === 'number') {
        totalAngularThrust += variant.angular_thrust;
      }
      if (typeof variant.scan_range === 'number') {
        totalScanRange += variant.scan_range;
      }
      if (typeof variant.generated_cooling === 'number') {
        totalCooling += variant.generated_cooling;
      }
      if (typeof variant.energy_production === 'number') {
        totalPowerProduction += variant.energy_production;
      }
      if (typeof variant.detectability_reduction === 'number') {
        totalStealthReduction = Math.max(totalStealthReduction, variant.detectability_reduction);
      }
      if (variant.warp_type === 'warp' || variant.warp_type === 'jump') {
        hasWarpDrive = true;
      }
    }
  }

  // Calculate normalized scores
  const defenseScore = Math.min(1, (
    (totalHp / (100 + cfg.maxHpBonus)) * 0.4 +
    (totalShields / cfg.maxShields) * 0.6
  ));

  const mobilityScore = Math.min(1, (
    (totalThrust / cfg.maxThrust) * 0.6 +
    (totalAngularThrust / cfg.maxAngular) * 0.4
  ));

  const offenseScore = Math.min(1, offenseModuleCount / cfg.maxOffenseSlots);

  const versatilityScore = Math.min(1, installedSlotTypes.size / cfg.totalSlotTypes);

  const sensorScore = totalScanRange / cfg.maxScanRange;
  const coolingScore = totalCooling / cfg.maxCooling;
  const powerScore = totalPowerProduction / cfg.maxPower;
  const stealthScore = totalStealthReduction / cfg.maxStealth;
  const warpBonus = hasWarpDrive ? 1 : 0;

  const utilityScore = Math.min(1, (
    sensorScore * 0.25 +
    coolingScore * 0.20 +
    powerScore * 0.25 +
    stealthScore * 0.15 +
    warpBonus * 0.15
  ));

  return {
    defense: defenseScore,
    mobility: mobilityScore,
    offense: offenseScore,
    versatility: versatilityScore,
    utility: utilityScore,
  };
}
