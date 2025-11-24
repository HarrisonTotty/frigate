# Ship Design Workspace Alignment Action Plan

**Document Version:** 1.0  
**Date:** November 24, 2025  
**Status:** In Progress  
**Owner:** Development Team

---

## Executive Summary

This document outlines a comprehensive action plan to align the current Ship Design Workspace implementation with the design specification in `doc/ship-design-workspace-redesign.md`. The analysis reveals that while the core three-column layout and most functionality is implemented, several critical user flow issues and UI refinements need to be addressed to fully match the design specification.

**Key Findings:**
- ✅ Core architecture (three-column layout) is correct
- ✅ Build points data flow now working correctly (after recent fixes)
- ⚠️ Module selection flow does not match design specification
- ⚠️ Missing tooltip panels for additional context
- ⚠️ Incomplete constraint display (weight, module slots not shown)
- ⚠️ Duplicate ShipStatsPanel component needs consolidation

---

## Current State Analysis

### Implementation Status

#### ✅ Complete & Working

1. **Three-Column Layout**
   - Left: Module Slot Browser with category filtering and search
   - Center: Installed Modules List with module count tracking
   - Right: Ship Statistics Panel with build points, cost, weight, HP, power, heat
   - All columns properly sized, scrollable, and responsive

2. **Module Slot Browser** (`ModuleSlotBrowser.tsx` + `ModuleSlotBrowserCore.tsx`)
   - Loads module slots from API (`/v1/module-slots`)
   - Category/group filtering via tabs
   - Search functionality
   - ASCII-bordered card display per slot
   - Add button functionality
   - Build points display in header
   - Real-time stats update

3. **Installed Modules List** (`InstalledModulesList.tsx`)
   - Displays all installed module instances
   - Shows slot name and variant ID
   - Shows module count vs. max allowed
   - [REMOVE] button for all modules
   - [SELECT] button for modules with variants
   - Empty state message
   - Visual warning for unconfigured modules

4. **Ship Statistics Panel** (`ShipStatsPanel.tsx` in `/lobby/`)
   - Displays cost, weight, HP, power, heat stats
   - Build points with progress bar and percentage
   - Visual status indicators (success/warning/danger)
   - Constraint warnings

5. **Module Catalog Modal** (`ModuleCatalog.tsx`)
   - Two-column layout (variants list | details)
   - Variant selection with stats display
   - Integration with blueprint state management

6. **Data Flow - Recently Fixed** ✅
   - Blueprint fetched with `class` field
   - Ship class details fetched via `useShipClass` hook
   - Build points correctly extracted from ship class data
   - Stats update in real-time

7. **Workspace Integration**
   - Header with title and back button
   - Footer with keyboard hints
   - Proper integration with lobby workflow store

#### ⚠️ Partial Implementation

1. **Module Instance Display**
   - Shows variant ID but not key stats
   - Design calls for: "Each instance shows its slot type name, selected variant (if any), and key stats"
   - Missing: cost, weight, HP display for each module

2. **Constraint Display**
   - Build points display is correct
   - Missing: explicit display of weight usage vs. max weight
   - Missing: module slot usage tracking per slot type
   - Note: Module count display exists but other constraints not prominent

3. **Module Variant Stats**
   - Catalog shows variant details well
   - Module rows in list don't display selected variant's key stats
   - Difficult for user to understand impact of selection

#### ❌ Not Implemented

1. **Hover Tooltip Panels**
   - Design: "Hovering over a slot type reveals a tooltip panel with additional details about the slot type, including base stats and extended description"
   - Design: "Hovering over a module instance reveals a tooltip panel with detailed stats"
   - Current: No tooltip system exists
   - Impact: Users cannot quickly preview module details without adding them

2. **Duplicate Component**
   - `/modules/ShipStatsPanel.tsx` exists alongside `/lobby/ShipStatsPanel.tsx`
   - Modules version is more complex (592 lines) vs. lobby version (215 lines)
   - Lobby version is correct for current use case
   - Creates confusion and maintenance burden

3. **Visual Feedback on Add**
   - No highlight or animation when module is added
   - User might not notice new module in list
   - Design implies clear visual feedback

4. **Module Slot Type Constraints**
   - Design mentions: "maximum number allowed on the ship"
   - No tracking of per-slot-type limits (e.g., can only have 2 engine slots)
   - May require API enhancement to track slot type limits

---

## Problem Analysis by Category

### Category 1: User Flow Misalignment (CRITICAL)

#### Issue 1.1: Auto-Open Catalog Behavior
**Severity:** CRITICAL - Changes core user flow

