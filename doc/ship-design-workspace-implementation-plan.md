# Ship Design Workspace Implementation Action Plan

**Version**: 1.0  
**Date**: November 16, 2025  
**Status**: Planning Phase  
**Target**: Complete redesign implementation of the Ship Blueprint Design Workspace

---

## Executive Summary

This document outlines a comprehensive implementation plan for redesigning the Ship Blueprint Design Workspace in Frigate to align with the new modular module system and strict hard sci-fi design philosophy. The redesign maintains the existing three-column layout while enhancing visual hierarchy, component reusability, and adherence to design standards.

**Key Goals:**
- Fully implement the Ship Blueprint Design Workspace redesign specification
- Ensure strict adherence to Frigate's hard sci-fi, flat design philosophy
- Maximize component reusability leveraging the existing UI component library
- Create comprehensive unit tests for all new components
- Improve visual hierarchy and data density
- Maintain API compatibility with existing backend

---

## Current State Assessment

### Existing Implementation

The Ship Design Workspace currently has:
- **`ShipDesignWorkspace.tsx`**: Main container component managing state and orchestration
- **`ModuleSlotBrowser.tsx`**: Left column component for browsing available module slots
- **`InstalledModulesList.tsx`**: Center column component showing installed module instances
- **`ShipStatsPanel.tsx`**: Right column component displaying aggregate ship statistics
- **`ModuleCatalog.tsx`** (in `/modules`): Modal for selecting module variants

### Component Status

| Component | Status | Notes |
|-----------|--------|-------|
| `ShipDesignWorkspace` | Partial | Container exists, needs layout improvements |
| `ModuleSlotBrowser` | Partial | Basic functionality present, needs design refinement |
| `InstalledModulesList` | Partial | Shows module instances, needs stats display |
| `ShipStatsPanel` | Basic | Minimal styling, needs enhancement |
| `ModuleCatalog` | Exists | Works but may need visual updates |

### Design System Alignment

Current implementation has:
- ✅ Monospace fonts
- ✅ Flat, no-radius borders
- ✅ ASCII art usage
- ✅ Text-only buttons (bracketed labels)
- ⚠️ Inconsistent styling across components
- ⚠️ Limited use of theme tokens
- ⚠️ Minimal visual hierarchy

### Available Design System Resources

**Theme Tokens** (`/packages/ui/src/theme.ts`):
- Color palette (primary, success, warning, danger, info, status)
- Typography tokens (mono, sans fonts)
- Spacing scale (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16)
- Border radius (none, sm, md, lg)
- Shadow definitions

**Core Components** (`/packages/ui/src/components`):
- `Button` - TUI-inspired with variants (primary, secondary, danger, success, ghost)
- `Badge` - Status indicators with technical abbreviations
- `ProgressBar` - Visual progress display
- `Gauge` - Analog-style readouts
- `Select` - Dropdown selection

**Layout Components** (`/packages/ui/src/layout.tsx`):
- `Grid` - Flexible grid system with 12-column support
- `Panel` - Terminal-style containers with ASCII borders
- `Stack` - Flexible flexbox stack (direction, gap)
- `Modal` - Overlay modal for dialogs
- `Overlay` - Semi-transparent overlay

**Pattern Examples**:
- Bridge station components use consistent styling patterns
- ASCII borders using `BOX_DRAWING` constants
- Technical terminology and acronyms throughout
- Dense information layouts with monospace typography

---

## Redesign Specification

### Layout Architecture

**Three-Column Layout** (flex-based):
```
┌─────────────────────────────────────────────────────────────────┐
│ SHIP DESIGN WORKSPACE                                           │
├─────────────────┬──────────────────────┬──────────────────┐
│  LEFT COLUMN    │    CENTER COLUMN     │   RIGHT COLUMN   │
│  (320px fixed)  │   (flex, min 420px)  │   (300px fixed)  │
│                 │                      │                  │
│ Module Slot     │ Installed Modules    │ Ship Statistics  │
│ Browser         │ & Current Config     │ & Constraints    │
│                 │                      │                  │
├─────────────────┼──────────────────────┼──────────────────┤
│ • Slot list     │ • Module list        │ • Total Cost     │
│ • Search        │ • [EDIT] [REMOVE]    │ • Weight         │
│ • Filter by     │ • Stats per module   │ • HP             │
│   group         │ • Drag to reorder    │ • Power          │
│ • [ADD] button  │   (future)           │ • Heat           │
│ • Remaining BP  │                      │ • Build Points   │
│                 │                      │ • Warnings       │
└─────────────────┴──────────────────────┴──────────────────┘

Modal Overlay (when visible):
┌──────────────────────────────────────────┐
│ MODULE VARIANT CATALOG                   │
├──────────────────────────────────────────┤
│ Left: Variant List | Right: Variant Info │
│                                          │
│ [SELECT]  [CANCEL]                      │
└──────────────────────────────────────────┘
```

