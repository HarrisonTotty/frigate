import type { ShipSilhouetteData, SlotPosition } from '../types';

/**
 * Ship size categories for silhouette selection
 */
export type ShipSize = 'small' | 'medium' | 'large';

/**
 * Small ship silhouette - Fighter/Interceptor style
 * Top-down view: Sleek, delta-wing or arrow shape
 * Compact with limited module capacity
 */
const smallShipSilhouette: ShipSilhouetteData = {
  shipClassId: 'small',
  displayName: 'Light Vessel',
  viewBox: { width: 200, height: 300 },
  // Top-down fighter: pointed nose, swept wings, twin engines
  pathData: `
    M 100 10
    L 115 50
    L 120 80
    L 140 120
    L 160 180
    L 145 200
    L 130 220
    L 120 280
    L 110 290
    L 100 295
    L 90 290
    L 80 280
    L 70 220
    L 55 200
    L 40 180
    L 60 120
    L 80 80
    L 85 50
    Z
    M 85 260 L 75 270 L 75 285 L 85 280 Z
    M 115 260 L 125 270 L 125 285 L 115 280 Z
    M 90 100 L 90 140 L 110 140 L 110 100 Z
  `,
  slotPositions: {},
};

/**
 * Medium ship silhouette - Frigate/Destroyer style
 * Top-down view: Elongated hull with visible weapon mounts
 * Balanced module capacity
 */
const mediumShipSilhouette: ShipSilhouetteData = {
  shipClassId: 'medium',
  displayName: 'Medium Vessel',
  viewBox: { width: 200, height: 400 },
  // Top-down frigate: tapered bow, wider mid-section, dual engines
  pathData: `
    M 100 15
    L 120 40
    L 130 80
    L 140 140
    L 145 200
    L 145 280
    L 140 320
    L 130 360
    L 115 380
    L 100 390
    L 85 380
    L 70 360
    L 60 320
    L 55 280
    L 55 200
    L 60 140
    L 70 80
    L 80 40
    Z
    M 70 360 L 55 370 L 55 395 L 70 385 Z
    M 130 360 L 145 370 L 145 395 L 130 385 Z
    M 85 100 L 85 160 L 115 160 L 115 100 Z
    M 75 200 L 75 240 L 85 240 L 85 200 Z
    M 115 200 L 115 240 L 125 240 L 125 200 Z
    M 90 60 L 90 80 L 110 80 L 110 60 Z
  `,
  slotPositions: {},
};

/**
 * Large ship silhouette - Cruiser/Battleship style
 * Top-down view: Massive hull with multiple weapon batteries
 * High module capacity
 */
const largeShipSilhouette: ShipSilhouetteData = {
  shipClassId: 'large',
  displayName: 'Capital Ship',
  viewBox: { width: 240, height: 500 },
  // Top-down capital ship: wedge bow, wide body, multiple engine clusters
  pathData: `
    M 120 20
    L 145 50
    L 165 100
    L 180 180
    L 185 260
    L 185 360
    L 175 420
    L 155 460
    L 135 480
    L 120 490
    L 105 480
    L 85 460
    L 65 420
    L 55 360
    L 55 260
    L 60 180
    L 75 100
    L 95 50
    Z
    M 70 420 L 50 440 L 50 480 L 70 465 Z
    M 170 420 L 190 440 L 190 480 L 170 465 Z
    M 95 420 L 85 440 L 85 470 L 95 455 Z
    M 145 420 L 155 440 L 155 470 L 145 455 Z
    M 100 120 L 100 200 L 140 200 L 140 120 Z
    M 75 240 L 75 300 L 90 300 L 90 240 Z
    M 150 240 L 150 300 L 165 300 L 165 240 Z
    M 95 320 L 95 380 L 145 380 L 145 320 Z
    M 105 60 L 105 100 L 135 100 L 135 60 Z
  `,
  slotPositions: {},
};

/**
 * Attachment zones on the silhouette hull edges
 * LEFT zones are on the left edge of the hull (for left-side markers)
 * RIGHT zones are on the right edge of the hull (for right-side markers)
 * This ensures connection lines stay on their respective side and don't cross the ship
 *
 * Values are in silhouette-relative percentages (0-100)
 * X values define the hull edge position at that zone
 * Y values define the vertical range for that zone
 */
interface AttachmentZone {
  x: number;      // X position on hull edge
  minY: number;   // Start of vertical range
  maxY: number;   // End of vertical range
}

// Left-side attachment zones (on left edge of hull)
const leftAttachmentZones: Record<ShipSize, Record<string, AttachmentZone>> = {
  small: {
    bow: { x: 42, minY: 8, maxY: 22 },
    forward: { x: 32, minY: 22, maxY: 42 },
    midship: { x: 25, minY: 42, maxY: 62 },
    aft: { x: 30, minY: 62, maxY: 82 },
    engines: { x: 38, minY: 82, maxY: 95 },
  },
  medium: {
    bow: { x: 42, minY: 6, maxY: 18 },
    forward: { x: 32, minY: 18, maxY: 38 },
    midship: { x: 28, minY: 38, maxY: 58 },
    aft: { x: 30, minY: 58, maxY: 78 },
    engines: { x: 30, minY: 78, maxY: 95 },
  },
  large: {
    bow: { x: 42, minY: 6, maxY: 14 },
    forward: { x: 30, minY: 14, maxY: 32 },
    midship: { x: 24, minY: 32, maxY: 52 },
    aft: { x: 26, minY: 52, maxY: 72 },
    engines: { x: 28, minY: 72, maxY: 95 },
  },
};

