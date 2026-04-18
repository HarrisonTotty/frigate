/**
 * Shared prop and data interfaces for Ship Design Workspace UI components
 */
import type {
  ModuleSlot,
  ModuleVariant,
  ModuleInstance,
  ShipAggregateStats,
} from "@frigate/api-client";

/** Props for the Module Slot Browser (left column)
 * - Responsible for listing available slot types and adding a slot to blueprint
 */
export interface ModuleSlotBrowserProps {
  readonly apiUrl?: string;
  readonly blueprintId?: string;
  readonly slotTypes: readonly ModuleSlot[];
  readonly installedModules: readonly ModuleInstance[];
  readonly buildPointsUsed: number;
  readonly maxBuildPoints: number;
  readonly onAdd?: (slotTypeId: string) => Promise<void> | void;
  readonly onFilterChange?: (filter: { group?: string; search?: string }) => void;
  readonly className?: string;
}

/** Props for the Installed Modules List (center column)
 * - Shows installed module instances, supports edit/remove
 */
export interface InstalledModulesListProps {
  readonly apiUrl?: string;
  readonly blueprintId?: string;
  readonly modules: readonly ModuleInstance[];
  readonly slotsCache?: Record<string, ModuleSlot> | null;
  readonly variantsCache?: Record<string, ModuleVariant> | null;
  readonly buildPointsUsed: number;
  readonly maxBuildPoints: number;
  readonly onEdit?: (instanceId: string) => Promise<void> | void;
  readonly onRemove?: (instanceId: string) => Promise<void> | void;
  readonly onOpenVariantCatalog?: (instanceId: string, slotId: string) => void;
  readonly className?: string;
}

/** Props for the Module Catalog / Variant Selector modal
 * - Two column layout: variant list and variant details
 */
export interface ModuleCatalogProps {
  readonly isOpen: boolean;
  readonly slotType?: ModuleSlot | null;
  readonly variants?: readonly ModuleVariant[] | null;
  readonly selectedVariantId?: string | null;
  readonly onSelect?: (variantId: string) => Promise<void> | void;
  /** If provided, ModuleCatalog will directly update the blueprint using the store-backed hook */
  readonly blueprintId?: string;
  readonly instanceId?: string;
  readonly onClose?: () => void;
  readonly buildPointsUsed?: number;
  readonly maxBuildPoints?: number;
  readonly className?: string;
}

/** Props for the Ship Statistics Panel (right column)
 * - Displays aggregated stats and warnings
 */
export interface ShipStatsPanelProps {
  readonly stats: ShipAggregateStats;
  readonly detailsOpen?: boolean;
  readonly className?: string;
}

export type { ModuleSlot, ModuleVariant, ModuleInstance, ShipAggregateStats };