**Current Behavior:**
```
User clicks [ADD] button
  ↓
Module added to blueprint (optimistic)
  ↓
Catalog auto-opens IF module has variants
  ↓
User selects variant in catalog
  ↓
Module configured and catalog closes
```

**Design Specification:**
```
User clicks [ADD] button
  ↓
Module appears in Installed Modules list immediately
  ↓
If module has variants: [SELECT] button appears
  ↓
User clicks [SELECT] button to configure
  ↓
Catalog opens (user-initiated, not automatic)
  ↓
User selects variant and confirms
  ↓
Module updated, catalog closes
```

**Why This Matters:**
- Auto-opening catalog interrupts the user's browsing flow
- User doesn't see where the module was added in the list
- Violates principle of "show first, configure second"
- Makes multi-module addition workflow awkward

**Impact:** Medium (functional but UX issue)

**Code Location:** `ShipDesignWorkspace.tsx` lines 226-242 (`handleModuleAdded` function)

**Fix:**
- Remove `tryOpenLatest` logic from `handleModuleAdded`
- Let `handleModuleAdded` simply acknowledge the add without opening catalog
- Keep user-initiated selection via [SELECT] button

#### Issue 1.2: Module Variants Without Configuration
**Severity:** HIGH - User can leave modules unconfigured

**Current Status:**
- Modules with variants show [SELECT] button
- Unconfigured modules display warning text "[UNCONFIGURED]"
- User can proceed to save blueprint with unconfigured modules

**Design Intent:**
- Implies modules should be fully configured before acceptance
- Variant selection should be required for modules with variants

**Investigation Needed:**
- Does backend accept unconfigured modules?
- Should UI prevent saving with unconfigured modules?
- Is configuration truly required or optional?

**Recommendation:**
- Add visual indicator (e.g., orange/yellow highlight) for unconfigured modules
- Consider adding "unsaved changes" warning if unconfigured modules exist

---

### Category 2: Missing Tooltip System (HIGH PRIORITY)

#### Issue 2.1: No Slot Type Tooltip
**Severity:** HIGH - Information discovery issue

**Design Spec:**
> "Hovering over a slot type reveals a tooltip panel with additional details about the slot type, including base stats and extended description"

**Current:** No hover interaction on ModuleSlotCard

**What Users Need:**
- Slot description without adding it
- Base stats (cost, weight, HP impact)
- Whether variant selection is required
- Maximum instances allowed

**Implementation Approach:**
1. Create reusable `Tooltip` component in `components/`
2. Add hover state to `ModuleSlotCard`
3. Display tooltip with slot data on hover
4. Position tooltip to avoid layout shift

**Code Changes:**
- Create `packages/ui/src/components/Tooltip.tsx`
- Update `ModuleSlotCard.tsx` to show tooltip on hover
- Add tooltip CSS module for positioning

**Estimated Effort:** 2-3 hours

#### Issue 2.2: No Module Instance Tooltip
**Severity:** HIGH - Stats discovery issue

**Design Spec:**
> "Hovering over a module instance reveals a tooltip panel with detailed stats"

**Current:** ModuleInstanceRow only shows variant ID

**What Users Need:**
- Full variant name
- Cost contribution to blueprint
- Weight contribution
- HP/power/heat impacts
- Other relevant stats

**Implementation Approach:**
1. Extend Tooltip component (from 2.1)
2. Add hover to `ModuleInstanceRow`
3. Fetch variant details on hover (with caching)
4. Display stats comparison or absolute values

**Code Changes:**
- Update `ModuleInstanceRow.tsx` with hover tooltip
- Integrate with tooltip system

**Estimated Effort:** 2-3 hours

---

### Category 3: Component Organization Issues (MEDIUM PRIORITY)

#### Issue 3.1: Duplicate ShipStatsPanel Components
**Severity:** MEDIUM - Code duplication, maintenance risk

**Current State:**
- `/lobby/ShipStatsPanel.tsx` - 215 lines - Correct for workspace
- `/modules/ShipStatsPanel.tsx` - 592 lines - Complex, for different use case

**Analysis:**
- Lobby version: Simple, focused, shows build points, cost, weight, HP, power, heat
- Modules version: Complex, designed for detailed module stats aggregation
- Both define different interfaces and serve different purposes
- No cross-referencing between them

**Root Cause:**
- Likely created independently for different features
- Never consolidated

**Risk:**
- Developer confusion about which to use
- Inconsistent behavior if both ever used in same workflow
- Difficult to maintain