// Right-side attachment zones (on right edge of hull)
const rightAttachmentZones: Record<ShipSize, Record<string, AttachmentZone>> = {
  small: {
    bow: { x: 58, minY: 8, maxY: 22 },
    forward: { x: 68, minY: 22, maxY: 42 },
    midship: { x: 75, minY: 42, maxY: 62 },
    aft: { x: 70, minY: 62, maxY: 82 },
    engines: { x: 62, minY: 82, maxY: 95 },
  },
  medium: {
    bow: { x: 58, minY: 6, maxY: 18 },
    forward: { x: 68, minY: 18, maxY: 38 },
    midship: { x: 72, minY: 38, maxY: 58 },
    aft: { x: 70, minY: 58, maxY: 78 },
    engines: { x: 70, minY: 78, maxY: 95 },
  },
  large: {
    bow: { x: 58, minY: 6, maxY: 14 },
    forward: { x: 70, minY: 14, maxY: 32 },
    midship: { x: 76, minY: 32, maxY: 52 },
    aft: { x: 74, minY: 52, maxY: 72 },
    engines: { x: 72, minY: 72, maxY: 95 },
  },
};

/**
 * Module group to ship zone mapping
 * Determines where different module types attach on the hull
 */
const groupToZone: Record<string, string[]> = {
  // Propulsion systems at the rear
  propulsion: ['engines', 'aft'],
  Propulsion: ['engines', 'aft'],

  // Power systems in the midship/aft
  power: ['midship', 'aft'],
  Power: ['midship', 'aft'],
  Essential: ['midship'],

  // Weapons distributed across ship
  weapons: ['forward', 'midship', 'bow'],
  Weapons: ['forward', 'midship', 'bow'],
  Offense: ['forward', 'bow', 'midship'],

  // Defense systems midship
  defense: ['midship', 'forward', 'aft'],
  Defense: ['midship', 'forward', 'aft'],

  // Sensors at bow/forward
  sensors: ['bow', 'forward'],
  Sensors: ['bow', 'forward'],

  // Utility distributed
  utility: ['midship', 'aft', 'forward'],
  Utility: ['midship', 'aft', 'forward'],
  Support: ['midship', 'aft'],

  // Unknown defaults to midship
  unknown: ['midship'],
};

/**
 * Simple seeded random number generator for deterministic positioning
 */
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

/**
 * Minimum vertical spacing between marker boxes (percentage of canvas height)
 * This prevents boxes from overlapping
 */
const MIN_MARKER_SPACING = 8;

/**
 * Intermediate data for a slot before final position assignment
 */
interface SlotData {
  instanceId: string;
  group: string;
  side: 'left' | 'right';
  attachX: number;
  attachY: number;
}

/**
 * Calculate attachment point for a slot based on its group and zone
 */
function calculateAttachmentPoint(
  instanceId: string,
  group: string,
  index: number,
  size: ShipSize,
  side: 'left' | 'right'
): { attachX: number; attachY: number } {
  const random = seededRandom(instanceId);

  // Get zones for this group
  const zones = groupToZone[group] ?? groupToZone.unknown;
  const zoneKey = zones[index % zones.length];

  // Use the appropriate side's attachment zones
  const sideZones = side === 'left' ? leftAttachmentZones : rightAttachmentZones;
  const zone = sideZones[size][zoneKey] ?? sideZones[size].midship;

  // Generate attachment point on the hull edge for this zone
  const attachX = zone.x;
  const attachY = zone.minY + random() * (zone.maxY - zone.minY);

  return { attachX, attachY };
}

/**
 * Assign marker Y positions to match attachment Y order (prevents line crossing)
 * while maintaining minimum spacing (prevents box overlap)
 */
function assignMarkerPositions(
  slots: SlotData[],
  side: 'left' | 'right'
): Map<string, SlotPosition> {
  const positions = new Map<string, SlotPosition>();

  if (slots.length === 0) return positions;

  // Sort slots by their attachment Y position (top to bottom)
  // This ensures marker order matches attachment order, preventing line crossings
  const sortedSlots = [...slots].sort((a, b) => a.attachY - b.attachY);

  // Calculate available vertical space
  const minY = 10; // Top margin
  const maxY = 90; // Bottom margin
  const availableHeight = maxY - minY;

  // Calculate required height based on minimum spacing
  const requiredHeight = (sortedSlots.length - 1) * MIN_MARKER_SPACING;

  // Determine actual spacing (use minimum spacing, or compress if too many items)
  const actualSpacing = requiredHeight <= availableHeight
    ? MIN_MARKER_SPACING
    : availableHeight / Math.max(sortedSlots.length - 1, 1);

  // Calculate starting Y to center the group vertically
  const totalHeight = (sortedSlots.length - 1) * actualSpacing;
  const startY = minY + (availableHeight - totalHeight) / 2;

  // X position based on side
  // Position markers closer to the ship silhouette to avoid being cut off by adjacent panels
  // Left markers anchor to their right edge (via CSS transform), right markers to their left edge
  const markerX = side === 'left' ? 18 : 82;

  // Assign positions in sorted order
  for (let i = 0; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    const markerY = startY + i * actualSpacing;

    positions.set(slot.instanceId, {
      group: slot.group,
      x: markerX,
      y: Math.min(Math.max(markerY, minY), maxY),
      attachX: slot.attachX,
      attachY: slot.attachY,
      labelPosition: side,
    });
  }

  return positions;
}

