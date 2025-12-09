import type { ShipSilhouetteData } from '../types';

/**
 * Generic ship silhouette for fallback/unknown ship classes
 * Simple side-profile shape that works for any size
 */
export const genericSilhouette: ShipSilhouetteData = {
  shipClassId: 'generic',
  displayName: 'Generic Ship',
  viewBox: { width: 400, height: 200 },
  pathData: `
    M 380 100
    L 395 95 L 400 100 L 395 105 L 380 100
    L 350 85 L 100 85 L 60 95 L 40 100 L 60 105 L 100 115 L 350 115
    Z
    M 200 85 L 200 75 L 220 75 L 220 85
    M 280 85 L 280 78 L 295 78 L 295 85
  `,
  slotPositions: {
    propulsion: [
      { group: 'propulsion', x: 8, y: 50, attachX: 10, attachY: 50, labelPosition: 'left' },
    ],
    power: [
      { group: 'power', x: 8, y: 25, attachX: 25, attachY: 45, labelPosition: 'left' },
    ],
    weapons: [
      { group: 'weapons', x: 92, y: 25, attachX: 85, attachY: 42, labelPosition: 'right' },
      { group: 'weapons', x: 92, y: 50, attachX: 90, attachY: 50, labelPosition: 'right' },
    ],
    defense: [
      { group: 'defense', x: 8, y: 75, attachX: 30, attachY: 55, labelPosition: 'left' },
    ],
    sensors: [
      { group: 'sensors', x: 92, y: 75, attachX: 70, attachY: 55, labelPosition: 'right' },
    ],
    utility: [
      { group: 'utility', x: 50, y: 85, attachX: 50, attachY: 57, labelPosition: 'bottom' },
    ],
  },
};
