import type { ShipSilhouetteData } from '../types';
import { genericSilhouette } from './generic';
import { corvetteSilhouette } from './corvette';
import { frigateSilhouette } from './frigate';
import { destroyerSilhouette } from './destroyer';

/**
 * Registry of ship silhouettes by ship class ID
 */
const silhouetteRegistry: Record<string, ShipSilhouetteData> = {
  generic: genericSilhouette,
  corvette: corvetteSilhouette,
  frigate: frigateSilhouette,
  destroyer: destroyerSilhouette,
};

/**
 * Get silhouette data for a ship class
 * Falls back to generic silhouette if not found
 */
export function getSilhouette(shipClassId: string): ShipSilhouetteData {
  return silhouetteRegistry[shipClassId.toLowerCase()] ?? genericSilhouette;
}

/**
 * Check if a ship class has a custom silhouette
 */
export function hasCustomSilhouette(shipClassId: string): boolean {
  return shipClassId.toLowerCase() in silhouetteRegistry &&
         shipClassId.toLowerCase() !== 'generic';
}

export { genericSilhouette, corvetteSilhouette, frigateSilhouette, destroyerSilhouette };
