import type { ShipSilhouetteData } from '../types';

/**
 * Frigate silhouette - medium, balanced warship
 *
 * Design characteristics:
 * - Balanced profile with good module capacity
 * - Multiple weapon hardpoints
 * - Visible sensor arrays and defensive systems
 */
export const frigateSilhouette: ShipSilhouetteData = {
  shipClassId: 'frigate',
  displayName: 'Frigate',
  viewBox: { width: 400, height: 200 },
  pathData: `
    M 380 100
    L 395 96 L 400 100 L 395 104 L 380 100
    L 340 80 L 120 80 L 70 90 L 30 100 L 70 110 L 120 120 L 340 120
    Z
    M 200 80 L 200 68 L 225 68 L 225 80
    M 270 80 L 270 72 L 290 72 L 290 80
    M 140 120 L 140 128 L 160 128 L 160 120
  `,
  slotPositions: {
    propulsion: [
      { group: 'propulsion', x: 6, y: 50, attachX: 8, attachY: 50, labelPosition: 'left' },
      { group: 'propulsion', x: 6, y: 35, attachX: 15, attachY: 46, labelPosition: 'left' },
    ],
    power: [
      { group: 'power', x: 6, y: 20, attachX: 22, attachY: 44, labelPosition: 'left' },
    ],
    weapons: [
      { group: 'weapons', x: 94, y: 20, attachX: 80, attachY: 40, labelPosition: 'right' },
      { group: 'weapons', x: 94, y: 38, attachX: 85, attachY: 45, labelPosition: 'right' },
      { group: 'weapons', x: 94, y: 56, attachX: 90, attachY: 50, labelPosition: 'right' },
    ],
    defense: [
      { group: 'defense', x: 6, y: 65, attachX: 20, attachY: 54, labelPosition: 'left' },
      { group: 'defense', x: 6, y: 80, attachX: 28, attachY: 56, labelPosition: 'left' },
    ],
    sensors: [
      { group: 'sensors', x: 94, y: 74, attachX: 65, attachY: 55, labelPosition: 'right' },
    ],
    utility: [
      { group: 'utility', x: 40, y: 88, attachX: 40, attachY: 58, labelPosition: 'bottom' },
      { group: 'utility', x: 60, y: 88, attachX: 55, attachY: 58, labelPosition: 'bottom' },
    ],
  },
};
