# Ship Inventory Workspace - Implementation Action Plan

**Version**: 1.0.0
**Date**: December 2025
**Related**: [Design Document](inventory-screen.md) | [Design Philosophy](design/design-philosophy.md) | [Ship Design Workspace Action Plan](ship-design-workspace-action-plan.md)

---

## Overview

This document outlines the implementation plan for the Ship Inventory Workspace, which allows players to load ammunition and cargo onto their ship after completing ship design. The workspace follows the established lobby workflow pattern and reuses UI patterns from the Ship Design Workspace.

### Workflow Position

```
Player Selection → Team Selection → Ship Selection → Ship Design → [REGISTER SCHEMATIC]
                                                                            ↓
                                                            Ship Inventory Workspace
                                                                            ↓
                                                            [REGISTER CARGO] → (future steps)
```

### Key Constraints

1. **Weight**: Remaining weight capacity after module installation (from Ship Design step)
2. **Credits**: Team's credit balance minus ship construction costs
3. **Compatibility**: Ammunition must match installed weapon systems (filterable)

---

## Current State Analysis

### What Exists

| Component | Location | Status |
|-----------|----------|--------|
| Ammunition catalog API | `GET /v1/catalog/ammo`, `/v1/catalog/ammo/<category>`, `/v1/catalog/ammo/<category>/<id>` | Backend complete |
| Ammunition config | `hyperion/src/config/weapon.rs` - `AmmunitionConfig` struct | Backend complete |
| Inventory model | `hyperion/src/models/status.rs` - `Inventory` struct | Backend complete |
| Weight tracking | `ShipStatsPanel.tsx` - weight/weightMax fields | Frontend complete |
| Credit tracking | `ShipStatsPanel.tsx` - creditCost/creditBudget fields | Frontend complete |
| Lobby workflow store | `lobbyWorkflowStore.ts` - manages step transitions | Frontend complete |
| Module catalog patterns | `ModuleCatalog.tsx`, `ModuleSlotBrowser.tsx` | Reusable patterns |

### What's Missing

| Component | Description |
|-----------|-------------|
| Workflow step | Add `'inventory'` step after `'design'` in workflow store |
| Ammunition types | TypeScript interfaces for ammo data |
| Ammo catalog hooks | React hooks for fetching ammunition data |
| Inventory store | Zustand store for managing cargo/ammo selections |
| Inventory workspace | Main container component |
| Ammo browser | Searchable/filterable ammunition list |
| Inventory panel | Current cargo display with add/remove |
| Stats panel | Weight/credit constraint display (reuse ShipStatsPanel pattern) |
| Ammo tooltip | Detailed ammo information on hover |
| Ammo detail modal | Full ammo specs on click |
| Compatibility filter | Filter ammo by installed weapon types |

---

## Design Philosophy Compliance

Per [design-philosophy.md](design/design-philosophy.md), the inventory workspace must adhere to:

### Visual Requirements

- **Zero icons or emojis** - All UI elements are text-only
- **Flat rectangles** - No gradients, shadows, or rounded corners (`border-radius: 0`)
- **ASCII art borders** - Use box-drawing characters for visual separation
- **Muted color palette** - Grays, blues; bright colors only for alerts
- **Monospace fonts** - All text uses monospace typography
- **No box shadows** - All elements have `boxShadow: 'none'`

### Interaction Requirements

- **Bracket notation buttons** - `[+]`, `[-]`, `[REGISTER CARGO]`, `[FILTER]`
- **Technical jargon** - Use abbreviations: `WT` (weight), `CR` (credits), `QTY` (quantity)
- **Keyboard-driven** - Every action accessible via keyboard shortcuts
- **Hover tooltips** - Detailed info appears on hover (300ms delay)
- **Click modals** - Full specs appear in modal dialog on click

### Accessibility Requirements

- **High contrast** - Black backgrounds with bright text
- **Screen reader support** - Proper ARIA labels and roles
- **Focus management** - Tab navigation, focus trapping in modals
- **Keyboard shortcuts** - `/` search, `+`/`-` adjust quantity, `Esc` close

---

## Implementation Phases

### Phase 1: Type Definitions & API Integration

**Goal**: Define TypeScript interfaces and create API hooks for ammunition data.

**Estimated Effort**: Low

#### Task 1.1: Ammunition Type Definitions

**File**: `packages/api-client/src/types.ts`

Add ammunition interfaces based on backend `AmmunitionConfig`:

