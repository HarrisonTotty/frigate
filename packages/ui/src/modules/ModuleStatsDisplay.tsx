/**
 * Module Stats Display Component - Phase 2.1
 * Shows detailed specifications and statistics for modules
 */

import React from "react";

export interface ModuleStats {
  // Power & Energy
  max_energy?: number;
  production?: number;
  power_consumption?: number;

  // Heat
  heat_generation?: number;
  cooling_capacity?: number;

  // Propulsion
  thrust?: number;
  energy_consumption?: number;
  max_speed?: number;

  // Shields
  max_shield_strength?: number;
  recharge_rate?: number;
  recharge_delay?: number;
  efficiency?: number;

  // Weapons
  damage?: number;
  range?: number;
  fire_rate?: number;
  projectile_speed?: number;

  // Physical
  mass?: number;
  weight?: number;

  // Generic - any other stats
  [key: string]: number | string | boolean | undefined;
}

export interface ModuleStatsDisplayProps {
  stats: ModuleStats;
  compact?: boolean;
}

interface StatItemProps {
  label: string;
  value: number | string | boolean | undefined;
  unit?: string;
}

function StatItem({ label, value, unit }: StatItemProps): React.ReactElement | null {
  if (value === undefined || value === null) return null;

  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : String(value);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "var(--frigate-space-1) 0",
        borderBottom: "1px solid var(--frigate-border-subtle)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-tiny)",
          color: "var(--frigate-text-secondary)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-tiny)",
          color: "var(--frigate-text-primary)",
          fontWeight: 600,
        }}
      >
        {formattedValue}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

interface StatGroupProps {
  title: string;
  children: React.ReactNode;
}

