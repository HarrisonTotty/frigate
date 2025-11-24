/**
 * Build Constraints Panel Component - Phase 4.12.2
 * 
 * Displays ship build constraints with visual bars and gauges
 * to show weight limits, module capacity, and build point budget.
 */

import React from 'react';
import { Gauge } from '../components';

export interface BuildConstraintsPanelProps {
  /** Maximum weight capacity in tonnes */
  maxWeight: number;
  /** Maximum number of module slots */
  maxModules: number;
  /** Build points budget */
  buildPoints: number;
  /** Current weight used (optional, for showing usage bars) */
  currentWeight?: number;
  /** Current modules used (optional, for showing usage bars) */
  currentModules?: number;
  /** Current build points used (optional, for showing usage bars) */
  currentBuildPoints?: number;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Build Constraints Panel
 * 
 * Displays ship build constraints using visual Gauge components
 * and progress bars. Shows maximum capacity for weight, modules,
 * and build points. Optionally shows current usage if provided.
 */
export function BuildConstraintsPanel({
  maxWeight,
  maxModules,
  buildPoints,
  currentWeight,
  currentModules,
  currentBuildPoints,
  className = '',
}: BuildConstraintsPanelProps): React.ReactElement {
  // Calculate percentages for usage bars
  const weightPercent = currentWeight !== undefined ? (currentWeight / maxWeight) * 100 : 0;
  const modulesPercent = currentModules !== undefined ? (currentModules / maxModules) * 100 : 0;
  const buildPointsPercent =
    currentBuildPoints !== undefined ? (currentBuildPoints / buildPoints) * 100 : 0;

  // Determine bar colors based on usage
  const getBarColor = (percent: number): string => {
    if (percent >= 100) return 'var(--frigate-danger)';
    if (percent >= 90) return 'var(--frigate-warning)';
    return 'var(--frigate-accent)';
  };

  return (
    <div className={className}>
      <div
        style={{
          backgroundColor: 'var(--frigate-bg-surface)',
          border: '1px solid var(--frigate-border-base)',
          padding: 'var(--frigate-space-3)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-secondary)',
            marginBottom: 'var(--frigate-space-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          BUILD CONSTRAINTS:
        </div>

        {/* Maximum Weight */}
        <div style={{ marginBottom: 'var(--frigate-space-3)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--frigate-space-1)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-secondary)',
              }}
            >
              MAX WEIGHT:
            </div>
            <Gauge
              value={maxWeight}
              label="tonnes"
              variant="default"
            />
          </div>
          {currentWeight !== undefined && (
            <>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--frigate-bg-base)',
                  border: '1px solid var(--frigate-border-base)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.min(weightPercent, 100)}%`,
                    backgroundColor: getBarColor(weightPercent),
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: 'var(--frigate-font-mono)',
                  fontSize: 'var(--frigate-font-tiny)',
                  color: 'var(--frigate-text-muted)',
                  marginTop: 'var(--frigate-space-1)',
                  textAlign: 'right',
                }}
              >
                {currentWeight.toLocaleString()} / {maxWeight.toLocaleString()} tonnes (
                {weightPercent.toFixed(1)}%)
              </div>
            </>
          )}
        </div>

        {/* Maximum Modules */}
        <div style={{ marginBottom: 'var(--frigate-space-3)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--frigate-space-1)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-secondary)',
              }}
            >
              MAX MODULES:
            </div>
            <Gauge
              value={maxModules}
              label="slots"
              variant="default"
            />
          </div>
          {currentModules !== undefined && (
            <>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--frigate-bg-base)',
                  border: '1px solid var(--frigate-border-base)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.min(modulesPercent, 100)}%`,
                    backgroundColor: getBarColor(modulesPercent),
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: 'var(--frigate-font-mono)',
                  fontSize: 'var(--frigate-font-tiny)',
                  color: 'var(--frigate-text-muted)',
                  marginTop: 'var(--frigate-space-1)',
                  textAlign: 'right',
                }}
              >
                {currentModules} / {maxModules} slots ({modulesPercent.toFixed(1)}%)
              </div>
            </>
          )}
        </div>

        {/* Build Points */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--frigate-space-1)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-secondary)',
              }}
            >
              BUILD POINTS:
            </div>
            <Gauge
              value={buildPoints}
              label="BP"
              variant="default"
            />
          </div>
          {currentBuildPoints !== undefined && (
            <>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--frigate-bg-base)',
                  border: '1px solid var(--frigate-border-base)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.min(buildPointsPercent, 100)}%`,
                    backgroundColor: getBarColor(buildPointsPercent),
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: 'var(--frigate-font-mono)',
                  fontSize: 'var(--frigate-font-tiny)',
                  color: 'var(--frigate-text-muted)',
                  marginTop: 'var(--frigate-space-1)',
                  textAlign: 'right',
                }}
              >
                {currentBuildPoints} / {buildPoints} BP ({buildPointsPercent.toFixed(1)}%)
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
