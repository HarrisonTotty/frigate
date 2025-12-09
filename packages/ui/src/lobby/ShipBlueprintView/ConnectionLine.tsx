import React from 'react';
import type { ConnectionLineProps } from './types';

/**
 * SVG line connecting a module marker to its attachment point on the ship
 *
 * Visual states:
 * - Empty slot: dashed line, muted color
 * - Installed: solid line
 * - Selected: highlighted color
 */
export function ConnectionLine({
  startX,
  startY,
  endX,
  endY,
  isSelected = false,
  isEmpty = false,
}: ConnectionLineProps) {
  const strokeColor = isSelected
    ? 'var(--frigate-primary)'
    : isEmpty
      ? 'var(--frigate-border-muted)'
      : 'var(--frigate-border-base)';

  const strokeDasharray = isEmpty ? '4 2' : 'none';
  const strokeWidth = isSelected ? 1.5 : 1;

  return (
    <line
      x1={`${startX}%`}
      y1={`${startY}%`}
      x2={`${endX}%`}
      y2={`${endY}%`}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeLinecap="round"
    />
  );
}