/**
 * Get silhouette data for a ship based on size
 */
export function getSilhouetteBySize(size: ShipSize): ShipSilhouetteData {
  switch (size) {
    case 'small':
      return smallShipSilhouette;
    case 'medium':
      return mediumShipSilhouette;
    case 'large':
      return largeShipSilhouette;
    default:
      return mediumShipSilhouette;
  }
}

/**
 * Infer ship size from ship class ID or name
 * This is a heuristic for when explicit size isn't available
 */
export function inferShipSize(shipClassId: string, shipClassName?: string): ShipSize {
  const id = shipClassId.toLowerCase();
  const name = (shipClassName ?? '').toLowerCase();

  // Small ships
  if (
    id.includes('fighter') || id.includes('interceptor') || id.includes('scout') ||
    id.includes('shuttle') || id.includes('corvette') || id.includes('patrol') ||
    name.includes('fighter') || name.includes('interceptor') || name.includes('scout') ||
    name.includes('shuttle') || name.includes('corvette') || name.includes('patrol')
  ) {
    return 'small';
  }

  // Large ships
  if (
    id.includes('cruiser') || id.includes('battleship') || id.includes('carrier') ||
    id.includes('dreadnought') || id.includes('capital') || id.includes('heavy') ||
    name.includes('cruiser') || name.includes('battleship') || name.includes('carrier') ||
    name.includes('dreadnought') || name.includes('capital') || name.includes('heavy')
  ) {
    return 'large';
  }

  // Default to medium (frigates, destroyers, etc.)
  return 'medium';
}

/**
 * Generate slot positions for instances dynamically
 * This replaces the static slotPositions in silhouette data
 *
 * The algorithm:
 * 1. Assign each instance to left or right side based on its group
 * 2. Calculate attachment points for each instance
 * 3. Sort instances on each side by attachment Y position
 * 4. Assign marker Y positions in the same order (prevents line crossing)
 * 5. Maintain minimum spacing between markers (prevents box overlap)
 */
export function generateSlotPositions(
  instances: Array<{ id: string; module_slot_id: string }>,
  moduleSlotsById: Record<string, { groups?: readonly string[] | string[] }>,
  size: ShipSize
): Map<string, SlotPosition> {
  // Collect slot data for each side
  const leftSlots: SlotData[] = [];
  const rightSlots: SlotData[] = [];

  // Group instances by their module slot's primary group
  const instancesByGroup = new Map<string, typeof instances>();

  for (const instance of instances) {
    const slot = moduleSlotsById[instance.module_slot_id];
    const group = slot?.groups?.[0] ?? 'unknown';

    if (!instancesByGroup.has(group)) {
      instancesByGroup.set(group, []);
    }
    instancesByGroup.get(group)!.push(instance);
  }

  // Assign instances to sides and calculate attachment points
  let groupIndex = 0;

  for (const [group, groupInstances] of instancesByGroup) {
    const side: 'left' | 'right' = groupIndex % 2 === 0 ? 'left' : 'right';
    const targetArray = side === 'left' ? leftSlots : rightSlots;

    for (let i = 0; i < groupInstances.length; i++) {
      const instance = groupInstances[i];
      const { attachX, attachY } = calculateAttachmentPoint(
        instance.id,
        group,
        i,
        size,
        side
      );

      targetArray.push({
        instanceId: instance.id,
        group,
        side,
        attachX,
        attachY,
      });
    }

    groupIndex++;
  }

  // Assign marker positions for each side (sorted by attachment Y to prevent crossings)
  const leftPositions = assignMarkerPositions(leftSlots, 'left');
  const rightPositions = assignMarkerPositions(rightSlots, 'right');

  // Merge results
  const positions = new Map<string, SlotPosition>();
  for (const [id, pos] of leftPositions) positions.set(id, pos);
  for (const [id, pos] of rightPositions) positions.set(id, pos);

  return positions;
}

/**
 * Get silhouette for a ship class (legacy API - now uses size inference)
 * @deprecated Use getSilhouetteBySize with explicit size when available
 */
export function getSilhouette(shipClassId: string, shipClassName?: string): ShipSilhouetteData {
  const size = inferShipSize(shipClassId, shipClassName);
  return getSilhouetteBySize(size);
}

export { smallShipSilhouette, mediumShipSilhouette, largeShipSilhouette };