**Fix:**
1. Keep `/lobby/ShipStatsPanel.tsx` (correct for current use)
2. Rename `/modules/ShipStatsPanel.tsx` to `/modules/ModuleStatsPanel.tsx`
3. Update imports in any files using modules version
4. Document difference between the two

**Code Changes:**
- Rename file
- Search for imports: `grep -r "from.*modules.*ShipStatsPanel" packages/ui/src`
- Update imports if found

**Estimated Effort:** 1 hour (includes verification)

---

### Category 4: Data Display Gaps (HIGH PRIORITY)

#### Issue 4.1: Missing Weight Display
**Severity:** HIGH - Constraint tracking incomplete

**Design Spec:**
> "Display current usage of build points, module slots, and weight"

**Current:**
- Build points: ✅ Displayed in ModuleSlotBrowser header
- Module slots: ✅ Displayed as "COUNT: X / Y" in InstalledModulesList
- Weight: ❌ Not shown anywhere except stats panel

**What's Missing:**
- Weight usage not visible in InstalledModulesList
- Users can't see weight constraint while adding modules

**Impact:**
- Users must look between list (center) and stats (right) to track weight
- May accidentally exceed weight limit

**Fix:**
Add weight display to ModuleListHeader in `InstalledModulesList.tsx`:
```
INSTALLED MODULES
COUNT: 5 / 12
WEIGHT: 450 / 500
```

**Code Changes:**
- Update `ModuleListHeader` component to accept weight stats
- Update `InstalledModulesList` to pass weight from props
- Update `ShipDesignWorkspace` to pass weight to list

**Estimated Effort:** 1 hour

#### Issue 4.2: Missing Module Stats in List
**Severity:** MEDIUM - UX clarity issue

**Design Spec:**
> "Each module instance shows its slot type name, selected variant (if any), and key stats"

**Current:**
- Slot type name: ✅ Shown
- Selected variant: ✅ Variant ID shown
- Key stats: ❌ Not shown in row (only in tooltip on hover)

**What's Missing:**
- Cost of module
- Weight of module
- HP contribution
- Power draw
- Heat generation

**Why Important:**
- Users can't quickly understand impact of each module
- Difficult to troubleshoot constraint violations
- Requires hovering to see stats

**Options:**
1. **Mini-display:** Show key stats inline (1-2 line summary)
2. **Compact format:** "Cannon (Cost: 150, Wt: 30, +100HP)"
3. **Defer:** Only show in tooltip (current plan)

**Recommendation:**
- Implement in Phase 2 after tooltip system works
- Requires fetching variant data for each module
- Could impact performance with many modules

**Estimated Effort:** 2-3 hours (if implemented now)

---

### Category 5: Visual Feedback & UX Polish (MEDIUM PRIORITY)

#### Issue 5.1: No Visual Feedback on Module Add
**Severity:** MEDIUM - UX polish

**Current:**
- Module added silently to list
- User must scroll to see it
- No indication operation succeeded

**Design Intent:**
- Clear feedback when actions succeed
- Visual emphasis on newly added items

**Implementation Approaches:**
1. **Highlight & Fade:** New module highlighted in green/blue, fades after 2 seconds
2. **Scroll & Focus:** Auto-scroll to new module, outline it
3. **Toast Notification:** Show "Module added" toast (less aligned with design philosophy)

**Recommendation:**
- Scroll to new module in center column
- Outline with theme color for 2 seconds
- No toast (conflicts with terminal-style aesthetic)

**Code Changes:**
- Add `ref` to module list
- `scrollIntoView()` on new module
- Add CSS animation for highlight effect

**Estimated Effort:** 1-2 hours

#### Issue 5.2: Empty State Messaging
**Severity:** LOW - Polish

**Current:**
- ModuleListEmpty component shows "NO MODULES INSTALLED"
- Good coverage

**Status:** ✅ Already implemented

---

### Category 6: API & Data Contract Issues

#### Issue 6.1: Module Slot Type Limits
**Severity:** MEDIUM - Feature completeness

**Current:**
- No tracking of per-slot-type instance limits
- Design mentions: "the maximum number allowed on the ship"

**Example:**
- Can only have 2 engine slots max
- Can have many weapon ports
- This varies by slot type

**Current Data Available:**
- Need to check if API provides `maxInstances` or similar field

**Investigation Needed:**
```bash
curl http://localhost:8000/v1/module-slots | jq '.[0]'
```

**If Not Available:**
- May need backend enhancement
- Or documentation of current behavior

**For Now:**
- Proceed without per-slot limits
- Assume any number of instances allowed
- Document as "Future Enhancement"

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)
**Priority: Must do before next release**

