import type { ShipSilhouetteData } from '../types';

/**
 * Destroyer silhouette - large, combat-focused warship
 *
 * Design characteristics:
 * - Heavy, imposing profile
 * - Many weapon hardpoints
 * - Multiple engine banks
 * - Extensive defensive systems
 */
export const destroyerSilhouette: ShipSilhouetteData = {
  shipClassId: 'destroyer',
  displayName: 'Destroyer',
  viewBox: { width: 500, height: 250 },
  pathData: `
    M 475 125
    L 492 120 L 500 125 L 492 130 L 475 125
    L 420 95 L 150 95 L 80 108 L 30 125 L 80 142 L 150 155 L 420 155
    Z
    M 250 95 L 250 78 L 285 78 L 285 95
    M 330 95 L 330 82 L 360 82 L 360 95
    M 180 155 L 180 167 L 210 167 L 210 155
    M 280 155 L 280 165 L 305 165 L 305 155
    M 60 108 L 45 100 L 60 100 L 60 108
    M 60 142 L 60 150 L 45 150 L 60 142
  `,
  slotPositions: {
    propulsion: [
      { group: 'propulsion', x: 5, y: 50, attachX: 6, attachY: 50, labelPosition: 'left' },
      { group: 'propulsion', x: 5, y: 32, attachX: 12, attachY: 44, labelPosition: 'left' },
      { group: 'propulsion', x: 5, y: 68, attachX: 12, attachY: 56, labelPosition: 'left' },
    ],
    power: [
      { group: 'power', x: 5, y: 15, attachX: 18, attachY: 42, labelPosition: 'left' },
      { group: 'power', x: 18, y: 15, attachX: 25, attachY: 42, labelPosition: 'left' },
    ],
    weapons: [
      { group: 'weapons', x: 95, y: 15, attachX: 75, attachY: 38, labelPosition: 'right' },
      { group: 'weapons', x: 95, y: 30, attachX: 80, attachY: 42, labelPosition: 'right' },
      { group: 'weapons', x: 95, y: 45, attachX: 85, attachY: 47, labelPosition: 'right' },
      { group: 'weapons', x: 95, y: 60, attachX: 88, attachY: 52, labelPosition: 'right' },
    ],
    defense: [
      { group: 'defense', x: 5, y: 85, attachX: 22, attachY: 58, labelPosition: 'left' },
      { group: 'defense', x: 18, y: 85, attachX: 32, attachY: 60, labelPosition: 'left' },
    ],
    sensors: [
      { group: 'sensors', x: 95, y: 75, attachX: 65, attachY: 56, labelPosition: 'right' },
      { group: 'sensors', x: 95, y: 88, attachX: 55, attachY: 60, labelPosition: 'right' },
    ],
    utility: [
      { group: 'utility', x: 35, y: 90, attachX: 38, attachY: 62, labelPosition: 'bottom' },
      { group: 'utility', x: 50, y: 90, attachX: 50, attachY: 62, labelPosition: 'bottom' },
      { group: 'utility', x: 65, y: 90, attachX: 58, attachY: 60, labelPosition: 'bottom' },
    ],
  },
};
