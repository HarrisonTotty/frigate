# Ship Blueprint Visualization System - Design Document

This document outlines the design for a new ship blueprint visualization system that replaces the current flat list interface with an immersive, spatial representation of installed modules on a ship schematic.

---

## 1. Vision

Transform the **Installed Modules List** in the center column of the Ship Design Workspace into a **Ship Blueprint View** that displays:

1. A minimal, abstract SVG silhouette of the selected ship class
2. Module slots positioned at relevant locations on the ship
3. Connection lines linking module markers to their attachment points
4. Interactive hover/selection states for module management

This creates a more intuitive, visual representation of ship configuration that enhances the hard sci-fi aesthetic while improving usability.

---

## 1.1 Core Concepts: Slots vs Modules

Understanding the distinction between **module slots** and **modules** is critical:

### Module Slot (Instance)
A **module slot** is a placeholder on the ship that can hold ONE module of a specific type. When a user "adds a module slot" via the Module Slot Browser, they are adding an empty mounting point to their ship.

- Represented in data as a `ModuleInstance` with `module_slot_id` set but `variant_id` = null
- Displayed on blueprint as an **empty slot marker** (e.g., `[KINETIC WEAPON PORT] [EMPTY]`)
- User must click to select which actual module to install

### Module (Variant)
A **module** is the actual hardware installed in a slot. When a user selects a module for a slot, they choose from available **variants** for that slot type.

- Represented by setting `variant_id` on the `ModuleInstance`
- Displayed on blueprint as a **filled slot marker** (e.g., `[KINETIC WEAPON PORT] RAILGUN MK2`)
- User can click to change the installed module

### Workflow Example
Users have complete freedom in how they configure their ship. They can:
- Add all slots first, then fill them one at a time
- Add and fill each slot immediately
- Mix and match approaches

**Example session:**
1. User adds "Kinetic Weapon Port" slot via Module Slot Browser → Empty slot marker appears on blueprint
2. User adds "Impulse Engine" slot → Second empty slot marker appears
3. User adds "Communications Array" slot → Third empty slot marker appears
4. User clicks the Kinetic Weapon Port on blueprint → Module Catalog opens showing kinetic weapons
5. User selects "Railgun Mk2" → Slot now shows installed module
6. User clicks the Impulse Engine slot → Module Catalog opens showing engines
7. User selects an engine → Slot now shows installed module
8. ...and so on

**Key principle:** Adding a slot does NOT automatically open the catalog. The user decides when to select modules for their slots.

---

## 2. Design Philosophy Alignment

The blueprint visualization must adhere to the established design philosophy:

### 2.1 Hard Sci-Fi Realism
- **Technical schematic aesthetic**: Silhouettes should resemble engineering blueprints, not artistic renderings
- **Minimalist line art**: Simple stroke outlines, no fills or gradients
- **Orthographic projection**: Side profile view (preferred) or top-down schematic view
- **Grid overlay (optional)**: Subtle grid lines to reinforce technical aesthetic

### 2.2 Strictly Flat, Text-Based Design
- **No icons**: Module markers use bracketed text labels like `[PWR]`, `[ENG]`, `[WPN]`
- **Monospace typography**: All labels use the system monospace font
- **Zero decorative elements**: Every visual element serves a functional purpose
- **CSS borders only**: Use `border: 1px solid var(--frigate-primary)` for all lines
- **Muted color palette**: Ship outline in `--frigate-border-base`, markers in `--frigate-primary`

### 2.3 Technical Jargon
- **Abbreviated labels**: Use short codes for module types (PWR, ENG, WPN, SHD, SEN, etc.)
- **Status indicators**: Show module state with text like `[ONLINE]`, `[EMPTY]`, `[WARN]`

---

## 3. Component Architecture

```
ShipBlueprintView/
├── index.ts                      # Public exports
├── ShipBlueprintCanvas.tsx       # Main container component
├── ShipSilhouette.tsx            # SVG ship outline renderer
├── ModuleSlotMarker.tsx          # Individual module slot marker
├── ConnectionLine.tsx            # Line connecting marker to ship
├── BlueprintGrid.tsx             # Optional background grid overlay
├── types.ts                      # Type definitions
└── silhouettes/                  # SVG silhouette data
    ├── index.ts                  # Silhouette registry
    ├── corvette.ts               # Corvette class silhouette
    ├── frigate.ts                # Frigate class silhouette
    ├── destroyer.ts              # Destroyer class silhouette
    └── ...                       # Additional ship classes
```