```typescript
/**
 * Ammunition category identifiers
 */
export type AmmoCategory = 'kinetic' | 'missiles' | 'torpedos';

/**
 * Ammunition configuration from catalog API
 */
export interface Ammunition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: AmmoCategory;

  /** Ammo type for kinetic weapons (e.g., "shell", "slug") */
  readonly ammo_type?: string;
  /** Ammo size for kinetic weapons (e.g., "50mm", "200mm") */
  readonly ammo_size?: string;

  /** Cost per unit in credits */
  readonly cost: number;
  /** Weight per unit in metric tons */
  readonly weight: number;

  /** Impact damage on direct hit */
  readonly impact_damage: number;
  /** Blast radius for explosive rounds (0 for kinetic) */
  readonly blast_radius: number;
  /** Blast damage within radius */
  readonly blast_damage: number;
  /** Projectile velocity in m/s */
  readonly velocity: number;
  /** Armor penetration value */
  readonly armor_penetration: number;
}

/**
 * Inventory item representing loaded ammunition
 */
export interface InventoryItem {
  readonly ammoId: string;
  readonly quantity: number;
}

/**
 * Ship inventory state
 */
export interface ShipInventory {
  readonly ammunition: readonly InventoryItem[];
  readonly cargo: readonly InventoryItem[];
}
```

#### Task 1.2: Ammunition API Client

**File**: `packages/api-client/src/catalog.ts`

Add ammunition catalog API functions:

```typescript
/**
 * Fetch ammunition categories
 */
export async function getAmmoCategories(apiUrl: string): Promise<AmmoCategory[]> {
  const response = await fetch(`${apiUrl}/v1/catalog/ammo`);
  if (!response.ok) throw new Error(`Failed to fetch ammo categories: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch ammunition IDs in a category
 */
