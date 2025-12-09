import type { ModuleSlot, ModuleInstance, ModuleVariant } from '@frigate/api-client';

/**
 * Position for a module slot marker on the blueprint canvas
 */
export interface SlotPosition {
  /** Module slot group (e.g., "propulsion", "weapons", "power") */
  group: string;
  /** X position as percentage (0-100) of canvas width */
  x: number;
  /** Y position as percentage (0-100) of canvas height */
  y: number;
  /** Attachment point X on ship silhouette (percentage) */
  attachX: number;
  /** Attachment point Y on ship silhouette (percentage) */
  attachY: number;
  /** Label position relative to marker */
  labelPosition: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Ship silhouette definition with slot positions
 */
export interface ShipSilhouetteData {
  /** Ship class ID (or 'generic' for fallback) */
  shipClassId: string;
  /** Ship class name for display */
  displayName: string;
  /** SVG path data for the ship outline */
  pathData: string;
  /** Viewbox dimensions */
  viewBox: { width: number; height: number };
  /** Module slot positions indexed by group - used to position instances by their slot's group */
  slotPositions: Record<string, SlotPosition[]>;
}

/**
 * Props for the main blueprint canvas component
 *
 * The blueprint shows ALL instances (slots added via Module Slot Browser).
 * - Instance with variant_id = null → Empty slot (awaiting module selection)
 * - Instance with variant_id set → Slot with installed module
 */
export interface ShipBlueprintCanvasProps {
  /** Ship class ID to render silhouette for */
  shipClassId: string;
  /** Ship class display name */
  shipClassName?: string;
  /** Available module slot type definitions */
  moduleSlots: ModuleSlot[];
  /** Module slot types lookup by ID */
  moduleSlotsById: Record<string, ModuleSlot>;
  /** Module variants lookup by ID */
  variantsById?: Record<string, ModuleVariant>;
  /** All module instances (slots added to ship) */
  instances: ModuleInstance[];
  /** Currently selected instance ID */
  selectedInstanceId?: string | null;
  /** Callback when an instance is clicked (opens catalog to select/change module) */
  onSelectInstance?: (instanceId: string) => void;
  /** Callback when remove is requested */
  onRemoveInstance?: (instanceId: string) => void;
  /** Callback when selection should be cleared (Escape key) */
  onClearSelection?: () => void;
  /** Whether the ship class data is loading */
  isLoading?: boolean;
  /** Error message if ship class failed to load */
  error?: string | null;
}

/**
 * Props for individual module slot marker
 *
 * Each marker represents a ModuleInstance (an added slot).
 * - isEmpty = true means variant_id is null AND slot has variants to choose from
 * - isEmpty = false means either variant is selected OR slot has no variants (finalized)
 */
export interface ModuleSlotMarkerProps {
  /** Module slot type definition */
  slot?: ModuleSlot;
  /** Module instance (the added slot) */
  instance?: ModuleInstance;
  /** Installed module variant (if any) */
  variant?: ModuleVariant;
  /** Position on canvas */
  position: SlotPosition;
  /** Whether this marker is selected */
  isSelected?: boolean;
  /** Whether this slot is empty (needs variant selection) */
  isEmpty?: boolean;
  /** Whether this slot type has variants to configure (if false, slot is finalized when added) */
  hasVariants?: boolean;
  /** Click handler (opens catalog) - only called if hasVariants is true */
  onClick?: () => void;
  /** Remove handler (Delete/Backspace key) */
  onRemove?: () => void;
  /** Group label for display */
  groupLabel?: string;
}

/**
 * Props for connection line between marker and ship
 */
export interface ConnectionLineProps {
  /** Start point (marker position) */
  startX: number;
  startY: number;
  /** End point (ship attachment) */
  endX: number;
  endY: number;
  /** Whether the connected marker is selected */
  isSelected?: boolean;
  /** Whether the connected slot is empty */
  isEmpty?: boolean;
}