---

## 4. Data Model

### 4.1 Module Slot Positioning

Each ship class needs to define where module slots appear on the silhouette. This data can be:
- **Stored in the API**: Extend `ShipClassDetails` with slot positioning
- **Stored client-side**: Map slot types to positions per ship class
- **Generated algorithmically**: Auto-position based on slot groups

**Recommended approach**: Client-side mapping initially, migrate to API later.

```typescript
/**
 * Position for a module slot on the blueprint
 */
interface SlotPosition {
  /** Module slot group (e.g., "propulsion", "weapons", "power") */
  group: string;
  /** X position as percentage (0-100) of canvas width */
  x: number;
  /** Y position as percentage (0-100) of canvas height */
  y: number;
  /** Attachment point on ship silhouette (for connection line) */
  attachX: number;
  attachY: number;
  /** Label position relative to marker */
  labelPosition: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Ship class silhouette definition
 */
interface ShipSilhouetteData {
  /** Ship class ID this silhouette belongs to */
  shipClassId: string;
  /** SVG path data for the ship outline */
  pathData: string;
  /** Viewbox dimensions */
  viewBox: { width: number; height: number };
  /** Module slot positions by group */
  slotPositions: Record<string, SlotPosition[]>;
}
```

### 4.2 Slot Group Mapping

Map module slot groups to ship regions:

| Group | Ship Region | Typical Position |
|-------|-------------|------------------|
| `propulsion` | Aft (rear) | Bottom-right |
| `power` | Core (center-aft) | Center-right |
| `weapons` | Bow (front) / Dorsal | Top-left, Top-center |
| `defense` | Hull (distributed) | Center |
| `sensors` | Bow / Dorsal | Top-left |
| `utility` | Ventral / Mid | Bottom-center |
| `cargo` | Mid / Aft | Center-bottom |

---

## 5. Visual Design

### 5.1 Ship Silhouette Style

```
Ship silhouette requirements:
- Stroke-only (no fill): stroke="var(--frigate-border-base)" stroke-width="1"
- Simple geometry: ~10-30 path segments per ship
- Side profile view: Ship facing right (bow to right)
- Minimal detail: Hull outline, major features only (no fine detail)
- Consistent scale: All ships fit within same viewbox proportionally
```

Example silhouette (text representation):
```
     ____________________
    /                    \____
   /                          \___
  |    [PWR]    [WPN]             |___
  |                                   |--
  |    [ENG]    [SHD]             |---
   \                          /---
    \____________________/----
            [THR]
```

### 5.2 Module Slot Marker

```
+------------------+
| [PWR] POWER CORE |
| [INSTALLED]      |
+------------------+
        |
        | (connection line)
        |
        * (attachment point on ship)
```

Marker states:
- **Empty**: `[EMPTY]` - Muted color, dashed border
- **Installed**: `[variant name]` - Primary color, solid border
- **Selected**: Highlighted background
- **Warning**: `[WARN]` - Warning color

### 5.3 Layout

```
+-----------------------------------------------+
|              SHIP BLUEPRINT                    |
|  +------------------------------------------+ |
|  |                                          | |
|  |    [WPN]-----*                           | |
|  |                    _______________       | |
|  |    [SEN]-----*   /               \____   | |
|  |                 /                     \  | |
|  |               |                        | | |
|  |    [PWR]-----*|                        | | |
|  |               |                        | | |
|  |    [SHD]-----*|                        | | |
|  |                \                     /--| | |
|  |                 \_____________/-----    | |
|  |                                          | |
|  |                    [ENG]-----*           | |
|  |                                          | |
|  +------------------------------------------+ |
|  [CLICK MODULE TO SELECT] [HOVER FOR DETAILS] |
+-----------------------------------------------+
```

---

## 6. Interaction Design

