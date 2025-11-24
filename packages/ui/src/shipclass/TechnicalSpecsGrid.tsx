/**
 * Technical Specs Grid Component - Phase 4.12.2
 * 
 * Displays ship class technical specifications in a grid layout
 * with proper unit formatting and alignment for easy comparison.
 */

import React from 'react';
import type { TechnicalSpecs } from '../types/shipClass';

export interface TechnicalSpecsGridProps {
  /** Technical specifications from ship class */
  specs: TechnicalSpecs;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Technical Specifications Grid
 * 
 * Displays ship technical specifications with monospace font
 * and proper unit formatting. Aligns numerical values for
 * easy comparison across different ship classes.
 */
export function TechnicalSpecsGrid({
  specs,
  className = '',
}: TechnicalSpecsGridProps): React.ReactElement {
  // Convert specs object to array for rendering
  const specEntries = Object.entries(specs).filter(([_, value]) => value !== undefined);

  // Group specs by category for better organization
  const dimensionKeys = ['Length', 'Width', 'Height'];
  const performanceKeys = ['Max Acceleration', 'Turn Rate', 'Max Warp'];
  const capacityKeys = ['Mass', 'Crew', 'Cargo', 'Fuel Capacity'];
  const rangeKeys = ['Sensor Range', 'Range'];

  const categorizeSpec = (key: string): string => {
    if (dimensionKeys.includes(key)) return 'dimensions';
    if (performanceKeys.includes(key)) return 'performance';
    if (capacityKeys.includes(key)) return 'capacity';
    if (rangeKeys.includes(key)) return 'range';
    return 'other';
  };

  const categories = {
    dimensions: { label: 'DIMENSIONS', specs: [] as [string, string][] },
    performance: { label: 'PERFORMANCE', specs: [] as [string, string][] },
    capacity: { label: 'CAPACITY', specs: [] as [string, string][] },
    range: { label: 'RANGE', specs: [] as [string, string][] },
    other: { label: 'OTHER', specs: [] as [string, string][] },
  };

  // Organize specs into categories
  specEntries.forEach(([key, value]) => {
    const category = categorizeSpec(key);
    categories[category as keyof typeof categories].specs.push([key, value as string]);
  });

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
          TECHNICAL SPECIFICATIONS:
        </div>

        {Object.entries(categories).map(([categoryKey, { label, specs }]) => {
          if (specs.length === 0) return null;

          return (
            <div key={categoryKey} style={{ marginBottom: 'var(--frigate-space-3)' }}>
              <div
                style={{
                  fontFamily: 'var(--frigate-font-mono)',
                  fontSize: 'var(--frigate-font-tiny)',
                  color: 'var(--frigate-text-muted)',
                  marginBottom: 'var(--frigate-space-1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {label}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 'var(--frigate-space-1) var(--frigate-space-3)',
                  paddingLeft: 'var(--frigate-space-2)',
                }}
              >
                {specs.map(([key, value]) => (
                  <React.Fragment key={key}>
                    <div
                      style={{
                        fontFamily: 'var(--frigate-font-mono)',
                        fontSize: 'var(--frigate-font-small)',
                        color: 'var(--frigate-text-secondary)',
                        textAlign: 'right',
                      }}
                    >
                      {key}:
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--frigate-font-mono)',
                        fontSize: 'var(--frigate-font-small)',
                        color: 'var(--frigate-text-primary)',
                        fontWeight: 600,
                      }}
                    >
                      {value}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