function StatGroup({ title, children }: StatGroupProps): React.ReactElement {
  return (
    <div style={{ marginBottom: "var(--frigate-space-3)" }}>
      <div
        style={{
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-small)",
          color: "var(--frigate-primary)",
          fontWeight: 700,
          marginBottom: "var(--frigate-space-2)",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export function ModuleStatsDisplay({
  stats,
  compact = false,
}: ModuleStatsDisplayProps): React.ReactElement {
  // Group stats by category
  const hasPowerStats =
    stats.max_energy !== undefined ||
    stats.production !== undefined ||
    stats.power_consumption !== undefined;
  const hasHeatStats = stats.heat_generation !== undefined || stats.cooling_capacity !== undefined;
  const hasPropulsionStats =
    stats.thrust !== undefined ||
    stats.energy_consumption !== undefined ||
    stats.max_speed !== undefined;
  const hasShieldStats =
    stats.max_shield_strength !== undefined || stats.recharge_rate !== undefined;
  const hasWeaponStats =
    stats.damage !== undefined || stats.range !== undefined || stats.fire_rate !== undefined;
  const hasPhysicalStats = stats.mass !== undefined || stats.weight !== undefined;

  // Collect other stats that don't fit into predefined categories
  const knownKeys = new Set([
    "max_energy",
    "production",
    "power_consumption",
    "heat_generation",
    "cooling_capacity",
    "thrust",
    "energy_consumption",
    "max_speed",
    "max_shield_strength",
    "recharge_rate",
    "recharge_delay",
    "efficiency",
    "damage",
    "range",
    "fire_rate",
    "projectile_speed",
    "mass",
    "weight",
  ]);

  const otherStats = Object.entries(stats).filter(
    ([key, value]) => !knownKeys.has(key) && value !== undefined
  );

  if (compact) {
    // Compact view - show only the most important stats in a single line
    const importantStats: Array<{ label: string; value: number | undefined; unit: string }> = [];

    if (stats.max_energy)
      importantStats.push({ label: "Energy", value: stats.max_energy, unit: "MJ" });
    if (stats.production)
      importantStats.push({ label: "Output", value: stats.production, unit: "MW" });
    if (stats.thrust) importantStats.push({ label: "Thrust", value: stats.thrust, unit: "kN" });
    if (stats.max_shield_strength)
      importantStats.push({ label: "Shields", value: stats.max_shield_strength, unit: "pts" });
    if (stats.damage) importantStats.push({ label: "Damage", value: stats.damage, unit: "pts" });

    return (
      <div
        style={{
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-tiny)",
          color: "var(--frigate-text-secondary)",
          display: "flex",
          gap: "var(--frigate-space-2)",
          flexWrap: "wrap",
        }}
      >
        {importantStats.map((stat, idx) => (
          <span key={idx}>
            {stat.label}:{" "}
            <span style={{ color: "var(--frigate-text-primary)", fontWeight: 600 }}>
              {stat.value?.toLocaleString()} {stat.unit}
            </span>
          </span>
        ))}
      </div>
    );
  }

  // Full view - show all stats organized by category
  return (
    <div
      style={{
        backgroundColor: "var(--frigate-bg-base)",
        border: "1px solid var(--frigate-border-base)",
        padding: "var(--frigate-space-3)",
      }}
    >
      {hasPowerStats && (
        <StatGroup title="Power & Energy">
          <StatItem label="Max Energy" value={stats.max_energy} unit="MJ" />
          <StatItem label="Production" value={stats.production} unit="MW" />
          <StatItem label="Consumption" value={stats.power_consumption} unit="MW" />
        </StatGroup>
      )}

      {hasHeatStats && (
        <StatGroup title="Thermal">
          <StatItem label="Heat Generation" value={stats.heat_generation} unit="K/s" />
          <StatItem label="Cooling Capacity" value={stats.cooling_capacity} unit="K/s" />
        </StatGroup>
      )}

      {hasPropulsionStats && (
        <StatGroup title="Propulsion">
          <StatItem label="Thrust" value={stats.thrust} unit="kN" />
          <StatItem label="Energy Use" value={stats.energy_consumption} unit="MW" />
          <StatItem label="Max Speed" value={stats.max_speed} unit="m/s" />
        </StatGroup>
      )}

      {hasShieldStats && (
        <StatGroup title="Shield Systems">
          <StatItem label="Max Strength" value={stats.max_shield_strength} unit="pts" />
          <StatItem label="Recharge Rate" value={stats.recharge_rate} unit="pts/s" />
          <StatItem label="Recharge Delay" value={stats.recharge_delay} unit="s" />
          <StatItem
            label="Efficiency"
            value={stats.efficiency ? stats.efficiency * 100 : undefined}
            unit="%"
          />
        </StatGroup>
      )}

      {hasWeaponStats && (
        <StatGroup title="Weapon Systems">
          <StatItem label="Damage" value={stats.damage} unit="pts" />
          <StatItem label="Range" value={stats.range} unit="km" />
          <StatItem label="Fire Rate" value={stats.fire_rate} unit="rds/min" />
          <StatItem label="Projectile Speed" value={stats.projectile_speed} unit="m/s" />
        </StatGroup>
      )}

      {hasPhysicalStats && (
        <StatGroup title="Physical">
          <StatItem label="Mass" value={stats.mass} unit="tons" />
          <StatItem label="Weight" value={stats.weight} unit="kg" />
        </StatGroup>
      )}

      {otherStats.length > 0 && (
        <StatGroup title="Other Specifications">
          {otherStats.map(([key, value]) => (
            <StatItem key={key} label={key.replace(/_/g, " ")} value={value} />
          ))}
        </StatGroup>
      )}

      {!hasPowerStats &&
        !hasHeatStats &&
        !hasPropulsionStats &&
        !hasShieldStats &&
        !hasWeaponStats &&
        !hasPhysicalStats &&
        otherStats.length === 0 && (
          <div
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              color: "var(--frigate-text-muted)",
              textAlign: "center",
              padding: "var(--frigate-space-4)",
            }}
          >
            NO STATS AVAILABLE
          </div>
        )}
    </div>
  );
}