### 6.1 Mouse Interactions
- **Hover on marker**: Show tooltip with module details (using existing ModuleTooltip)
- **Click on any slot marker**: Open Module Catalog to select/change the installed module
- **Right-click**: Context menu with [REMOVE], [CHANGE MODULE]

Note: The blueprint only shows slots that have been added via the Module Slot Browser. Clicking any slot (empty or filled) opens the catalog for that slot type.

### 6.4 Module Installation Flow

The workflow follows a two-step process: **add slot**, then **select module**. Users have complete freedom in ordering these steps.

**Step 1: Adding a Module Slot** (via Module Slot Browser):
1. User clicks [ADD] on a slot type in the Module Slot Browser (e.g., "Kinetic Weapon Port")
2. A new `ModuleInstance` is created with `variant_id = null` (empty slot)
3. Empty slot marker appears on the blueprint (e.g., `[KINETIC WEAPON PORT] [EMPTY]`)
4. **The catalog does NOT open automatically** - user can add more slots or select a module when ready

**Step 2: Selecting a Module** (via Blueprint):
1. User clicks an empty slot marker on the blueprint
2. Module Catalog opens showing available modules for that slot type
3. User browses and selects a module variant (e.g., "Railgun Mk2")
4. `variant_id` is set on the existing instance
5. Slot marker updates to show installed module (e.g., `[KINETIC WEAPON PORT] RAILGUN MK2`)

**Changing an Installed Module**:
1. User clicks a filled slot marker on the blueprint
2. Module Catalog opens showing available modules
3. User selects a different module
4. `variant_id` is updated on the instance

**Key Implementation Notes**:
- The blueprint shows ALL instances (added slots), not predefined slot positions
- An instance with `variant_id = null` is an "empty slot" awaiting module selection
- An instance with `variant_id` set has a module installed
- Clicking any slot (empty or filled) opens the Module Catalog to select/change the module
- Adding a slot does NOT auto-open the catalog - this gives users flexibility to batch add slots

### 6.2 Keyboard Navigation
- **Tab**: Cycle through module markers
- **Enter**: Select focused marker
- **Delete/Backspace**: Remove selected module
- **Escape**: Clear selection

### 6.3 Visual Feedback
- **Hover**: Marker border brightens, connection line highlights
- **Selected**: Marker background changes to `--frigate-bg-selected`
- **Disabled**: Marker faded, cursor: not-allowed

---

## 7. SVG Silhouette Generation

### 7.1 Initial Set
Create silhouettes for these ship classes (based on existing sizes):

| Ship Class | Size | Priority |
|------------|------|----------|
| Corvette | Small | P1 |
| Frigate | Medium | P1 |
| Destroyer | Large | P1 |
| Cruiser | Large | P2 |
| Carrier | Large | P2 |

### 7.2 Silhouette Requirements
- **Format**: SVG path data stored as TypeScript strings
- **ViewBox**: Normalized to 400x200 (2:1 aspect ratio)
- **Style**: Applied via CSS variables for themability
- **Fallback**: Generic ship outline if class-specific silhouette unavailable

### 7.3 Example Silhouette Data
```typescript
// silhouettes/frigate.ts
export const frigateSilhouette: ShipSilhouetteData = {
  shipClassId: 'frigate',
  viewBox: { width: 400, height: 200 },
  pathData: `
    M 350 100
    L 380 90
    L 395 100
    L 380 110
    L 350 100
    L 300 80
    L 100 80
    L 50 90
    L 30 100
    L 50 110
    L 100 120
    L 300 120
    Z
  `,
  slotPositions: {
    propulsion: [
      { group: 'propulsion', x: 15, y: 50, attachX: 30, attachY: 100, labelPosition: 'left' },
    ],
    power: [
      { group: 'power', x: 15, y: 30, attachX: 80, attachY: 85, labelPosition: 'left' },
    ],
    weapons: [
      { group: 'weapons', x: 85, y: 20, attachX: 320, attachY: 85, labelPosition: 'right' },
      { group: 'weapons', x: 85, y: 40, attachX: 350, attachY: 95, labelPosition: 'right' },
    ],
    defense: [
      { group: 'defense', x: 15, y: 70, attachX: 150, attachY: 100, labelPosition: 'left' },
    ],
    sensors: [
      { group: 'sensors', x: 85, y: 60, attachX: 300, attachY: 100, labelPosition: 'right' },
    ],
  },
};
```

