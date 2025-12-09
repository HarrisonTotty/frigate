import React from 'react';
import type { ShipSilhouetteData } from './types';

interface ShipSilhouetteProps {
  silhouette: ShipSilhouetteData;
  className?: string;
}

/**
 * Silhouette layout constants - exported for use by other components
 * to ensure markers and connection lines align with the ship
 */
export const SILHOUETTE_LAYOUT = {
  top: 15,      // percentage from top
  left: 20,     // percentage from left
  width: 60,    // percentage of container width
  height: 70,   // percentage of container height
} as const;

/**
 * Renders the SVG ship silhouette outline
 */
export function ShipSilhouette({ silhouette, className }: ShipSilhouetteProps) {
  const { viewBox, pathData } = silhouette;

  return (
    <svg
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{
        position: 'absolute',
        top: `${SILHOUETTE_LAYOUT.top}%`,
        left: `${SILHOUETTE_LAYOUT.left}%`,
        width: `${SILHOUETTE_LAYOUT.width}%`,
        height: `${SILHOUETTE_LAYOUT.height}%`,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <path
        d={pathData}
        fill="none"
        stroke="var(--frigate-border-base)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
