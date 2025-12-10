import React from 'react';
import type { ConnectionLineProps } from './types';

/**
 * SVG line connecting a module marker to its attachment point on the ship
 *
 * Visual states:
 * - Empty slot: dashed line, muted color
 * - Installed: solid line
 * - Highlighted (hover): highlighted color
 */
export function ConnectionLine({
  startX,
  startY,
  endX,
  endY,
  isHighlighted = false,
  isEmpty = false,
}: ConnectionLineProps) {
  const strokeColor = isHighlighted
    ? 'var(--frigate-primary)'
    : isEmpty
      ? 'var(--frigate-border-muted)'
      : 'var(--frigate-border-base)';

  const strokeDasharray = isEmpty ? '4 2' : 'none';
  const strokeWidth = isHighlighted ? 1.5 : 1;

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
      style={{ transition: 'stroke 0.15s ease, stroke-width 0.15s ease' }}
    />
  );
}