1. **P1.1: Fix Module Selection Flow** (Issue 1.1)
   - Remove auto-catalog-open behavior
   - Keep user-initiated [SELECT] button
   - Time: 1 hour
   - Files: `ShipDesignWorkspace.tsx`

2. **P1.2: Remove Duplicate Component** (Issue 3.1)
   - Rename `/modules/ShipStatsPanel.tsx`
   - Update imports
   - Time: 1 hour
   - Files: `/modules/ShipStatsPanel.tsx`, imports

3. **P1.3: Add Weight Display to Module List** (Issue 4.1)
   - Update ModuleListHeader
   - Pass weight from workspace
   - Time: 1 hour
   - Files: `InstalledModulesList.tsx`, `ShipDesignWorkspace.tsx`

**Total Phase 1:** 3 hours | **Impact:** High | **Risk:** Low

---

### Phase 2: Tooltip System (Week 1-2)
**Priority: High - improves discoverability**

1. **P2.1: Create Tooltip Component**
   - Generic, reusable tooltip
   - Position management
   - Keyboard accessible
   - Time: 2 hours
   - Files: New `components/Tooltip.tsx`

2. **P2.2: Add Slot Tooltip** (Issue 2.1)
   - Show on ModuleSlotCard hover
   - Display slot details
   - Time: 2 hours
   - Files: `ModuleSlotCard.tsx`

3. **P2.3: Add Module Instance Tooltip** (Issue 2.2)
   - Show on ModuleInstanceRow hover
   - Display variant stats
   - Time: 2 hours
   - Files: `InstalledModulesList.tsx`, `ModuleInstanceRow`

**Total Phase 2:** 6 hours | **Impact:** Medium | **Risk:** Low

---

### Phase 3: Polish & Enhancement (Week 2)
**Priority: Nice to have - UX improvement**

1. **P3.1: Visual Feedback on Add** (Issue 5.1)
   - Auto-scroll to new module
   - Highlight effect
   - Time: 1-2 hours
   - Files: `ShipDesignWorkspace.tsx`

2. **P3.2: Module Stats in List** (Issue 4.2)
   - Optional: Show key stats inline
   - Or defer to future iteration
   - Time: 2-3 hours
   - Files: `ModuleInstanceRow.tsx`

**Total Phase 3:** 3-5 hours | **Impact:** Low | **Risk:** Low

---

### Phase 4: Investigation & Future Work
**Priority: Lower - requires decisions**

1. **P4.1: Unconfigured Module Handling** (Issue 1.2)
   - Clarify backend requirements
   - Add validation if needed
   - Time: 2 hours
   - Files: Multiple

2. **P4.2: Per-Slot-Type Limits** (Issue 6.1)
   - Check API capabilities
   - Implement if available
   - Document if not
   - Time: 2-4 hours
   - Files: May need backend changes

---

## Testing Strategy

### Unit Tests to Add/Update

1. **ModuleSlotBrowser**
   - ✅ Loads slots without infinite loop
   - ✅ Filters by category
   - ✅ Search filters correctly
   - ✅ Add button calls callback (no auto-open)

2. **InstalledModulesList**
   - ✅ Displays modules correctly
   - ✅ Shows [SELECT] for variants
   - ✅ Shows [REMOVE] for all
   - ✅ Displays weight and count
   - ✅ Shows empty state

3. **ShipDesignWorkspace**
   - ✅ Fetches blueprint correctly
   - ✅ Fetches ship class with build_points
   - ✅ Stats update on module add/remove
   - ✅ Build points correct from ship class
   - ✅ Module add doesn't auto-open catalog

4. **Tooltip Component** (New)
   - ✅ Shows on hover
   - ✅ Hides on mouse leave
   - ✅ Keyboard accessible
   - ✅ Positions correctly

5. **ModuleCatalog**
   - ✅ Opens on [SELECT] click
   - ✅ Loads variants
   - ✅ Displays variant details
   - ✅ Saves selection

### Integration Tests

1. **Full User Flow (Design Spec)**
   - User starts at ShipSelectionView
   - Selects ship (transport)
   - Enters ShipDesignWorkspace
   - Sees correct build points (590)
   - Sees weight limit
   - Adds module → appears in list
   - Clicks [SELECT] on variant module
   - Catalog opens
   - Selects variant
   - Module updated with variant
   - Stats refresh
   - Can add multiple modules
   - Warnings show when constraints exceeded

2. **Back Navigation**
   - [BACK] button returns to ship list
   - State preserved if returning to same blueprint