---

## 8. Implementation Phases

### Phase 1: Foundation (2-3 days)
1. Create `ShipBlueprintView` component structure
2. Implement `ShipSilhouette` with one placeholder silhouette
3. Create `ModuleSlotMarker` component
4. Basic layout without connection lines

**Deliverable**: Static blueprint view with positioned markers

### Phase 2: Interactivity (1-2 days)
1. Add hover states and tooltips
2. Implement click-to-select functionality
3. Add keyboard navigation
4. Connect to existing ModuleCatalog flow

**Deliverable**: Interactive blueprint with module management

### Phase 3: Polish (1-2 days)
1. Add `ConnectionLine` component
2. Create 2-3 ship class silhouettes
3. Add loading/error states
4. Implement fallback for unknown ship classes

**Deliverable**: Full visual experience

### Phase 4: Backend Integration (Future)
1. Extend API `ShipClassDetails` with slot positioning data
2. Migrate from client-side to server-side positioning
3. Add silhouette URLs to ship class data

---

## 9. API Schema Extension (Future)

When ready to migrate positioning to the backend:

```typescript
// Extend ShipClassDetails
interface ShipClassDetails {
  // ... existing fields ...

  /** Blueprint visualization data (optional) */
  blueprint?: {
    /** SVG path data for ship silhouette */
    silhouette_svg?: string;
    /** Silhouette viewBox dimensions */
    viewbox?: { width: number; height: number };
    /** Module slot visual positions */
    slot_positions?: {
      group: string;
      x: number;
      y: number;
      attach_x: number;
      attach_y: number;
      label_position: 'left' | 'right' | 'top' | 'bottom';
    }[];
  };
}
```

---

## 10. Fallback Behavior

When a ship class doesn't have a defined silhouette:

1. **Generic silhouette**: Use a size-appropriate generic ship outline
2. **Grid layout**: Fall back to current list-based layout
3. **Hybrid mode**: Show silhouette placeholder with markers in list form

---

## 11. Accessibility

- **Screen readers**: Markers announce module name, type, and state
- **Keyboard**: Full keyboard navigation through markers
- **Focus indicators**: Clear visual focus ring on markers
- **Color contrast**: Maintain WCAG AA compliance
- **Reduced motion**: Respect `prefers-reduced-motion` for animations

---

## 12. Testing Strategy

### Unit Tests
- `ModuleSlotMarker`: Render states, click handling
- `ShipSilhouette`: SVG rendering, viewBox scaling
- `ConnectionLine`: Path calculation

### Integration Tests
- Blueprint view integration with ShipDesignWorkspace
- Module selection flow
- Catalog opening from blueprint

### Visual Tests
- Storybook stories for each ship class
- Silhouette rendering across themes

---

## 13. Open Questions

1. **Ship orientation**: Side profile vs top-down view?
   - **Recommendation**: Side profile (more recognizable, easier to design)

2. **Multiple instances**: How to show multiple modules of same type?
   - **Recommendation**: Stack markers or show count badge

3. **Zoom/pan**: Support for larger ships?
   - **Recommendation**: Defer to Phase 4, use fixed view initially

4. **Animation**: Module install/remove animations?
   - **Recommendation**: Minimal - fade in/out only

---

## 14. Success Metrics

- **User comprehension**: Faster module location identification
- **Visual appeal**: Positive feedback on aesthetic
- **Usability**: No regression in task completion time
- **Accessibility**: Maintains keyboard-only usability

---

## Summary

| Aspect | Decision |
|--------|----------|
| View type | Side profile silhouette |
| Data source | Client-side initially, API later |
| Marker style | Bracketed text labels |
| Interactivity | Click to select, hover for details |
| Fallback | Generic silhouette + list view |
| Priority ships | Corvette, Frigate, Destroyer |

This design creates an immersive ship configuration experience while maintaining the hard sci-fi, terminal-inspired aesthetic of the Frigate UI system.
