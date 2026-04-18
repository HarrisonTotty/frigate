/**
 * Ship Stats Panel Component
 *
 * Displays aggregate ship statistics calculated from all installed modules.
 * Shows power generation/consumption, propulsion, weapons counts, and other
 * performance metrics.
 */

import React, { useMemo } from "react";

/**
 * Module variant with stats
 */
export interface ModuleVariant {
  id: string;
  name: string;
  description: string;
  cost: number;
  stats: Record<string, unknown>;
}

/**
 * Installed ship module
 */
export interface ShipModule {
  module_id: string;
  kind?: string | null;
}

/**
 * Ship class information
 */
export interface ShipClass {
  id: string;
  name: string;
  max_weight: number;
  max_modules: number;
  base_hp: number;
}

/**
 * Aggregate ship statistics
 */
export interface AggregateStats {
  // Power
  powerGeneration: number;
  powerConsumption: number;
  powerCapacity: number;

  // Propulsion
  totalThrust: number;

  // Weapons
  energyWeaponCount: number;
  kineticWeaponCount: number;
  missileWeaponCount: number;

  // Defense
  totalArmor: number;
  totalShields: number;
  countermeasureCount: number;

  // Other
  totalWeight: number;
  coolingCapacity: number;
  heatGeneration: number;
}

/**
 * Props for ShipStatsPanel component
 */
