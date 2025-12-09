# Ship Design Workspace Bugs - Action Plan

This document provides a detailed analysis and implementation plan for the bugs identified in `ship-design-workspace-bugs.md`.

---

## Bug 1: ASCII Borders Extending Past Card Boundaries

### Problem Analysis
The ASCII borders in `ModuleSlotCard.tsx` use a fixed repeat count of 30 characters:
```tsx
const borderTop = '┌' + '─'.repeat(30) + '┐';
const borderBottom = '└' + '─'.repeat(30) + '┘';
```

At `--frigate-font-body` size (~14px) with monospace font (~8.5px per character), 30 chars ≈ 255px. However, the card width is constrained by the parent container which may be narrower, causing overflow.

### Root Cause
- The border width is hardcoded rather than responsive to container width
- The `pre` element has `whiteSpace: 'nowrap'` which prevents wrapping but causes overflow

### Solution
**Option A (CSS-based):** Add `overflow: hidden` to the card container and let borders clip naturally.

**Option B (Dynamic calculation):** Calculate border width based on container width using a ref or CSS `calc()`.

**Recommended: Option A** - Simpler, maintains visual consistency, and clips gracefully.

### Implementation Steps
1. In `ModuleSlotCard.tsx`, reduce the border character repeat from 30 to ~24 characters
2. Add `overflow: hidden` to the card container to prevent any overflow
3. Consider using CSS `ch` units for more precise character-based sizing

### Files to Modify
- `packages/ui/src/lobby/ModuleSlotCard.tsx`

### Effort: Low

---

## Bug 2: Column Width Ratios (30%/40%/30%)

### Problem Analysis
Current implementation in `ShipDesignWorkspace.tsx` line 442:
```tsx
gridTemplateColumns: '320px 1fr 300px',
```

This uses fixed pixel widths for left (320px) and right (300px) columns with flexible center. The desired ratio is 30%/40%/30%.

### Root Cause
- Fixed pixel widths don't scale with viewport
- Current total fixed width = 620px + center, which can cause issues on smaller screens

### Solution
Change from fixed pixel widths to percentage-based flex ratios:
```tsx
gridTemplateColumns: '30% 40% 30%',
// OR for better flexibility:
gridTemplateColumns: '3fr 4fr 3fr',
```

### Implementation Steps
1. Update `ShipDesignWorkspace.tsx` line 442 to use `3fr 4fr 3fr` or `30% 40% 30%`
2. Update corresponding test in `ShipDesignWorkspace.test.tsx` line 110
3. Ensure minimum widths are set on each column to prevent content squishing

### Files to Modify
- `packages/ui/src/lobby/ShipDesignWorkspace.tsx`
- `packages/ui/src/lobby/__tests__/ShipDesignWorkspace.test.tsx`

### Effort: Low

---

## Bug 3: Tooltips Not Following Mouse Cursor

### Problem Analysis
The `ModuleTooltip` component in `packages/ui/src/components/ModuleTooltip.tsx` uses element-relative positioning (based on `getBoundingClientRect()`), not mouse-cursor-relative positioning.

Current behavior:
1. Tooltip appears at a fixed offset from the target element
2. Position is calculated once when tooltip becomes visible
3. Does not track mouse movement

### Root Cause
The `calculatePosition()` function positions relative to the target element's bounding rect, not the mouse coordinates.

### Solution
Implement mouse-following behavior:
1. Track mouse position on `onMouseMove` events
2. Position tooltip relative to cursor with an offset
3. Add viewport boundary detection to keep tooltip visible

### Implementation Steps
1. Add `onMouseMove` handler to track cursor position
2. Store cursor coordinates in state
3. Update tooltip position calculation to use cursor coords instead of element rect
4. Add offset (e.g., 16px right, 8px down from cursor)
5. Keep viewport boundary clamping logic
6. Consider debouncing for performance

### Code Changes
```tsx
// Add to ModuleTooltip component
const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

const handleMouseMove = useCallback((e: React.MouseEvent) => {
  setMouseCoords({ x: e.clientX, y: e.clientY });
}, []);

// Update calculatePosition to use mouseCoords
const calculatePosition = useCallback(() => {
  if (!tooltipRef.current) return;

  const tooltipRect = tooltipRef.current.getBoundingClientRect();
  const offset = 16;

  let x = mouseCoords.x + offset;
  let y = mouseCoords.y + offset;

  // Viewport clamping
  x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8));
  y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8));

  setCoords({ x, y });
}, [mouseCoords]);
```

### Files to Modify
- `packages/ui/src/components/ModuleTooltip.tsx`
- `packages/ui/src/components/__tests__/ModuleTooltip.test.tsx`

### Effort: Medium

---

## Bug 4: Module Catalog Not Displaying as Dialog Overlay

### Problem Analysis
The `ModuleCatalog` component renders inline rather than as a modal overlay. Looking at the current implementation, it uses a `Panel` component but lacks the overlay/backdrop that `CenteredModal` provides.

Current behavior:
- Catalog appears to render in-place
- No backdrop/overlay
- May not block interaction with underlying workspace

### Root Cause
The `ModuleCatalog` component doesn't use the modal pattern from `CenteredModal.tsx`:
- Missing `position: fixed` overlay
- Missing backdrop click handling
- Missing focus trap (partially implemented)

### Solution
Refactor `ModuleCatalog` to use `CenteredModal` as its base, or implement the same overlay pattern.