3. **Build Points Edge Cases**
   - Exactly at limit
   - Exceeding limit
   - Warning color changes

---

## Design Compliance Checklist

### Hard Sci-Fi Aesthetic ✅
- [x] Flat, minimalistic design
- [x] Text-only UI (no icons)
- [x] Monospace fonts
- [x] ASCII art borders
- [x] Muted color palette
- [x] No shadows or gradients
- [x] Technical terminology

### User Flow
- [ ] Module add → appears in list (not auto-configure)
- [ ] User clicks [SELECT] to configure
- [ ] Catalog opens on demand
- [ ] Clear feedback on all actions
- [ ] Weight constraint visible while adding
- [ ] Build point constraint visible
- [ ] Tooltip system for discovery

### Information Architecture
- [ ] Three-column layout
- [ ] Left: Browse slots
- [ ] Center: Manage installed
- [ ] Right: View aggregated stats
- [ ] Modal for variant selection

### Accessibility
- [ ] Keyboard navigation throughout
- [ ] Screen reader labels
- [ ] Color not only indicator
- [ ] High contrast text
- [ ] Focus management

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Auto-open catalog breaks existing workflows | Low | Medium | Feature incomplete anyway; fixing is correct |
| Tooltip implementation conflicts with existing hover states | Low | Medium | Test on all components; isolate styles |
| Weight tracking affects performance | Low | Low | Already calculated; just display it |
| Backend doesn't return required variant stats | Medium | High | Verify API response; may need backend changes |
| Users confused by change in module flow | Medium | Medium | Clear release notes; possibly tooltip guides |
| Duplicate component removal breaks something | Low | Low | Comprehensive grep search; validate all imports |

---

## Success Criteria

The Ship Design Workspace will be considered aligned with the design specification when:

1. ✅ Module selection flow matches specification exactly
   - Add → appears in list → [SELECT] → catalog opens → configure → confirm
   
2. ✅ All required constraints are visible
   - Build points, weight, module slots (COUNT) displayed prominently
   
3. ✅ Tooltip system functional
   - Hover over slot type shows details
   - Hover over module instance shows variant stats
   
4. ✅ All UI tests pass
   - Module flow tests
   - Data flow tests
   - Integration tests
   
5. ✅ Design compliance verified
   - Hard sci-fi aesthetic maintained
   - Accessibility requirements met
   - Keyboard navigation complete
   
6. ✅ No duplicate components
   - Single ShipStatsPanel in lobby
   - Clear separation of concerns

7. ✅ Build points working correctly
   - Matches selected ship class build_points value
   - Updates in real-time as modules added/removed

---

## Dependencies & Blockers

### No Current Blockers
- All required data available from API
- No backend changes needed (though some could be nice enhancements)
- Build points issue resolved with field name fix (`class` not `ship_class`)

### Nice-to-Have Enhancements
- Per-slot-type instance limits (if API supports)
- Module stats inline display (performance dependent)
- Variant stats caching (for frequent hovering)

---

## Documentation Updates Needed

1. **User Guide**
   - Add section: "Configuring Ship Modules"
   - Screenshot showing three-column layout
   - Step-by-step flow: Add → Select → Configure

2. **Component Documentation**
   - Update ModuleSlotBrowser JSDoc
   - Add Tooltip component documentation
   - Update ShipDesignWorkspace flow comments

3. **Developer Guide**
   - Document tooltip system usage
   - Explain module state management flow
   - Add troubleshooting guide for module issues

---

## Timeline Estimate

| Phase | Tasks | Effort | Timeline |
|-------|-------|--------|----------|
| 1 | Critical fixes (3 tasks) | 3 hours | 1 day |
| 2 | Tooltip system (3 tasks) | 6 hours | 2 days |
| 3 | Polish (2 tasks) | 3-5 hours | 1-2 days |
| 4 | Investigation | 2-4 hours | As needed |
| Testing | Unit + integration | 3-4 hours | 1 day |
| Documentation | Guides + JSDoc | 2 hours | 0.5 days |
| **Total** | | **19-24 hours** | **1-2 weeks** |

---

## References

- Design Specification: `doc/ship-design-workspace-redesign.md`
- Design Philosophy: `doc/design/design-philosophy.md`
- Current Implementation: `/packages/ui/src/lobby/ShipDesignWorkspace.tsx`
- Related Issue: Build points data flow (RESOLVED)

---

## Sign-Off

**Prepared by:** Development Team  
**Date:** November 24, 2025  
**Status:** Ready for Implementation  
**Next Step:** Begin Phase 1 (Critical Fixes)