export async function getAmmoInCategory(apiUrl: string, category: AmmoCategory): Promise<string[]> {
  const response = await fetch(`${apiUrl}/v1/catalog/ammo/${category}`);
  if (!response.ok) throw new Error(`Failed to fetch ammo list: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch detailed ammunition information
 */
export async function getAmmoDetails(
  apiUrl: string,
  category: AmmoCategory,
  ammoId: string
): Promise<Ammunition> {
  const response = await fetch(`${apiUrl}/v1/catalog/ammo/${category}/${ammoId}`);
  if (!response.ok) throw new Error(`Failed to fetch ammo details: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch all ammunition with full details
 */
export async function getAllAmmunition(apiUrl: string): Promise<Ammunition[]> {
  const categories = await getAmmoCategories(apiUrl);
  const allAmmo: Ammunition[] = [];

  for (const category of categories) {
    const ammoIds = await getAmmoInCategory(apiUrl, category);
    for (const ammoId of ammoIds) {
      const ammo = await getAmmoDetails(apiUrl, category, ammoId);
      allAmmo.push({ ...ammo, category });
    }
  }

  return allAmmo;
}
```

#### Task 1.3: Ammunition Hook

**File**: `packages/ui/src/hooks/useAmmunition.ts` (new file)

Create React hook for ammunition data:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { getAllAmmunition, type Ammunition, type AmmoCategory } from '@frigate/api-client';

export interface UseAmmunitionResult {
  ammunition: Ammunition[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAmmunition(apiUrl: string): UseAmmunitionResult {
  const [ammunition, setAmmunition] = useState<Ammunition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmmunition = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAmmunition(apiUrl);
      setAmmunition(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load ammunition');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchAmmunition();
  }, [fetchAmmunition]);

  return { ammunition, loading, error, refetch: fetchAmmunition };
}
```

---

### Phase 2: Inventory State Management

**Goal**: Create Zustand store for managing inventory selections and calculations.

**Estimated Effort**: Medium

#### Task 2.1: Inventory Store

**File**: `packages/ui/src/stores/inventoryStore.ts` (new file)

```typescript
import { create } from 'zustand';
import type { Ammunition, InventoryItem } from '@frigate/api-client';

export interface InventoryState {
  /** Current ammunition selections */
  ammunition: Map<string, number>;  // ammoId -> quantity

  /** Ammunition catalog (loaded from API) */
  ammoCatalog: Ammunition[];

  /** Ship's remaining weight capacity (from design step) */
  availableWeight: number;

  /** Team's remaining credits (after ship construction) */
  availableCredits: number;

  /** Installed weapon compatibility info */
  compatibleAmmoTypes: Set<string>;  // Set of "ammo_type:ammo_size" strings
  compatibleMissiles: boolean;
  compatibleTorpedos: boolean;

  // Actions
  setAmmoCatalog: (catalog: Ammunition[]) => void;
  setConstraints: (weight: number, credits: number) => void;
  setCompatibility: (
    ammoTypes: Set<string>,
    hasMissiles: boolean,
    hasTorpedos: boolean
  ) => void;

  addAmmo: (ammoId: string, quantity?: number) => void;
  removeAmmo: (ammoId: string, quantity?: number) => void;
  setAmmoQuantity: (ammoId: string, quantity: number) => void;
  clearInventory: () => void;

  // Computed values
  getTotalWeight: () => number;
  getTotalCost: () => number;
  getInventoryItems: () => InventoryItem[];
  isOverWeight: () => boolean;
  isOverBudget: () => boolean;
  canAddAmmo: (ammoId: string, quantity?: number) => boolean;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  ammunition: new Map(),
  ammoCatalog: [],
  availableWeight: 0,
  availableCredits: 0,
  compatibleAmmoTypes: new Set(),
  compatibleMissiles: false,
  compatibleTorpedos: false,

  setAmmoCatalog: (catalog) => set({ ammoCatalog: catalog }),

  setConstraints: (weight, credits) => set({
    availableWeight: weight,
    availableCredits: credits,
  }),

  setCompatibility: (ammoTypes, hasMissiles, hasTorpedos) => set({
    compatibleAmmoTypes: ammoTypes,
    compatibleMissiles: hasMissiles,
    compatibleTorpedos: hasTorpedos,
  }),

  addAmmo: (ammoId, quantity = 1) => {
    const state = get();
    if (!state.canAddAmmo(ammoId, quantity)) return;

    const current = state.ammunition.get(ammoId) || 0;
    const newAmmo = new Map(state.ammunition);
    newAmmo.set(ammoId, current + quantity);
    set({ ammunition: newAmmo });
  },

  removeAmmo: (ammoId, quantity = 1) => {
    const state = get();
    const current = state.ammunition.get(ammoId) || 0;
    const newAmmo = new Map(state.ammunition);

    if (current <= quantity) {
      newAmmo.delete(ammoId);
    } else {
      newAmmo.set(ammoId, current - quantity);
    }
    set({ ammunition: newAmmo });
  },

  setAmmoQuantity: (ammoId, quantity) => {
    const newAmmo = new Map(get().ammunition);
    if (quantity <= 0) {
      newAmmo.delete(ammoId);
    } else {
      newAmmo.set(ammoId, quantity);
    }
    set({ ammunition: newAmmo });
  },

  clearInventory: () => set({ ammunition: new Map() }),

  getTotalWeight: () => {
    const state = get();
    let total = 0;
    state.ammunition.forEach((qty, ammoId) => {
      const ammo = state.ammoCatalog.find(a => a.id === ammoId);
      if (ammo) total += ammo.weight * qty;
    });
    return total;
  },

  getTotalCost: () => {
    const state = get();
    let total = 0;
    state.ammunition.forEach((qty, ammoId) => {
      const ammo = state.ammoCatalog.find(a => a.id === ammoId);
      if (ammo) total += ammo.cost * qty;
    });
    return total;
  },

  getInventoryItems: () => {
    const items: InventoryItem[] = [];
    get().ammunition.forEach((quantity, ammoId) => {
      items.push({ ammoId, quantity });
    });
    return items;
  },

  isOverWeight: () => {
    const state = get();
    return state.getTotalWeight() > state.availableWeight;
  },

  isOverBudget: () => {
    const state = get();
    return state.getTotalCost() > state.availableCredits;
  },

  canAddAmmo: (ammoId, quantity = 1) => {
    const state = get();
    const ammo = state.ammoCatalog.find(a => a.id === ammoId);
    if (!ammo) return false;

    const currentWeight = state.getTotalWeight();
    const currentCost = state.getTotalCost();
    const addedWeight = ammo.weight * quantity;
    const addedCost = ammo.cost * quantity;

    return (
      currentWeight + addedWeight <= state.availableWeight &&
      currentCost + addedCost <= state.availableCredits
    );
  },
}));
```

#### Task 2.2: Workflow Store Update

**File**: `packages/ui/src/lobby/lobbyWorkflowStore.ts`

Update workflow to include inventory step:

```typescript
// Update WorkflowStep type
export type WorkflowStep = 'player' | 'team' | 'ship' | 'design' | 'inventory';

// Add state field for tracking registered schematic
interface LobbyWorkflowState {
  // ... existing fields
  registeredSchematicId: string | null;

  // Add action
  registerSchematic: (schematicId: string) => void;
}

// In store implementation:
registerSchematic: (schematicId) => set({
  registeredSchematicId: schematicId,
  currentStep: 'inventory',
}),
```

---

### Phase 3: Core UI Components

**Goal**: Build the main inventory workspace layout and ammunition browser.

**Estimated Effort**: High

#### Task 3.1: Inventory Workspace Container

**File**: `packages/ui/src/lobby/InventoryWorkspace.tsx` (new file)

Main container following the three-column layout pattern from Ship Design Workspace:

```typescript
/**
 * Ship Inventory Workspace
 *
 * Allows players to load ammunition and cargo onto their ship
 * after completing ship design. Uses remaining weight capacity
 * and team credits as constraints.
 *
 * Layout: [Ammo Browser] | [Loaded Inventory] | [Constraints Panel]
 */
export interface InventoryWorkspaceProps {
  apiUrl: string;
  player: Player;
  team: Team;
  blueprintId: string;
  /** Remaining weight capacity after module installation */
  availableWeight: number;
  /** Blueprint's installed modules (for compatibility filtering) */
  installedModules: ModuleInstance[];
  onBack?: () => void;
  onDisconnect?: () => void;
  onRegisterCargo?: () => void;
  className?: string;
}

export function InventoryWorkspace({
  apiUrl,
  player,
  team,
  blueprintId,
  availableWeight,
  installedModules,
  onBack,
  onDisconnect,
  onRegisterCargo,
  className = '',
}: InventoryWorkspaceProps): React.ReactElement {
  // Implementation follows ShipDesignWorkspace patterns
}
```

**Layout Structure**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Ship Name | Blueprint ID | [BACK] [DISCONNECT]                     │
├─────────────────────┬─────────────────────────┬─────────────────────────────┤
│                     │                         │                             │
│  AMMUNITION BROWSER │   LOADED INVENTORY      │   CONSTRAINTS PANEL         │
│                     │                         │                             │
│  [/] Search...      │   [NO ITEMS LOADED]     │   WEIGHT                    │
│  [FILTER] [SORT]    │                         │   ████████░░░░ 850/1200 t   │
│                     │   ─────────────────     │                             │
│  KINETIC            │   ITEM NAME        QTY  │   CREDITS                   │
│  ├─ 50mm Shell  [+] │   200mm Shells     100  │   ████░░░░░░░░ 45k/500k CR  │
│  ├─ 100mm Slug  [+] │     [+] [-]             │                             │
│  └─ 200mm AP    [+] │   Torpedo Mk1       10  │   ─────────────────         │
│                     │     [+] [-]             │   AMMO LOADED: 2 TYPES      │
│  MISSILES           │                         │   TOTAL ITEMS: 110          │
│  ├─ Missile Mk1 [+] │                         │                             │
│  └─ Missile Mk2 [+] │                         │   [WARNING] NO TORPEDOS     │
│                     │                         │   INSTALLED                 │
│  TORPEDOS           │                         │                             │
│  └─ Torpedo Mk1 [+] │                         │                             │
│                     │                         │                             │
├─────────────────────┴─────────────────────────┴─────────────────────────────┤
│ FOOTER: [/] SEARCH  [F] FILTER  [+/-] QTY  [ENTER] ADD    [REGISTER CARGO >]│
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Task 3.2: Ammunition Browser Component

**File**: `packages/ui/src/lobby/AmmunitionBrowser.tsx` (new file)

Searchable, filterable ammunition list with category grouping:

```typescript
export interface AmmunitionBrowserProps {
  ammunition: Ammunition[];
  loading: boolean;
  error: string | null;

  /** Filter to show only compatible ammo (based on installed weapons) */
  showCompatibleOnly: boolean;
  onToggleCompatibleFilter: () => void;

  /** Compatibility info from installed modules */
  compatibleAmmoTypes: Set<string>;
  compatibleMissiles: boolean;
  compatibleTorpedos: boolean;

  /** Callback when ammo is added */
  onAddAmmo: (ammoId: string) => void;

  /** Check if adding ammo is allowed (weight/credit constraints) */
  canAddAmmo: (ammoId: string) => boolean;

  className?: string;
}

export function AmmunitionBrowser({
  ammunition,
  loading,
  error,
  showCompatibleOnly,
  onToggleCompatibleFilter,
  compatibleAmmoTypes,
  compatibleMissiles,
  compatibleTorpedos,
  onAddAmmo,
  canAddAmmo,
  className = '',
}: AmmunitionBrowserProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'weight'>('name');

  // Group ammunition by category
  const groupedAmmo = useMemo(() => {
    let filtered = ammunition;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      );
    }

    // Apply compatibility filter
    if (showCompatibleOnly) {
      filtered = filtered.filter(a => isAmmoCompatible(a, ...));
    }

    // Sort
    filtered = sortAmmunition(filtered, sortBy);

    // Group by category
    return groupBy(filtered, 'category');
  }, [ammunition, searchQuery, showCompatibleOnly, sortBy]);

  // ... render implementation
}
```

#### Task 3.3: Ammunition Card Component

**File**: `packages/ui/src/lobby/AmmunitionCard.tsx` (new file)

Individual ammunition item in the browser:

```typescript
export interface AmmunitionCardProps {
  ammo: Ammunition;
  isCompatible: boolean;
  canAdd: boolean;
  onAdd: () => void;
  onShowDetails: () => void;
  className?: string;
}

export function AmmunitionCard({
  ammo,
  isCompatible,
  canAdd,
  onAdd,
  onShowDetails,
  className = '',
}: AmmunitionCardProps): React.ReactElement {
  // Render: Name, cost/weight summary, [+] button, compatibility indicator
  // Hover shows tooltip, click shows detail modal
}
```

**Display Format**:
```
┌────────────────────────────────────────┐
│ 200MM AP SHELL                    [+]  │
│ 150 CR | 0.5 t | [COMPATIBLE]          │
└────────────────────────────────────────┘
```

#### Task 3.4: Loaded Inventory Panel

**File**: `packages/ui/src/lobby/LoadedInventoryPanel.tsx` (new file)

Displays currently loaded ammunition with quantity controls:

```typescript
export interface LoadedInventoryPanelProps {
  inventory: InventoryItem[];
  ammoCatalog: Ammunition[];
  onAddQuantity: (ammoId: string) => void;
  onRemoveQuantity: (ammoId: string) => void;
  onSetQuantity: (ammoId: string, quantity: number) => void;
  onRemoveAll: (ammoId: string) => void;
  className?: string;
}
```

**Display Format**:
```
┌─────────────────────────────────────────────────────────────┐
│ LOADED INVENTORY                                            │
├─────────────────────────────────────────────────────────────┤
│ 200MM AP SHELLS                                        100  │
│   150 CR/ea | 0.5 t/ea | TOTAL: 15,000 CR | 50 t           │
│   [-10] [-1] [QTY INPUT] [+1] [+10] [REMOVE]               │
├─────────────────────────────────────────────────────────────┤
│ TORPEDO MK1                                             10  │
│   5,000 CR/ea | 2.0 t/ea | TOTAL: 50,000 CR | 20 t         │
│   [-10] [-1] [QTY INPUT] [+1] [+10] [REMOVE]               │
└─────────────────────────────────────────────────────────────┘
```

#### Task 3.5: Inventory Constraints Panel

**File**: `packages/ui/src/lobby/InventoryConstraintsPanel.tsx` (new file)

Reuses patterns from `ShipStatsPanel.tsx`:

```typescript
export interface InventoryStats {
  /** Current cargo weight */
  cargoWeight: number;
  /** Available weight capacity */
  weightCapacity: number;

  /** Current cargo credit cost */
  cargoCost: number;
  /** Available team credits */
  creditBudget: number;

  /** Number of ammo types loaded */
  ammoTypesLoaded: number;
  /** Total item count */
  totalItems: number;

  /** Compatibility warnings (e.g., "No torpedo tubes installed") */
  warnings: string[];
}

export interface InventoryConstraintsPanelProps {
  stats: InventoryStats;
  onRegisterCargo?: () => void;
  className?: string;
}
```

---

### Phase 4: Tooltips & Detail Modals

**Goal**: Add hover tooltips and click-to-view detail modals for ammunition.

**Estimated Effort**: Medium

#### Task 4.1: Ammunition Tooltip Component

**File**: `packages/ui/src/components/AmmunitionTooltip.tsx` (new file)

Follows `ModuleTooltip.tsx` patterns:

```typescript
export interface AmmunitionTooltipProps {
  ammo: Ammunition;
  isCompatible: boolean;
  incompatibilityReason?: string;
  children: React.ReactNode;
}
```

**Tooltip Content**:
```
┌──────────────────────────────────────┐
│ 200MM ARMOR-PIERCING SHELL           │
├──────────────────────────────────────┤
│ High-velocity kinetic penetrator     │
│ designed for capital ship armor.     │
├──────────────────────────────────────┤
│ COST:       150 CR                   │
│ WEIGHT:     0.5 t                    │
│ DAMAGE:     1,200                    │
│ VELOCITY:   2,500 m/s                │
│ PENETRATION: 85                      │
├──────────────────────────────────────┤
│ [COMPATIBLE] 200mm Railgun           │
└──────────────────────────────────────┘
```

#### Task 4.2: Ammunition Detail Modal

**File**: `packages/ui/src/lobby/AmmunitionDetailModal.tsx` (new file)

Full ammunition specification display:

```typescript
export interface AmmunitionDetailModalProps {
  ammo: Ammunition | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToInventory: (ammoId: string, quantity: number) => void;
  canAdd: boolean;
}
```

**Modal Layout**:
```
┌────────────────────────────────────────────────────────────────┐
│ AMMUNITION DETAILS                                    [CLOSE]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ 200MM ARMOR-PIERCING SHELL                                     │
│ ─────────────────────────────────────────────────────────────  │
│                                                                │
│ High-velocity kinetic penetrator designed for engagement       │
│ against capital ship armor plating. Tungsten carbide core      │
│ with depleted uranium jacket for maximum penetration.          │
│                                                                │
│ SPECIFICATIONS                                                 │
│ ┌────────────────┬────────────────┬────────────────┐           │
│ │ COST           │ WEIGHT         │ TYPE           │           │
│ │ 150 CR         │ 0.5 t          │ KINETIC/200MM  │           │
│ ├────────────────┼────────────────┼────────────────┤           │
│ │ IMPACT DMG     │ BLAST DMG      │ BLAST RADIUS   │           │
│ │ 1,200          │ 0              │ 0 m            │           │
│ ├────────────────┼────────────────┼────────────────┤           │
│ │ VELOCITY       │ PENETRATION    │                │           │
│ │ 2,500 m/s      │ 85             │                │           │
│ └────────────────┴────────────────┴────────────────┘           │
│                                                                │
│ COMPATIBLE WEAPONS                                             │
│ ├─ 200mm Railgun Mk1                                           │
│ └─ 200mm Railgun Mk2                                           │
│                                                                │
│ ADD TO INVENTORY                                               │
│ Quantity: [____10____] [+10] [+100]                            │
│                                                                │
│ SUBTOTAL: 1,500 CR | 5.0 t                                     │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ [ESC] CLOSE                              [ADD TO INVENTORY]    │
└────────────────────────────────────────────────────────────────┘
```

---

### Phase 5: Compatibility Filtering

**Goal**: Implement ammunition filtering based on installed weapon modules.

**Estimated Effort**: Medium

#### Task 5.1: Weapon Compatibility Extraction

**File**: `packages/ui/src/lobby/utils/ammoCompatibility.ts` (new file)

Extract compatibility info from installed modules:

```typescript
import type { ModuleInstance, ModuleVariant, Ammunition } from '@frigate/api-client';

/**
 * Weapon compatibility information extracted from installed modules
 */
export interface WeaponCompatibility {
  /** Set of "ammo_type:ammo_size" strings for kinetic weapons */
  kineticAmmoTypes: Set<string>;
  /** Whether ship has missile launchers installed */
  hasMissileLaunchers: boolean;
  /** Whether ship has torpedo tubes installed */
  hasTorpedoTubes: boolean;
  /** Map of ammo type key to weapon names for tooltip display */
  weaponsByAmmoType: Map<string, string[]>;
}

/**
 * Extract weapon compatibility from installed module variants
 */
export function extractWeaponCompatibility(
  modules: ModuleInstance[],
  variants: Map<string, ModuleVariant>
): WeaponCompatibility {
  const compatibility: WeaponCompatibility = {
    kineticAmmoTypes: new Set(),
    hasMissileLaunchers: false,
    hasTorpedoTubes: false,
    weaponsByAmmoType: new Map(),
  };

  for (const module of modules) {
    const variant = variants.get(module.variant_id);
    if (!variant) continue;

    // Check for kinetic weapons
    if (variant.stats?.ammo_type && variant.stats?.ammo_size) {
      const key = `${variant.stats.ammo_type}:${variant.stats.ammo_size}`;
      compatibility.kineticAmmoTypes.add(key);

      const weapons = compatibility.weaponsByAmmoType.get(key) || [];
      weapons.push(variant.name);
      compatibility.weaponsByAmmoType.set(key, weapons);
    }

    // Check for missile launchers (slot type or variant name pattern)
    if (module.module_slot_id.includes('missile') ||
        variant.name.toLowerCase().includes('missile')) {
      compatibility.hasMissileLaunchers = true;
    }

    // Check for torpedo tubes
    if (module.module_slot_id.includes('torpedo') ||
        variant.name.toLowerCase().includes('torpedo')) {
      compatibility.hasTorpedoTubes = true;
    }
  }

  return compatibility;
}

/**
 * Check if ammunition is compatible with installed weapons
 */
export function isAmmoCompatible(
  ammo: Ammunition,
  compatibility: WeaponCompatibility
): { compatible: boolean; reason?: string; weapons?: string[] } {
  if (ammo.category === 'kinetic') {
    const key = `${ammo.ammo_type}:${ammo.ammo_size}`;
    const weapons = compatibility.weaponsByAmmoType.get(key);
    if (weapons && weapons.length > 0) {
      return { compatible: true, weapons };
    }
    return {
      compatible: false,
      reason: `No ${ammo.ammo_size} ${ammo.ammo_type} weapons installed`
    };
  }

  if (ammo.category === 'missiles') {
    if (compatibility.hasMissileLaunchers) {
      return { compatible: true };
    }
    return { compatible: false, reason: 'No missile launchers installed' };
  }

  if (ammo.category === 'torpedos') {
    if (compatibility.hasTorpedoTubes) {
      return { compatible: true };
    }
    return { compatible: false, reason: 'No torpedo tubes installed' };
  }

  return { compatible: true };
}
```

#### Task 5.2: Compatibility Filter Toggle

**Important**: Per the design document, the compatibility filter should be **enabled by default**, excluding unusable ammunition. Players can toggle it off to see all ammunition (with incompatible items visually indicated).

Add to `AmmunitionBrowser.tsx`:

```typescript
// Filter state - enabled by default per design doc
const [showCompatibleOnly, setShowCompatibleOnly] = useState(true);

// Filter UI element
<div style={{ display: 'flex', gap: 'var(--frigate-space-2)' }}>
  <Button
    variant={showCompatibleOnly ? 'primary' : 'secondary'}
    onClick={onToggleCompatibleFilter}
  >
    {showCompatibleOnly ? '[COMPATIBLE ONLY]' : '[SHOW ALL]'}
  </Button>
</div>

// Incompatible items display with muted styling and warning indicator
{!isCompatible && (
  <span style={{ color: 'var(--frigate-warning)' }}>
    [NO WEAPON]
  </span>
)}
```

---

### Phase 6: Integration & Testing

**Goal**: Integrate inventory workspace into lobby flow and add comprehensive tests.

**Estimated Effort**: Medium

#### Task 6.1: Lobby Workflow Integration

**File**: `packages/ui/src/lobby/LobbyRouter.tsx` (or equivalent routing component)

Add inventory step to lobby flow:

```typescript
// After ship design, when "REGISTER SCHEMATIC" is clicked:
case 'inventory':
  return (
    <InventoryWorkspace
      apiUrl={apiUrl}
      player={player}
      team={team}
      blueprintId={selectedBlueprintId}
      availableWeight={remainingWeight}
      installedModules={blueprintModules}
      onBack={() => workflowStore.goBack()}
      onDisconnect={onDisconnect}
      onRegisterCargo={handleRegisterCargo}
    />
  );
```

#### Task 6.2: Unit Tests

**Files**:
- `packages/ui/src/lobby/__tests__/InventoryWorkspace.test.tsx`
- `packages/ui/src/lobby/__tests__/AmmunitionBrowser.test.tsx`
- `packages/ui/src/lobby/__tests__/LoadedInventoryPanel.test.tsx`
- `packages/ui/src/stores/__tests__/inventoryStore.test.ts`

Test coverage should include:

1. **Store Tests**:
   - Adding/removing ammunition
   - Weight calculation
   - Cost calculation
   - Constraint validation (over weight, over budget)
   - Clearing inventory

2. **Browser Tests**:
   - Search filtering
   - Category grouping
   - Compatibility filtering
   - Sort options
   - Keyboard navigation

3. **Panel Tests**:
   - Quantity adjustment controls
   - Total calculations
   - Warning display
   - Empty state

4. **Integration Tests**:
   - Full workflow from design to inventory
   - Constraint propagation from design step
   - Register cargo action

#### Task 6.3: Storybook Stories

**File**: `packages/ui/src/stories/InventoryWorkflow.stories.tsx`

```typescript
export default {
  title: 'Lobby/Inventory',
  parameters: { layout: 'fullscreen' },
};

export const AmmunitionBrowserEmpty: StoryObj = { /* ... */ };
export const AmmunitionBrowserLoaded: StoryObj = { /* ... */ };
export const AmmunitionBrowserFiltered: StoryObj = { /* ... */ };
export const LoadedInventoryEmpty: StoryObj = { /* ... */ };
export const LoadedInventoryWithItems: StoryObj = { /* ... */ };
export const ConstraintsPanelNormal: StoryObj = { /* ... */ };
export const ConstraintsPanelOverWeight: StoryObj = { /* ... */ };
export const ConstraintsPanelOverBudget: StoryObj = { /* ... */ };
export const FullWorkspace: StoryObj = { /* ... */ };
```

---

## File Reference

### New Files to Create

| Path | Purpose |
|------|---------|
| `packages/ui/src/hooks/useAmmunition.ts` | React hook for ammunition data |
| `packages/ui/src/stores/inventoryStore.ts` | Zustand store for inventory state |
| `packages/ui/src/lobby/InventoryWorkspace.tsx` | Main workspace container |
| `packages/ui/src/lobby/AmmunitionBrowser.tsx` | Searchable ammo list |
| `packages/ui/src/lobby/AmmunitionCard.tsx` | Individual ammo item card |
| `packages/ui/src/lobby/LoadedInventoryPanel.tsx` | Current cargo display |
| `packages/ui/src/lobby/InventoryConstraintsPanel.tsx` | Weight/credit constraints |
| `packages/ui/src/components/AmmunitionTooltip.tsx` | Hover tooltip |
| `packages/ui/src/lobby/AmmunitionDetailModal.tsx` | Full specs modal |
| `packages/ui/src/lobby/utils/ammoCompatibility.ts` | Compatibility utilities |
| `packages/ui/src/stories/InventoryWorkflow.stories.tsx` | Storybook stories |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/api-client/src/types.ts` | Add `Ammunition`, `InventoryItem`, `ShipInventory` types |
| `packages/api-client/src/catalog.ts` | Add ammunition API functions |
| `packages/ui/src/lobby/lobbyWorkflowStore.ts` | Add `'inventory'` step |
| `packages/ui/src/lobby/ShipDesignWorkspace.tsx` | Wire up "REGISTER SCHEMATIC" to transition |

### Test Files to Create

| Path | Purpose |
|------|---------|
| `packages/ui/src/lobby/__tests__/InventoryWorkspace.test.tsx` | Workspace integration tests |
| `packages/ui/src/lobby/__tests__/AmmunitionBrowser.test.tsx` | Browser component tests |
| `packages/ui/src/lobby/__tests__/LoadedInventoryPanel.test.tsx` | Inventory panel tests |
| `packages/ui/src/stores/__tests__/inventoryStore.test.ts` | Store unit tests |
| `packages/ui/src/components/__tests__/AmmunitionTooltip.test.tsx` | Tooltip tests |

---

## Implementation Priority

### Phase 1: Type Definitions & API (Immediate)

| Task | Effort | Dependencies |
|------|--------|--------------|
| Task 1.1: Ammunition types | Low | None |
| Task 1.2: API client | Low | Task 1.1 |
| Task 1.3: useAmmunition hook | Low | Task 1.2 |

### Phase 2: State Management (High Priority)

| Task | Effort | Dependencies |
|------|--------|--------------|
| Task 2.1: Inventory store | Medium | Task 1.1 |
| Task 2.2: Workflow store update | Low | None |

### Phase 3: Core UI (High Priority)

| Task | Effort | Dependencies |
|------|--------|--------------|
| Task 3.1: InventoryWorkspace | High | Phase 2 |
| Task 3.2: AmmunitionBrowser | Medium | Task 1.3 |
| Task 3.3: AmmunitionCard | Low | Task 3.2 |
| Task 3.4: LoadedInventoryPanel | Medium | Task 2.1 |
| Task 3.5: InventoryConstraintsPanel | Medium | Task 2.1 |

### Phase 4: Tooltips & Modals (Medium Priority)

| Task | Effort | Dependencies |
|------|--------|--------------|
| Task 4.1: AmmunitionTooltip | Low | Task 1.1 |
| Task 4.2: AmmunitionDetailModal | Medium | Task 4.1 |

### Phase 5: Compatibility (Medium Priority)

| Task | Effort | Dependencies |
|------|--------|--------------|
| Task 5.1: Compatibility utilities | Medium | Task 1.1 |
| Task 5.2: Filter toggle | Low | Task 5.1 |

### Phase 6: Integration & Testing (Final)

| Task | Effort | Dependencies |
|------|--------|--------------|
| Task 6.1: Workflow integration | Medium | Phase 3 |
| Task 6.2: Unit tests | Medium | All phases |
| Task 6.3: Storybook stories | Low | Phase 3 |

---

## Acceptance Criteria

### Functional Requirements

1. Players can browse all available ammunition, grouped by category
2. Players can search ammunition by name or description
3. Players can filter to show only compatible ammunition
4. Incompatible ammunition is visually indicated with reason
5. Players can add/remove ammunition with quantity controls
6. Weight constraint is enforced and displayed
7. Credit constraint is enforced and displayed
8. Hover tooltips show ammunition details
9. Click opens full specification modal
10. "REGISTER CARGO" button proceeds to next step

### Design Requirements

11. Zero icons or emojis - all text-based UI
12. Flat rectangles with ASCII borders
13. Monospace typography throughout
14. Bracket notation for buttons (`[+]`, `[-]`, `[FILTER]`)
15. Technical abbreviations (WT, CR, QTY)
16. Muted color palette with alerts for warnings

### Accessibility Requirements

17. Full keyboard navigation
18. Focus trapping in modals
19. ARIA labels on interactive elements
20. Screen reader support
21. High contrast colors

### Quality Requirements

22. All components have unit tests
23. Integration tests cover full workflow
24. TypeScript strict mode compliance
25. No console errors during operation

---

## Summary

| Category | Count |
|----------|-------|
| New files | 11 |
| Modified files | 4 |
| Test files | 5 |
| Phases | 6 |
| Total tasks | 15 |

**Estimated Total Effort**: Medium-High

The implementation builds on established patterns from the Ship Design Workspace, reusing:
- Three-column layout structure
- Zustand store pattern for state management
- Tooltip and modal component patterns
- Constraint bar visualization (ShipStatsPanel)
- Search/filter/sort patterns (ModuleSlotBrowser)

Key differentiators from Ship Design:
- Quantity-based inventory (vs. single-instance modules)
- Category grouping (kinetic, missiles, torpedos)
- Compatibility filtering based on installed weapons
- Per-unit cost/weight calculations