### Column-by-Column Specifications

#### Left Column: Module Slot Browser

**Header**:
- Title: "MODULE SLOT BROWSER" (uppercase, monospace, bold)
- Subheader: Build Points indicator: "BUILD POINTS: XX/YY"
- Keyboard hints footer: "[KEYS: TAB NAV, ↑/↓ SELECT, ENTER: ADD, ESC: CLOSE]"

**Content**:
- Search box (monospace, bordered, text-only placeholder)
- Filter tabs by group (e.g., "PROPULSION", "WEAPONS", "SUPPORT", "SYSTEMS")
- Module slot cards showing:
  - Slot name (uppercase, bold)
  - Description (secondary text)
  - Cost (displayed as "COST: XXX BP")
  - Required/Optional indicator
  - Max allowed count
  - `[ADD]` button (bracketed, clickable)
- Scrollable list with proper keyboard navigation
- Tooltip on hover showing extended description

**Visual Style**:
- Background: `var(--frigate-bg-base)` (#1a1a1a)
- Borders: 2px solid `#3af` (cyan accent) or use theme primary
- Panel styling: ASCII box-drawing borders
- Button: Primary style with uppercase text

**Related Components**:
- New: `ModuleSlotBrowserHeader` (stats display)
- New: `ModuleSlotCard` (individual slot display)
- Existing: `Button` (for [ADD])
- Existing: `Select` or custom search input

#### Center Column: Installed Modules List

**Header**:
- Title: "INSTALLED MODULES [STS]" (uppercase, with status code)
- Subheader: "COUNT: X / MAX_SLOTS" 
- ASCII top border

**Content**:
- List of currently installed module instances
- Each instance row shows:
  - Slot type name (primary text, bold)
  - Variant name (if configured, or `[UNCONFIGURED]` in warning color)
  - Instance ID (secondary text, smaller)
  - Key stats inline: "PWR: XX / HEAT: XX / WEIGHT: XX"
  - `[EDIT]` and `[REMOVE]` buttons on the right
- Empty state: "NO MODULES INSTALLED" (muted text)
- Dashed borders between rows for visual separation
- ASCII bottom border
- Full scrollable area

**Visual Style**:
- Background: `var(--frigate-bg-surface)` (#2a2a2a)
- Text: Primary monospace, proper visual hierarchy
- Borders: ASCII art with `BOX_DRAWING` constants
- Row separator: Dashed lines between items
- Unconfigured badge: Warning color highlight
- Buttons: Secondary style (text-only)

**Related Components**:
- Refactor existing: `InstalledModulesList`
- New: `ModuleInstanceRow` (individual module display)
- Existing: `Button` (for [EDIT], [REMOVE])
- New: `ModuleInstanceTooltip` (hover details)

#### Right Column: Ship Statistics Panel

**Header**:
- Title: "SHIP STATISTICS [SHP]" (uppercase, with status code)

**Content**:
- Grid layout of key statistics, each showing:
  - Label (abbreviated, all caps): "COST", "WEIGHT", "HULL PTS", "PWR CON", "HEAT GEN", "BP USED"
  - Value: Number with unit suffix if applicable
  - Progress bar for constrained values (Build Points, Weight, Power)
- Constraints section:
  - Max Build Points
  - Max Weight
  - Max Power Draw
  - Max Heat Generation
- Warnings section (if any constraints exceeded):
  - Warning message in danger color
  - Specific constraint violated details

**Visual Style**:
- Background: `var(--frigate-bg-surface)`
- Stats grid: 2-column layout with even spacing
- Progress bars for constrained values
- Warning section: `var(--frigate-danger)` color text
- Monospace typography throughout

**Related Components**:
- Refactor existing: `ShipStatsPanel`
- Use existing: `ProgressBar` component
- Use existing: `Gauge` component for readouts
- New: `StatsGrid` (layout subcomponent)

#### Module Catalog Modal

**Header**:
- Title: "MODULE VARIANT CATALOG" (uppercase)
- Subheader: Shows selected slot type name

**Layout**: Two-column design

**Left Column (Variant List)**:
- List of available variants for the selected slot type
- Each item shows:
  - Variant name (bold)
  - Additional cost over base
  - Key stats summary (abbreviated)
- Clickable rows highlight on selection
- Scrollable if many variants

**Right Column (Variant Details)**:
- Full information for selected variant:
  - Name (large, bold)
  - Manufacturer/origin (secondary text)
  - Full description and lore
  - Complete stats table with all values
  - Tech level / tier indicator
- `[SELECT]` button at bottom
- Dynamic content updates as variant selection changes

**Visual Style**:
- Modal overlay with semi-transparent background
- Inner panel styling with ASCII borders
- Column separator (dashed or ASCII line)
- Dark background with high contrast text
- Monospace throughout

**Related Components**:
- Existing: `ModuleCatalog` (may need style updates)
- Existing: `Modal` and `Overlay` components

---

## Implementation Roadmap

### Phase 1: Component Refactoring & Enhancement (Week 1)

**Goals**: Update existing components to strict design standards and improve visual hierarchy

#### Task 1.1: Update ShipStatsPanel Component
- **File**: `/packages/ui/src/lobby/ShipStatsPanel.tsx`
- **Changes**:
  - Use theme tokens consistently (`var(--frigate-*)`)
  - Add section headers with proper typography
  - Implement 2-column stats grid using `Grid` component
  - Add `ProgressBar` components for constrained stats
  - Implement warnings section styling
  - Improve spacing and visual hierarchy
  - Add JSDoc documentation
  - Create `ShipStatsPanelProps` interface for all props
- **Expected Output**: Enhanced stats panel with better visual design
- **Testing**: Unit tests for layout and state rendering

#### Task 1.2: Refactor InstalledModulesList Component
- **File**: `/packages/ui/src/lobby/InstalledModulesList.tsx`
- **Changes**:
  - Split into subcomponents:
    - `ModuleInstanceRow` - Individual module row display
    - `ModuleInstanceTooltip` - Hover details panel
    - `ModuleListHeader` - Header with title and count
    - `ModuleListEmpty` - Empty state display
  - Use `Panel` component for outer container
  - Update button styling to use `Button` component
  - Improve ASCII border styling with `BOX_DRAWING` constants
  - Add module stats display inline
  - Implement keyboard navigation support
  - Add proper ARIA labels for accessibility
  - Add comprehensive JSDoc documentation
- **Expected Output**: Modular, reusable subcomponents
- **Testing**: Unit tests for each subcomponent

#### Task 1.3: Update ModuleSlotBrowser Component
- **File**: `/packages/ui/src/lobby/ModuleSlotBrowser.tsx`
- **Changes**:
  - Split into subcomponents:
    - `ModuleSlotBrowserHeader` - Title, BP indicator, keyboard hints
    - `ModuleSlotSearch` - Search and filter controls
    - `ModuleSlotCategoryTabs` - Category/group filtering
    - `ModuleSlotCard` - Individual slot card
    - Simplify wrapper component
  - Implement filtering by slot group
  - Update `ModuleSlotCard` display:
    - Show cost in "COST: XXX BP" format
    - Show required/optional indicator
    - Show max allowed count
    - Implement keyboard shortcuts for [ADD]
  - Add hover tooltips with extended description
  - Implement proper scrolling behavior
  - Add keyboard navigation (Tab, Arrow keys, Enter)
  - Use `Button` component for [ADD] button
  - Add comprehensive JSDoc documentation
- **Expected Output**: Enhanced browser with filtering and better UX
- **Testing**: Unit tests for search, filtering, keyboard nav

#### Task 1.4: Enhance ShipDesignWorkspace Container
- **File**: `/packages/ui/src/lobby/ShipDesignWorkspace.tsx`
- **Changes**:
  - Update layout to use `Grid` component explicitly
  - Set proper column widths: `320px 1fr 300px`
  - Use `Panel` components for consistency
  - Add proper gap/spacing using theme tokens
  - Add section headers/labels for each column
  - Improve background colors and overall visual hierarchy
  - Add keyboard navigation hints in UI
  - Add JSDoc documentation
  - Consider adding horizontal dividers between sections
- **Expected Output**: Better visual organization and hierarchy
- **Testing**: Visual regression tests, layout verification

### Phase 2: New Components & Subcomponents (Week 2)

**Goals**: Create new, specialized components for enhanced modularity and reusability

#### Task 2.1: Create ModuleSlotCard Subcomponent
- **File**: `/packages/ui/src/lobby/ModuleSlotCard.tsx`
- **Purpose**: Display individual module slot type information
- **Features**:
  - Slot name, description, cost display
  - Required/optional badge
  - Max allowed count indicator
  - [ADD] button with keyboard shortcut
  - Hover tooltip showing extended details
  - Keyboard accessible (Tab, Enter)
- **Props Interface**:
  ```typescript
  interface ModuleSlotCardProps {
    slotId: string;
    name: string;
    description: string;
    cost: number;
    isRequired: boolean;
    maxAllowed: number;
    currentCount: number;
    onAdd: () => void;
    group?: string;
  }
  ```
- **Testing**: Unit tests for display, interactions, keyboard nav

#### Task 2.2: Create ModuleInstanceRow Subcomponent
- **File**: `/packages/ui/src/lobby/ModuleInstanceRow.tsx`
- **Purpose**: Display individual installed module instance
- **Features**:
  - Slot type name
  - Variant name or [UNCONFIGURED] badge
  - Instance ID (small, muted)
  - Key stats display (PWR, HEAT, WEIGHT)
  - [EDIT] and [REMOVE] buttons
  - Hover tooltip with full stats
  - Keyboard accessible (Tab, Space to activate)
- **Props Interface**:
  ```typescript
  interface ModuleInstanceRowProps {
    instance: ModuleInstance;
    variantInfo?: any;
    onEdit: (instanceId: string) => void;
    onRemove: (instanceId: string) => void;
  }
  ```
- **Testing**: Unit tests for display, interactions, stats formatting

#### Task 2.3: Create StatsGrid Subcomponent
- **File**: `/packages/ui/src/lobby/StatsGrid.tsx`
- **Purpose**: Reusable grid for displaying pairs of stat labels and values
- **Features**:
  - Flexible column layout (configurable columns)
  - Support for values, progress bars, and gauges
  - Monospace typography with proper hierarchy
  - Theme token usage
  - Responsive spacing
- **Props Interface**:
  ```typescript
  interface StatItem {
    label: string;
    value: string | number;
    unit?: string;
    type?: 'text' | 'progress' | 'gauge';
    max?: number;
    current?: number;
  }

  interface StatsGridProps {
    items: StatItem[];
    columns?: number;
    gap?: number;
  }
  ```
- **Testing**: Unit tests for layout, rendering, responsive behavior

#### Task 2.4: Create ModuleSlotBrowserHeader Subcomponent
- **File**: `/packages/ui/src/lobby/ModuleSlotBrowserHeader.tsx`
- **Purpose**: Header section for module slot browser
- **Features**:
  - Title "MODULE SLOT BROWSER"
  - Build Points display "BUILD POINTS: XX/YY"
  - Progress bar for BP usage
  - Keyboard hints footer
  - Proper spacing and styling
- **Props Interface**:
  ```typescript
  interface ModuleSlotBrowserHeaderProps {
    buildPointsUsed: number;
    buildPointsMax: number;
  }
  ```
- **Testing**: Unit tests for display, progress calculation

#### Task 2.5: Create ModuleListHeader Subcomponent
- **File**: `/packages/ui/src/lobby/ModuleListHeader.tsx`
- **Purpose**: Header for installed modules list
- **Features**:
  - Title "INSTALLED MODULES [STS]"
  - Module count display "COUNT: X / MAX"
  - ASCII top border
  - Status indicator
- **Props Interface**:
  ```typescript
  interface ModuleListHeaderProps {
    count: number;
    max: number;
    status?: 'online' | 'warning' | 'critical';
  }
  ```
- **Testing**: Unit tests for display and counts

### Phase 3: Integration & Polish (Week 3)

**Goals**: Integrate all components, test interactions, and polish visual design

#### Task 3.1: Integration Testing
- **File**: `/packages/ui/src/lobby/__tests__/ShipDesignWorkspace.integration.test.tsx`
- **Tests**:
  - Add module via browser → appears in list
  - Edit module → catalog opens correctly
  - Remove module → removed from list and stats update
  - Stats update when modules added/removed
  - Keyboard navigation works across columns
  - BP constraints properly enforced
  - Search/filter functionality works
- **Expected Output**: Comprehensive integration test suite

#### Task 3.2: Visual Design Polish
- **Updates**:
  - Verify all components use theme tokens
  - Ensure consistent spacing (using theme `spacing` scale)
  - Check color contrast and readability
  - Verify ASCII border consistency
  - Test responsive layout at different screen sizes
  - Confirm keyboard shortcuts work throughout
  - Verify accessibility (ARIA labels, screen readers)
- **Testing**: Visual regression tests, manual testing

#### Task 3.3: Module Catalog Visual Update
- **File**: `/packages/ui/src/modules/ModuleCatalog.tsx`
- **Changes**:
  - Update to match new design system
  - Ensure two-column layout styling
  - Use theme tokens throughout
  - Update typography and spacing
  - Verify button styling consistency
  - Add keyboard shortcuts for selection
- **Testing**: Unit tests for catalog interactions

#### Task 3.4: Documentation & Stories
- **Files**:
  - Update `/packages/ui/src/stories/ShipDesignWorkspace.stories.tsx`
  - Create `/packages/ui/src/stories/ModuleSlotBrowser.stories.tsx`
  - Create `/packages/ui/src/stories/InstalledModulesList.stories.tsx`
- **Content**:
  - Component usage examples
  - Visual design showcase
  - Interactive demos
  - Accessibility features
  - Keyboard navigation guide
- **Expected Output**: Comprehensive Storybook stories for all components

#### Task 3.5: Final Testing & QA
- **Coverage**: Aim for >85% code coverage
- **Tests**:
  - Unit tests for all components
  - Integration tests for workflows
  - Accessibility tests (ARIA, keyboard nav)
  - Visual regression tests
  - Performance tests (render time, memory)
- **Testing Tools**: Vitest, React Testing Library, Storybook

---

## Design System Reuse Strategy

### Colors (from `theme.ts`)
- **Background**: `colors.background.base` (#1a1a1a)
- **Surface**: `colors.background.surface` (#2a2a2a)
- **Primary**: `colors.primary.default` (#3a7ca5)
- **Success**: `colors.success.default` (#4a9d5f)
- **Warning**: `colors.warning.default` (#d4a855)
- **Danger**: `colors.danger.default` (#c85450)

### Typography
- **Font**: `typography.fontFamily.mono` (Roboto Mono)
- **Display**: `fontSize.display` (1.5rem)
- **Heading**: `fontSize.heading` (1.125rem)
- **Body**: `fontSize.body` (0.875rem)
- **Small**: `fontSize.small` (0.75rem)

### Spacing (all use `spacing` tokens)
- Use `var(--frigate-space-2)` for padding
- Use `var(--frigate-space-3)` for gaps between sections
- Use `var(--frigate-space-4)` for larger gaps

### Components to Leverage
- `Button` - All interactive buttons (primary, secondary, ghost variants)
- `Badge` - Status indicators, required/optional badges
- `ProgressBar` - Constraint visualizations
- `Gauge` - Alternative stat display
- `Grid` - Layout structure
- `Panel` - Container styling
- `Stack` - Vertical/horizontal spacing

### Patterns to Follow
- ASCII box-drawing for borders
- Monospace typography throughout
- Uppercase labels with technical terminology
- Dense information layouts
- High contrast (light text on dark backgrounds)
- Keyboard-driven interactions
- Minimal animations

---

## Testing Strategy

### Unit Testing Structure

```typescript
// Example test structure
describe('ModuleInstanceRow', () => {
  describe('rendering', () => {
    it('displays slot name and variant')
    it('shows unconfigured badge when no variant')
    it('displays key stats inline')
    it('renders edit and remove buttons')
  })

  describe('interactions', () => {
    it('calls onEdit when edit button clicked')
    it('calls onRemove when remove button clicked')
    it('keyboard accessible (Tab, Space)')
  })

  describe('accessibility', () => {
    it('has proper ARIA labels')
    it('keyboard navigable')
    it('screen reader compatible')
  })

  describe('visual', () => {
    it('uses theme tokens for colors')
    it('proper spacing and typography')
    it('responsive layout')
  })
})
```

### Test Files to Create/Update
- `/packages/ui/src/lobby/__tests__/ModuleSlotCard.test.tsx` (new)
- `/packages/ui/src/lobby/__tests__/ModuleInstanceRow.test.tsx` (new)
- `/packages/ui/src/lobby/__tests__/StatsGrid.test.tsx` (new)
- `/packages/ui/src/lobby/__tests__/ShipStatsPanel.test.tsx` (update)
- `/packages/ui/src/lobby/__tests__/InstalledModulesList.test.tsx` (update)
- `/packages/ui/src/lobby/__tests__/ModuleSlotBrowser.test.tsx` (update)
- `/packages/ui/src/lobby/__tests__/ShipDesignWorkspace.integration.test.tsx` (new)

---

## Dependencies & Prerequisites

### Required Libraries (already available)
- React 18.3.1
- TypeScript 5.9
- Vitest (testing)
- React Testing Library (testing)
- @testing-library/user-event (keyboard testing)
- Zustand (state management)
- Clsx (class composition)

### No New Dependencies Required
All required functionality can be implemented using existing dependencies.

---

## Acceptance Criteria

### Visual Design
- [ ] All components use theme tokens consistently
- [ ] Monospace typography throughout
- [ ] No rounded corners (border-radius: 0)
- [ ] ASCII art borders using BOX_DRAWING constants
- [ ] High contrast, readable text
- [ ] Proper visual hierarchy
- [ ] Dense information layouts

### Functionality
- [ ] Add modules to blueprint
- [ ] Edit module variants
- [ ] Remove modules
- [ ] Real-time stats updates
- [ ] Build point constraints enforced
- [ ] Search and filter working
- [ ] Keyboard navigation complete

### Code Quality
- [ ] TypeScript strict mode passing
- [ ] JSDoc comments on all public APIs
- [ ] >85% test coverage
- [ ] No console errors/warnings
- [ ] Proper error handling
- [ ] Accessible (WCAG 2.1 AA)

### Documentation
- [ ] Comprehensive Storybook stories
- [ ] Component API documentation
- [ ] Usage examples for developers
- [ ] Design system references
- [ ] Keyboard shortcut guide

---

## Risk Assessment & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| Large refactor may break existing functionality | High | Medium | Comprehensive integration tests, incremental rollout |
| Design system inconsistencies | Medium | Low | Strict token usage review, design QA |
| Performance issues with large module lists | Medium | Low | Virtualization if needed, performance testing |
| Accessibility gaps | Medium | Medium | Automated a11y testing, manual review |
| Keyboard navigation complexity | Low | Medium | Clear documentation, extensive testing |

---

## Timeline & Milestones

**Week 1 - Component Enhancement**
- Phase 1 tasks (all components refactored and updated)
- Deliverable: Enhanced existing components with design system alignment

**Week 2 - New Components**
- Phase 2 tasks (new subcomponents created)
- Deliverable: Modular component library ready for integration

**Week 3 - Integration & Polish**
- Phase 3 tasks (integration, testing, documentation)
- Deliverable: Complete, production-ready Ship Design Workspace

**Post-Launch**
- Monitor for issues and user feedback
- Iterate based on feedback
- Plan future enhancements (drag-to-reorder, favorites, etc.)

---

## Future Enhancements (Out of Scope)

These features are noted for future consideration but not included in this implementation:

1. **Drag-to-Reorder**: Module instances could be reorderable via drag-and-drop
2. **Favorites System**: Quick-add button for frequently used modules
3. **Presets**: Save and load ship configuration presets
4. **Comparison Mode**: Side-by-side comparison of variants
5. **Advanced Filtering**: Filter by stats, compatibility, tech level
6. **Template Browser**: Ship design templates as starting points
7. **Multiplayer Co-Design**: Real-time collaboration on blueprints
8. **Ship Customization**: Paint schemes, decals, custom names per module

---

## Success Metrics

- **Usability**: New users can add/edit/remove modules without guidance
- **Performance**: Workspace renders in <500ms, interactions respond instantly
- **Accessibility**: WCAG 2.1 AA compliant, keyboard-navigable
- **Code Quality**: >85% test coverage, zero TypeScript errors
- **Design**: 100% adherence to hard sci-fi, flat design philosophy
- **Maintainability**: Components are modular, well-documented, easy to extend

---

## Conclusion

This implementation plan provides a comprehensive roadmap for redesigning the Ship Blueprint Design Workspace while maintaining the existing functionality and improving the user experience. By following the strict design philosophy, leveraging existing components, and maintaining high code quality standards, the redesigned workspace will be both impressive to users and maintainable for future development.

The modular component approach ensures that individual pieces can be reused throughout Frigate and the larger HYPERION ecosystem, maximizing development efficiency and consistency.
