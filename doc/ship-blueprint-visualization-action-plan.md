# Ship Blueprint Visualization - Action Plan

This document provides a detailed implementation plan for the Ship Blueprint Visualization system described in `ship-blueprint-visualization-design.md`.

---

## Core Concept Reminder

**Module Slot (Instance)**: A placeholder added via Module Slot Browser. Represented as a `ModuleInstance` with `variant_id = null`.

**Module (Variant)**: The actual hardware installed in a slot. When user selects a module, `variant_id` is set.

**Key Flow**:
1. User adds slot via Module Slot Browser → Empty slot marker appears on blueprint
2. User can add more slots, or click a slot to select a module (user's choice)
3. User clicks slot on blueprint → Module Catalog opens
4. User selects module → `variant_id` is set on instance

**Important**: Adding a slot does NOT auto-open the catalog. Users have freedom to:
- Add all slots first, then fill them one at a time
- Add and fill each slot immediately
- Mix and match approaches

---

## Phase 1: Foundation

### TASK-1: Create Component Structure
**Effort:** 1-2 hours

Create the directory structure and base component files:

```
packages/ui/src/lobby/ShipBlueprintView/
├── index.ts
├── ShipBlueprintCanvas.tsx
├── ShipSilhouette.tsx
├── ModuleSlotMarker.tsx
├── ConnectionLine.tsx
├── types.ts
└── silhouettes/
    ├── index.ts
    └── generic.ts
```

**Files to create:**
- `packages/ui/src/lobby/ShipBlueprintView/types.ts`
- `packages/ui/src/lobby/ShipBlueprintView/index.ts`

---

### TASK-2: Implement Type Definitions
**Effort:** 30 minutes

**File:** `packages/ui/src/lobby/ShipBlueprintView/types.ts`

```typescript
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
 * Note: The blueprint shows ALL instances (slots added via Module Slot Browser).
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
  /** Callback when selection should be cleared (e.g., Escape key) */
  onClearSelection?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
}

/**
 * Props for individual module slot marker
 *
 * Note: Each marker represents a ModuleInstance (an added slot).
 * - isEmpty = true means variant_id is null (no module installed yet)
 * - isEmpty = false means variant_id is set (module is installed)
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
  /** Whether this slot is empty (no module installed, i.e., variant_id is null) */
  isEmpty?: boolean;
  /** Click handler (opens catalog) */
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
  /** Whether the connected slot is empty (no module installed) */
  isEmpty?: boolean;
}
```

---

### TASK-3: Create Generic Ship Silhouette
**Effort:** 1 hour

**File:** `packages/ui/src/lobby/ShipBlueprintView/silhouettes/generic.ts`

Create a generic ship silhouette that works for any ship class as a fallback:

```typescript
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
```

---

### TASK-4: Create Silhouette Registry
**Effort:** 30 minutes

**File:** `packages/ui/src/lobby/ShipBlueprintView/silhouettes/index.ts`

```typescript
import type { ShipSilhouetteData } from '../types';
import { genericSilhouette } from './generic';

/**
 * Registry of ship silhouettes by ship class ID
 */
const silhouetteRegistry: Record<string, ShipSilhouetteData> = {
  generic: genericSilhouette,
  // Add more silhouettes as they're created:
  // corvette: corvetteSilhouette,
  // frigate: frigateSilhouette,
  // destroyer: destroyerSilhouette,
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

export { genericSilhouette };
```

---

### TASK-5: Implement ShipSilhouette Component
**Effort:** 1 hour

**File:** `packages/ui/src/lobby/ShipBlueprintView/ShipSilhouette.tsx`

```typescript
import React from 'react';
import type { ShipSilhouetteData } from './types';

interface ShipSilhouetteProps {
  silhouette: ShipSilhouetteData;
  className?: string;
}

/**
 * Renders the SVG ship silhouette outline
 */
export function ShipSilhouette({ silhouette, className }: ShipSilhouetteProps) {
  const { viewBox, pathData } = silhouette;

  return (
    <svg
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '70%',
        height: '80%',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <path
        d={pathData}
        fill="none"
        stroke="var(--frigate-border-base)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

---

### TASK-6: Implement ModuleSlotMarker Component
**Effort:** 1-2 hours

**File:** `packages/ui/src/lobby/ShipBlueprintView/ModuleSlotMarker.tsx`

Implement the marker with:
- Bracketed text label style
- Empty/installed/selected states
- Keyboard accessibility
- Integration with ModuleTooltip

---

### TASK-7: Implement ShipBlueprintCanvas Component
**Effort:** 2-3 hours

**File:** `packages/ui/src/lobby/ShipBlueprintView/ShipBlueprintCanvas.tsx`

Main container that:
- Loads appropriate silhouette for ship class
- Maps module instances to slot positions
- Renders silhouette, markers, and connection lines
- Handles selection state

---

### TASK-8: Create Index Export
**Effort:** 15 minutes

**File:** `packages/ui/src/lobby/ShipBlueprintView/index.ts`

```typescript
export { ShipBlueprintCanvas } from './ShipBlueprintCanvas';
export { ShipSilhouette } from './ShipSilhouette';
export { ModuleSlotMarker } from './ModuleSlotMarker';
export { ConnectionLine } from './ConnectionLine';
export { getSilhouette, hasCustomSilhouette } from './silhouettes';
export type * from './types';
```

---

## Phase 2: Integration

### TASK-9: Integrate with ShipDesignWorkspace
**Effort:** 1-2 hours

**File:** `packages/ui/src/lobby/ShipDesignWorkspace.tsx`

Replace `InstalledModulesList` with `ShipBlueprintCanvas` in the center column.

**Key Integration Points:**
- Blueprint shows ALL instances (slots added via Module Slot Browser)
- Clicking ANY slot (empty or filled) opens ModuleCatalog to select/change module
- No `onAddModule` prop - slots are added via the Module Slot Browser, not the blueprint

```tsx
{/* Center Column: Ship Blueprint View */}
<div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
  <ShipBlueprintCanvas
    shipClassId={shipClass?.id ?? ''}
    shipClassName={shipClass?.name}
    moduleSlots={moduleSlots}
    moduleSlotsById={moduleSlotsById}
    variantsById={variantsById}
    instances={instances}
    selectedInstanceId={selectedInstanceId}
    onSelectInstance={handleSelectInstance}
    onRemoveInstance={handleRemoveInstance}
    onClearSelection={() => setSelectedInstanceId(null)}
    isLoading={isLoading}
    error={error}
  />
</div>
```

**Handler Implementation:**
```tsx
// When user clicks any slot on blueprint, open catalog to select/change module
const handleSelectInstance = (instanceId: string) => {
  setSelectedInstanceId(instanceId);
  const instance = instances.find(i => i.id === instanceId);
  if (instance) {
    const slotType = moduleSlotsById[instance.module_slot_id];
    if (slotType?.hasVariants) {
      setEditingInstanceId(instanceId);
      setEditingSlotType(slotType);
      setCatalogOpen(true);
    }
  }
};
```

---

### TASK-10: Connect Module Selection Flow
**Effort:** 1 hour

Ensure clicking ANY slot (empty or filled) opens the ModuleCatalog:
- Empty slot: User selects which module to install (`setVariant` is called)
- Filled slot: User can change to a different module (`setVariant` is called)

**Important:** The catalog's `onSelect` callback always calls `setVariant` on the existing instance:
```tsx
<ModuleCatalog
  slotType={editingSlotType}
  onSelect={async (variantId: string) => {
    try {
      if (editingInstanceId) {
        // Always setVariant - whether slot was empty or filled
        await setVariant(editingInstanceId, variantId);
      }
    } catch (err) {
      console.error('Failed to set variant:', err);
    } finally {
      setCatalogOpen(false);
      setEditingInstanceId(null);
      setEditingSlotType(null);
    }
  }}
  onClose={() => {
    setCatalogOpen(false);
    setEditingInstanceId(null);
    setEditingSlotType(null);
  }}
/>
```

---

### TASK-11: Add Keyboard Navigation
**Effort:** 1-2 hours

Implement:
- Tab navigation between markers
- Enter to select
- Delete to remove
- Arrow keys for spatial navigation (optional)

---

## Phase 3: Polish

### TASK-12: Implement ConnectionLine Component
**Effort:** 1 hour

**File:** `packages/ui/src/lobby/ShipBlueprintView/ConnectionLine.tsx`

SVG line connecting marker to ship attachment point with:
- Dashed style for empty slots
- Solid style for installed modules
- Highlighted style for selected

---

### TASK-13: Create Corvette Silhouette
**Effort:** 1 hour

**File:** `packages/ui/src/lobby/ShipBlueprintView/silhouettes/corvette.ts`

Small, agile ship profile.

---

### TASK-14: Create Frigate Silhouette
**Effort:** 1 hour

**File:** `packages/ui/src/lobby/ShipBlueprintView/silhouettes/frigate.ts`

Medium, balanced ship profile.

---

### TASK-15: Create Destroyer Silhouette
**Effort:** 1 hour

**File:** `packages/ui/src/lobby/ShipBlueprintView/silhouettes/destroyer.ts`

Large, combat-focused ship profile.

---

### TASK-16: Add Loading and Error States
**Effort:** 30 minutes

Show appropriate states when:
- Ship class is loading
- Ship class failed to load
- No silhouette available (show fallback message)

---

### TASK-17: Write Tests
**Effort:** 2-3 hours

Create test files:
- `__tests__/ShipBlueprintCanvas.test.tsx`
- `__tests__/ModuleSlotMarker.test.tsx`
- `__tests__/ConnectionLine.test.tsx`

---

### TASK-18: Create Storybook Stories
**Effort:** 1-2 hours

**File:** `packages/ui/src/stories/ShipBlueprint.stories.tsx`

Stories for:
- Empty blueprint
- Partially populated blueprint
- Fully equipped ship
- Different ship classes

---

## Implementation Priority

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1** | TASK-1 through TASK-8 | 8-12 hours |
| **Phase 2** | TASK-9 through TASK-11 | 3-5 hours |
| **Phase 3** | TASK-12 through TASK-18 | 8-12 hours |

**Total estimated effort: 19-29 hours (3-5 days)**

---

## Dependencies

### Required before starting:
- Module slot group definitions (already in API)
- Ship class data loading (already implemented)
- ModuleTooltip component (already exists)
- ModuleCatalog component (already exists)

### External dependencies:
- None - all visual assets created as code

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Silhouette design takes longer | Medium | Low | Use generic silhouette initially |
| Slot positioning feels wrong | Medium | Medium | Allow easy adjustment via constants |
| Performance with many markers | Low | Low | Limit visible markers, use virtualization |
| Accessibility issues | Low | High | Follow existing patterns, test with screen readers |

---

## Success Criteria

1. **Functional**: Module selection and management work correctly
2. **Visual**: Ship silhouette is recognizable and aesthetically consistent
3. **Accessible**: Full keyboard navigation, screen reader support
4. **Performant**: No perceptible lag when rendering or interacting
5. **Maintainable**: Easy to add new ship silhouettes

---

## Completed Tasks

| Task | Status | Notes |
|------|--------|-------|
| TASK-1 | ✅ Complete | Component structure created |
| TASK-2 | ✅ Complete | Types implemented |
| TASK-3 | ✅ Complete | Generic silhouette created |
| TASK-4 | ✅ Complete | Silhouette registry created |
| TASK-5 | ✅ Complete | ShipSilhouette component |
| TASK-6 | ✅ Complete | ModuleSlotMarker with tooltip |
| TASK-7 | ✅ Complete | ShipBlueprintCanvas component |
| TASK-8 | ✅ Complete | Index exports |
| TASK-9 | ✅ Complete | Integrated with ShipDesignWorkspace |
| TASK-10 | ✅ Complete | Module selection flow connected |
| TASK-11 | ✅ Complete | Keyboard navigation (Tab, Enter, Delete, Escape) |
| TASK-12 | ✅ Complete | ConnectionLine component |
| TASK-13 | ✅ Complete | Corvette silhouette |
| TASK-14 | ✅ Complete | Frigate silhouette |
| TASK-15 | ✅ Complete | Destroyer silhouette |
| TASK-16 | ✅ Complete | Loading and error states |
| TASK-17 | ⬜ Pending | Tests |
| TASK-18 | ⬜ Pending | Storybook stories |

---

## Next Steps

1. Write unit tests for blueprint components (TASK-17)
2. Create Storybook stories for visual testing (TASK-18)
3. User testing and feedback collection
4. Iterate on silhouette designs based on feedback
