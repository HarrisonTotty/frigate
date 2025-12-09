import type { ShipSilhouetteData } from '../types';

/**
 * Corvette silhouette - small, agile combat ship
 *
 * Design characteristics:
 * - Compact, streamlined profile
 * - Fewer module slots (small ship)
 * - Fast, maneuverable appearance
 */
export const corvetteSilhouette: ShipSilhouetteData = {
  shipClassId: 'corvette',
  displayName: 'Corvette',
  viewBox: { width: 300, height: 150 },
  pathData: `
    M 285 75
    L 295 72 L 300 75 L 295 78 L 285 75
    L 250 60 L 80 60 L 40 70 L 20 75 L 40 80 L 80 90 L 250 90
    Z
    M 180 60 L 180 52 L 195 52 L 195 60
  `,
  slotPositions: {
    propulsion: [
      { group: 'propulsion', x: 8, y: 50, attachX: 7, attachY: 50, labelPosition: 'left' },
    ],
    power: [
      { group: 'power', x: 8, y: 22, attachX: 20, attachY: 44, labelPosition: 'left' },
    ],
    weapons: [
      { group: 'weapons', x: 92, y: 22, attachX: 80, attachY: 44, labelPosition: 'right' },
      { group: 'weapons', x: 92, y: 50, attachX: 90, attachY: 50, labelPosition: 'right' },
    ],
    defense: [
      { group: 'defense', x: 8, y: 78, attachX: 30, attachY: 56, labelPosition: 'left' },
    ],
    sensors: [
      { group: 'sensors', x: 92, y: 78, attachX: 70, attachY: 56, labelPosition: 'right' },
    ],
    utility: [
      { group: 'utility', x: 50, y: 88, attachX: 50, attachY: 58, labelPosition: 'bottom' },
    ],
  },
};