export interface ShipStatsPanelProps {
  /** List of installed modules */
  installedModules: ShipModule[];
  /** Map of module variant data loaded from API */
  moduleVariants: Map<string, ModuleVariant>;
  /** Ship class for baseline comparison */
  shipClass: ShipClass;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Calculate aggregate statistics from installed modules
 */
function calculateAggregateStats(
  installedModules: ShipModule[],
  moduleVariants: Map<string, ModuleVariant>
): AggregateStats {
  const stats: AggregateStats = {
    powerGeneration: 0,
    powerConsumption: 0,
    powerCapacity: 0,
    totalThrust: 0,
    energyWeaponCount: 0,
    kineticWeaponCount: 0,
    missileWeaponCount: 0,
    totalArmor: 0,
    totalShields: 0,
    countermeasureCount: 0,
    totalWeight: 0,
    coolingCapacity: 0,
    heatGeneration: 0,
  };

  installedModules.forEach((module) => {
    // Get the variant data
    const variantKey = module.kind ? `${module.module_id}:${module.kind}` : module.module_id;
    const variant = moduleVariants.get(variantKey);

    if (!variant) return;

    const variantStats = variant.stats || {};

    // Power generation (from power cores)
    if (variantStats.production !== undefined) {
      stats.powerGeneration += Number(variantStats.production) || 0;
    }
    if (variantStats.max_energy !== undefined) {
      stats.powerCapacity += Number(variantStats.max_energy) || 0;
    }

    // Power consumption (from engines, weapons, etc.)
    if (variantStats.energy_consumption !== undefined) {
      stats.powerConsumption += Number(variantStats.energy_consumption) || 0;
    }

    // Propulsion
    if (variantStats.thrust !== undefined) {
      stats.totalThrust += Number(variantStats.thrust) || 0;
    }

    // Weight
    if (variantStats.weight !== undefined) {
      stats.totalWeight += Number(variantStats.weight) || 0;
    }

    // Cooling
    if (variantStats.cooling !== undefined) {
      stats.coolingCapacity += Number(variantStats.cooling) || 0;
    }
    if (variantStats.heat_generation !== undefined) {
      stats.heatGeneration += Number(variantStats.heat_generation) || 0;
    }

    // Shields
    if (variantStats.shield_strength !== undefined) {
      stats.totalShields += Number(variantStats.shield_strength) || 0;
    }

    // Armor
    if (variantStats.armor !== undefined) {
      stats.totalArmor += Number(variantStats.armor) || 0;
    }

    // Count weapons by module type
    const moduleId = module.module_id;
    if (moduleId === "directed_energy_weapon_port") {
      stats.energyWeaponCount++;
    } else if (moduleId === "kinetic_weapon_port") {
      stats.kineticWeaponCount++;
    } else if (moduleId === "missile_weapon_port") {
      stats.missileWeaponCount++;
    } else if (moduleId === "anti_missile_system") {
      stats.countermeasureCount++;
    }
  });

  return stats;
}

/**
 * ShipStatsPanel Component
 *
 * Displays aggregate ship performance statistics based on installed modules.
 * Shows power balance, propulsion, weapons, and other key metrics.
 */
export const ShipStatsPanel: React.FC<ShipStatsPanelProps> = ({
  installedModules,
  moduleVariants,
  shipClass,
  className = "",
}) => {
  // Calculate aggregate stats
  const stats = useMemo(
    () => calculateAggregateStats(installedModules, moduleVariants),
    [installedModules, moduleVariants]
  );

  // Check for warnings
  const powerDeficit = stats.powerConsumption > stats.powerGeneration;
  const overWeight = stats.totalWeight > shipClass.max_weight;
  const heatOverload = stats.heatGeneration > stats.coolingCapacity;

  return (
    <div
      className={className}
      style={{
        backgroundColor: "var(--frigate-bg-surface)",
        border: "1px solid var(--frigate-border-base)",
        padding: "var(--frigate-space-3)",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "var(--frigate-space-3)",
          paddingBottom: "var(--frigate-space-2)",
          borderBottom: "1px solid var(--frigate-border-base)",
        }}
      >
        <h4
          style={{
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-small)",
            color: "var(--frigate-text-primary)",
            fontWeight: 700,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Ship Performance Characteristics
        </h4>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-3)" }}>
        {/* Power Section */}
        <div>
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-secondary)",
              marginBottom: "var(--frigate-space-2)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Power & Cooling
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Generation:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-primary)",
                  fontWeight: 600,
                }}
              >
                {stats.powerGeneration.toFixed(1)} MW
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Consumption:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: powerDeficit ? "var(--frigate-danger)" : "var(--frigate-text-primary)",
                  fontWeight: 600,
                }}
              >
                {stats.powerConsumption.toFixed(1)} MW
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Balance:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: powerDeficit ? "var(--frigate-danger)" : "var(--frigate-success)",
                  fontWeight: 700,
                }}
              >
                {powerDeficit ? "⚠ DEFICIT" : "✓ OK"} (
                {(stats.powerGeneration - stats.powerConsumption).toFixed(1)} MW)
              </span>
            </div>
          </div>
        </div>

        {/* Propulsion Section */}
        <div>
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-secondary)",
              marginBottom: "var(--frigate-space-2)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Propulsion & Movement
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Total Thrust:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-primary)",
                  fontWeight: 600,
                }}
              >
                {stats.totalThrust.toFixed(0)} kN
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Total Weight:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: overWeight ? "var(--frigate-danger)" : "var(--frigate-text-primary)",
                  fontWeight: 600,
                }}
              >
                {stats.totalWeight.toFixed(0)} / {shipClass.max_weight} t
              </span>
            </div>
          </div>
        </div>

        {/* Weapons Section */}
        <div>
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-secondary)",
              marginBottom: "var(--frigate-space-2)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Weapons & Ammunition
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Directed-Energy Weapon Ports:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-primary)",
                  fontWeight: 600,
                }}
              >
                {stats.energyWeaponCount}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Kinetic Weapon Ports:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-primary)",
                  fontWeight: 600,
                }}
              >
                {stats.kineticWeaponCount}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Missile Tubes:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-primary)",
                  fontWeight: 600,
                }}
              >
                {stats.missileWeaponCount}
              </span>
            </div>
          </div>
        </div>

        {/* Defense Section */}
        <div>
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-secondary)",
              marginBottom: "var(--frigate-space-2)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Defense & Survivability
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Hull & Armor:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-primary)",
                  fontWeight: 600,
                }}
              >
                {shipClass.base_hp} HP
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Shield Characteristics:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-primary)",
                  fontWeight: 600,
                }}
              >
                {stats.totalShields > 0 ? `${stats.totalShields} HP` : "None"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                Countermeasures:
              </span>
              <span
                style={{
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-primary)",
                  fontWeight: 600,
                }}
              >
                {stats.countermeasureCount}
              </span>
            </div>
          </div>
        </div>

        {/* Warnings Section */}
        {(powerDeficit || overWeight || heatOverload) && (
          <div
            style={{
              padding: "var(--frigate-space-2)",
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              border: "1px solid var(--frigate-danger)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-tiny)",
                color: "var(--frigate-danger)",
                fontWeight: 700,
                marginBottom: "var(--frigate-space-1)",
              }}
            >
              ! WARNINGS
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-1)" }}
            >
              {powerDeficit && (
                <div
                  style={{
                    fontFamily: "var(--frigate-font-mono)",
                    fontSize: "var(--frigate-font-tiny)",
                    color: "var(--frigate-text-primary)",
                  }}
                >
                  • Power consumption exceeds generation
                </div>
              )}
              {overWeight && (
                <div
                  style={{
                    fontFamily: "var(--frigate-font-mono)",
                    fontSize: "var(--frigate-font-tiny)",
                    color: "var(--frigate-text-primary)",
                  }}
                >
                  • Ship exceeds maximum weight capacity
                </div>
              )}
              {heatOverload && (
                <div
                  style={{
                    fontFamily: "var(--frigate-font-mono)",
                    fontSize: "var(--frigate-font-tiny)",
                    color: "var(--frigate-text-primary)",
                  }}
                >
                  • Heat generation exceeds cooling capacity
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