### Implementation Steps
1. Wrap `ModuleCatalog` content with a modal overlay container
2. Add fixed positioning with backdrop
3. Implement backdrop click to close
4. Ensure the existing focus trap works correctly
5. Keep the two-column layout inside the modal

### Code Changes
```tsx
// In ModuleCatalog.tsx, wrap the return with:
return (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
    onClick={(e) => e.target === e.currentTarget && onClose?.()}
  >
    <div
      ref={containerRef}
      style={{
        width: '80%',
        maxWidth: '1000px',
        maxHeight: '80vh',
        // ... existing modal styles
      }}
    >
      {/* Existing Panel/content */}
    </div>
  </div>
);
```

### Files to Modify
- `packages/ui/src/modules/ModuleCatalog.tsx`

### Effort: Medium

---

## Bug 5: Installed Modules Interface Redesign (Ship Blueprint Visualization)

### Problem Analysis
The user envisions an upgraded interface where:
1. A minimal abstract blueprint/silhouette of the ship displays in the background
2. Installed module slots appear as boxes/annotations pointing to relevant areas on the ship
3. Different ship classes would have different SVG silhouettes

### Design Vision
This transforms the flat list into a spatial/visual representation that:
- Shows where modules are physically located on the ship
- Provides better visual feedback for ship configuration
- Adds "emergence" and immersion to the design experience

### Technical Considerations

#### Frontend Changes
1. **SVG Ship Blueprints**: Create abstract SVG silhouettes for each ship class
   - Minimalist line-art style (fits hard sci-fi aesthetic)
   - Define "attachment points" for module slot positions
   - Scale proportionally within the container

2. **Module Slot Positioning**: Each module slot needs:
   - An (x, y) position relative to the ship blueprint
   - Connection line/pointer to the relevant ship area
   - A compact info box showing slot status

3. **New Component Structure**:
   ```
   ShipBlueprintView/
   ├── ShipBlueprintCanvas.tsx    # Main container with SVG
   ├── ShipSilhouette.tsx         # SVG ship outline
   ├── ModuleSlotMarker.tsx       # Individual slot marker/box
   ├── ConnectionLine.tsx         # Line connecting marker to ship point
   └── ship-silhouettes/          # SVG assets per ship class
       ├── corvette.svg
       ├── frigate.svg
       ├── destroyer.svg
       └── ...
   ```

#### Backend Changes
1. **Ship Class Schema Extension**: Add module slot positioning data
   ```typescript
   interface ShipClass {
     // ... existing fields
     blueprint_svg?: string;        // SVG content or URL
     slot_positions?: {
       slot_type_id: string;
       x: number;                   // Normalized 0-1 position
       y: number;                   // Normalized 0-1 position
       label_position: 'left' | 'right' | 'top' | 'bottom';
     }[];
   }
   ```

2. **API Changes**: Endpoint to return ship class with blueprint data

### Implementation Phases

#### Phase 1: Basic Blueprint Container
1. Create `ShipBlueprintView` component
2. Add placeholder SVG rendering
3. Position module markers in a grid layout initially

#### Phase 2: SVG Ship Silhouettes
1. Design SVG silhouettes for 2-3 ship classes
2. Implement `ShipSilhouette` component
3. Add basic ship class detection and SVG selection

#### Phase 3: Positioned Module Markers
1. Extend backend schema for slot positions
2. Implement `ModuleSlotMarker` with connection lines
3. Add interactive hover/selection states

#### Phase 4: Polish
1. Animation for adding/removing modules
2. Zoom/pan for larger ships
3. Responsive scaling

### Files to Create
- `packages/ui/src/lobby/ShipBlueprintView/ShipBlueprintCanvas.tsx`
- `packages/ui/src/lobby/ShipBlueprintView/ShipSilhouette.tsx`
- `packages/ui/src/lobby/ShipBlueprintView/ModuleSlotMarker.tsx`
- `packages/ui/src/lobby/ShipBlueprintView/ConnectionLine.tsx`
- `packages/ui/src/lobby/ShipBlueprintView/index.ts`
- `packages/ui/src/assets/ship-silhouettes/*.svg`

### Files to Modify
- `packages/ui/src/lobby/ShipDesignWorkspace.tsx` (swap InstalledModulesList for ShipBlueprintView)
- Backend ship class schema (TBD)
- Backend API endpoints (TBD)

### Effort: High (Multi-phase)

---

## Implementation Priority

| Bug | Severity | Effort | Priority |
|-----|----------|--------|----------|
| Bug 1: ASCII borders | Visual | Low | 1 |
| Bug 2: Column widths | Layout | Low | 2 |
| Bug 4: Modal overlay | Functional | Medium | 3 |
| Bug 3: Tooltip tracking | UX | Medium | 4 |
| Bug 5: Blueprint redesign | Feature | High | 5 (separate milestone) |

### Recommended Order
1. **Bug 1 + Bug 2** - Quick visual/layout fixes (can be done together)
2. **Bug 4** - Fix catalog modal to be functional
3. **Bug 3** - Improve tooltip UX
4. **Bug 5** - Plan as separate feature milestone with design review

---

## Summary

| Bug | Status | Estimated Effort |
|-----|--------|------------------|
| ASCII borders overflow | Ready to fix | 30 min |
| Column width ratios | Ready to fix | 30 min |
| Tooltip mouse tracking | Ready to fix | 1-2 hours |
| Module catalog modal | Ready to fix | 1-2 hours |
| Ship blueprint interface | Needs design review | Multi-day feature |

Total immediate fixes: ~4-5 hours
Blueprint redesign: Separate project/milestone
