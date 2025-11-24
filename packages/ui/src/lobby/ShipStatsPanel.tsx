import React from 'react';
import { ProgressBar } from '../components';

/**
 * Ship Statistics Interface
 * 
 * Represents aggregated statistics for a ship blueprint.
 */
export interface ShipStats {
  /** Total construction cost in credits */
  cost: number;
  /** Total ship weight in metric tons */
  weight: number;
  /** Total hull points (structural integrity) */
  hp: number;
  /** Total power consumption in kilowatts */
  power: number;
  /** Total heat generation in kilowatts thermal */
  heat: number;
  /** Build points currently used */
  buildPointsUsed: number;
  /** Maximum build points available */
  buildPointsMax: number;
  /** Array of constraint warnings if any limits exceeded */
  warnings?: string[];
}

/**
 * Ship Statistics Panel Props
 */
export interface ShipStatsPanelProps {
  /** Ship statistics to display */
  stats: ShipStats;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Ship Statistics Panel Component
 * 
 * Displays aggregated ship blueprint statistics in a dense, technical format.
 * Shows key performance indicators with progress bars for constrained resources.
 * Features warning indicators when limits are approached or exceeded.
 * 
 * @example
 * ```tsx
 * <ShipStatsPanel
 *   stats={{
 *     cost: 1500,
 *     weight: 850,
 *     hp: 450,
 *     power: 280,
 *     heat: 320,
 *     buildPointsUsed: 75,
 *     buildPointsMax: 100,
 *     warnings: []
 *   }}
 * />
 * ```
 */
export function ShipStatsPanel({ stats, className = '' }: ShipStatsPanelProps) {
  // Calculate percentages for constrained resources
  const bpPercent = (stats.buildPointsUsed / stats.buildPointsMax) * 100;
  const bpStatus = bpPercent > 90 ? 'danger' : bpPercent > 70 ? 'warning' : 'primary';

  // Helper to format stat rows
  const StatRow = ({ label, value, unit = '' }: { label: string; value: number | string; unit?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--frigate-space-1) 0' }}>
      <span style={{ fontSize: 'var(--frigate-font-small)', color: 'var(--frigate-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '5ch' }}>
        {label}
      </span>
      <span style={{ fontSize: 'var(--frigate-font-body)', color: 'var(--frigate-text-primary)', fontWeight: 600, fontFamily: 'var(--frigate-font-mono)' }}>
        {value}{unit}
      </span>
    </div>
  );

  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--frigate-font-mono)',
        backgroundColor: 'var(--frigate-bg-surface)',
        color: 'var(--frigate-text-primary)',
        borderRadius: 0,
        boxShadow: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontWeight: 800,
          fontSize: 'var(--frigate-font-heading)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 'var(--frigate-space-3)',
          paddingBottom: 'var(--frigate-space-2)',
          borderBottom: '1px solid var(--frigate-border-base)',
        }}
      >
        SHIP STATISTICS [SHP]
      </div>

      {/* Primary Stats Grid (2 columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--frigate-space-3)',
          marginBottom: 'var(--frigate-space-4)',
        }}
      >
        <div>
          <StatRow label="COST" value={stats.cost} unit=" cr" />
          <StatRow label="WEIGHT" value={stats.weight} unit=" t" />
          <StatRow label="HULL PTS" value={stats.hp} unit=" HP" />
        </div>
        <div>
          <StatRow label="PWR CON" value={stats.power} unit=" kW" />
          <StatRow label="HEAT GEN" value={stats.heat} unit=" kWth" />
          <StatRow label="HARDNESS" value="—" />
        </div>
      </div>

      {/* Build Points Constraint */}
      <div style={{ marginBottom: 'var(--frigate-space-4)' }}>
        <div
          style={{
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--frigate-space-2)',
          }}
        >
          BUILD POINTS ALLOCATION
        </div>
        <ProgressBar
          value={stats.buildPointsUsed}
          max={stats.buildPointsMax}
          variant={bpStatus}
          showLabel={true}
          blocks={20}
        />
        <div
          style={{
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-muted)',
            marginTop: 'var(--frigate-space-1)',
            textAlign: 'right',
          }}
        >
          {stats.buildPointsUsed} / {stats.buildPointsMax}
        </div>
      </div>

      {/* Constraints Section */}
      <div
        style={{
          marginBottom: 'var(--frigate-space-3)',
          paddingBottom: 'var(--frigate-space-3)',
          borderBottom: '1px solid var(--frigate-border-base)',
          fontSize: 'var(--frigate-font-small)',
          color: 'var(--frigate-text-secondary)',
        }}
      >
        <div style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--frigate-space-2)' }}>
          CONSTRAINTS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--frigate-space-2)', fontSize: 'var(--frigate-font-tiny)' }}>
          <div>MAX BUILD: {stats.buildPointsMax} BP</div>
          <div>MAX WEIGHT: — t</div>
          <div>MAX POWER: — kW</div>
          <div>MAX HEAT: — kWth</div>
        </div>
      </div>

      {/* Warnings Section */}
      {stats.warnings && stats.warnings.length > 0 && (
        <div style={{ paddingTop: 'var(--frigate-space-2)' }}>
          <div
            style={{
              fontSize: 'var(--frigate-font-small)',
              color: 'var(--frigate-danger)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--frigate-space-2)',
              fontWeight: 700,
            }}
          >
            ⚠ WARNINGS [{stats.warnings.length}]
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--frigate-space-1)' }}>
            {stats.warnings.map((warning, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: 'var(--frigate-font-small)',
                  color: 'var(--frigate-danger)',
                  paddingLeft: 'var(--frigate-space-2)',
                  borderLeft: '2px solid var(--frigate-danger)',
                }}
              >
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShipStatsPanel;
