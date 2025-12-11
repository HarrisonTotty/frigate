# Frigate Frontend - Implementing Credit Cost Action Plan

**Version**: 1.0.0
**Date**: December 2025
**Related**: [Design Document](implementing-cost.md) | [Hyperion Action Plan](../../hyperion/doc/implementing-cost-action-plan.md)

---

## Overview

This document outlines the implementation plan for adding credit cost tracking and display to the Frigate frontend. The Hyperion server-side implementation is complete, including:

- `credit_cost` fields added to all module slots and module variants
- `cost` field added to all ship classes (10,000 - 100,000 credits)
- Team model now includes `credits` field (starting: 1,000,000)
- Credit deduction on ship compilation, 100% refund on ship deletion
- New API endpoints: `GET/POST /v1/teams/:id/credits`

The frontend must now display these costs and validate credit constraints during ship design.

---

## Current State Analysis

### What Works
- Build point constraint system fully functional
- ShipStatsPanel displays cost placeholder (`stats.cost` always 0)
- API client fetches all module/variant data (will include new fields)
- Validation pattern established (warnings array, constraint bars)

### What's Missing
- Type definitions don't include `credit_cost` / `cost` fields
- No credit cost calculation in stats aggregation
- Team credits not fetched or passed through components
- No credit balance display in ship creation or design flows
- No credit validation in "Register Schematic" process

---

## Design Principles Alignment

Per the [Design Philosophy](design/design-philosophy.md):

1. **Hard Sci-Fi Realism** - Credits are a realistic economic constraint
2. **Strictly Flat, Text-Based Design** - Display credits as `1,000,000 CR` with monospace alignment
3. **Technical Jargon** - Use abbreviation "CR" for credits, consistent with existing "BP" for build points
4. **Dense Information** - Pack credit info alongside existing build point displays
5. **No Icons** - Text labels only: `CREDITS:`, `COST:`, `CR`

---

## Implementation Phases

### Phase 1: Type Definitions & API Types

**Goal**: Update TypeScript interfaces to include credit cost fields from Hyperion API.

#### Task 1.1: Update Module Types

**File**: `packages/api-client/src/types.ts`

Add `credit_cost` field to module slot and variant interfaces:

```typescript
// ModuleSlot interface - add:
readonly credit_cost?: number;  // Credit cost (optional for backward compat)

// ModuleVariant interface - add:
readonly credit_cost?: number;  // Credit cost (optional for backward compat)
```

#### Task 1.2: Update Ship Class Types

**File**: `packages/ui/src/types/shipClass.ts`

Add `cost` field to ship class interfaces:

```typescript
// ShipClassSummary interface - add:
cost?: number;  // Credit cost to construct this ship class

// ShipClassDetails interface - add:
cost?: number;  // Credit cost to construct this ship class
```

#### Task 1.3: Create Team Credits Type

**File**: `packages/ui/src/types/team.ts` (new file)

```typescript
export interface Team {
  id: string;
  name: string;
  faction: string;
  members: string[];
  credits: number;  // Team's current credit balance
}

export interface CreditBalanceResponse {
  team_id: string;
  credits: number;
}
```

---

### Phase 2: Stats Calculation

**Goal**: Calculate total credit cost from ship class + all installed modules.

#### Task 2.1: Update ShipStats Interface

**File**: `packages/ui/src/lobby/ShipStatsPanel.tsx`

Update the `ShipStats` interface to include credit tracking:

```typescript
export interface ShipStats {
  // Existing fields...
  cost: number;           // Total credit cost (currently unused)

  // New credit tracking fields:
  creditCost: number;     // Total credit cost of ship design
  creditBudget: number;   // Team's available credits
  shipClassCost: number;  // Cost of ship class alone (for display)

  // Existing constraint fields...
  buildPointsUsed: number;
  buildPointsMax: number;
  // ...
}
```

#### Task 2.2: Calculate Credit Costs in ShipDesignWorkspace

**File**: `packages/ui/src/lobby/ShipDesignWorkspace.tsx`

Update the stats calculation logic (around line 281-418) to accumulate credit costs:

```typescript
// Initialize credit tracking
s.creditCost = 0;
s.shipClassCost = shipClass?.cost || 0;
s.creditCost += s.shipClassCost;

// In the module iteration loop, add:
if (slot.credit_cost) {
  s.creditCost += slot.credit_cost;
}
if (variant.credit_cost) {
  s.creditCost += variant.credit_cost;
}

// Add credit validation warning:
if (s.creditBudget > 0 && s.creditCost > s.creditBudget) {
  s.warnings?.push('Insufficient credits');
}
```

#### Task 2.3: Pass Team Credits to Stats

**File**: `packages/ui/src/lobby/ShipDesignWorkspace.tsx`

Update component to receive and use team credits:

```typescript
interface ShipDesignWorkspaceProps {
  // Existing props...
  team: Team;  // Ensure team includes credits
}

// In stats calculation:
s.creditBudget = team.credits;
```

---

### Phase 3: Ship Class Selection UI

**Goal**: Display credit costs during ship class selection and creation.

#### Task 3.1: Update Ship Class Dropdown

**File**: `packages/ui/src/lobby/ShipClassSelect.tsx`

Update the dropdown to show credit cost alongside build points:

```typescript
// Line 55, update option label:
label: `${shipClass.name} - ${formatCredits(shipClass.cost)} CR - ${shipClass.build_points} BP`

// Add helper function:
const formatCredits = (credits: number | undefined): string => {
  if (!credits) return '---';
  return credits.toLocaleString();
};
```

#### Task 3.2: Update Ship Creation Modal

**File**: `packages/ui/src/lobby/EnhancedShipCreationModal.tsx`

Add team credit balance and ship class cost display:

```typescript
// Props - add team:
interface EnhancedShipCreationModalProps {
  // Existing props...
  team: Team;
}

// Add credit display section (above or alongside build constraints):
<Panel title="TEAM CREDITS">
  <StatRow label="BALANCE" value={team.credits.toLocaleString()} unit=" CR" />
  <StatRow label="SHIP COST" value={selectedClass?.cost?.toLocaleString() || '---'} unit=" CR" />
  {selectedClass?.cost && team.credits < selectedClass.cost && (
    <WarningText>Insufficient credits to construct this ship class</WarningText>
  )}
</Panel>
```

#### Task 3.3: Update Build Constraints Panel

**File**: `packages/ui/src/shipclass/BuildConstraintsPanel.tsx`

Add optional credit constraint display:

```typescript
interface BuildConstraintsPanelProps {
  // Existing props...
  creditCost?: number;
  creditBudget?: number;
}

// Add credit constraint bar if credits are provided:
{creditBudget !== undefined && (
  <ConstraintBar
    label="CREDITS"
    current={creditCost || 0}
    max={creditBudget}
    unit=" CR"
    formatValue={(v) => v.toLocaleString()}
  />
)}
```

#### Task 3.4: Disable Create Button When Insufficient Credits

**File**: `packages/ui/src/lobby/EnhancedShipCreationModal.tsx`

Update the [CREATE] button to check credit availability:

```typescript
const canCreate =
  shipName.trim().length > 0 &&
  selectedClassId !== null &&
  (selectedClass?.cost === undefined || team.credits >= selectedClass.cost);

<Button
  disabled={!canCreate}
  onClick={handleCreate}
>
  [CREATE]
</Button>
```

---

### Phase 4: Ship Design Workspace UI

**Goal**: Display credit costs and constraints throughout the design interface.

#### Task 4.1: Update ShipStatsPanel Display

**File**: `packages/ui/src/lobby/ShipStatsPanel.tsx`

The cost display already exists (line 382). Update it and add credit constraint bar:

```typescript
// Update existing cost display to use creditCost:
<StatRow label="COST" value={stats.creditCost.toLocaleString()} unit=" CR" />

// Add credit constraint bar (similar to build points, around line 387-393):
<ConstraintBar
  label="CREDITS"
  current={stats.creditCost}
  max={stats.creditBudget}
  unit=" CR"
  formatValue={(v) => v.toLocaleString()}
  warning={stats.creditCost > stats.creditBudget}
/>

// Optionally show ship class cost breakdown:
<StatRow label="HULL" value={stats.shipClassCost.toLocaleString()} unit=" CR" size="small" />
```

#### Task 4.2: Update Validation State

**File**: `packages/ui/src/lobby/ShipStatsPanel.tsx`

Update `getValidationState()` to include credit validation:

```typescript
const getValidationState = (): 'valid' | 'incomplete' | 'conflict' => {
  // Existing checks...

  // Add credit check:
  if (stats.creditBudget > 0 && stats.creditCost > stats.creditBudget) {
    return 'conflict';
  }

  // Existing return logic...
};
```

#### Task 4.3: Update Module Slot Browser

**File**: `packages/ui/src/lobby/ModuleSlotBrowser.tsx`

Display credit cost for each module slot:

```typescript
// In slot list item, add credit cost display:
<SlotItem>
  <span>{slot.name}</span>
  <span className="slot-costs">
    {slot.base_cost} BP | {slot.credit_cost?.toLocaleString() || '---'} CR
  </span>
</SlotItem>
```

#### Task 4.4: Update Module Catalog Modal

**File**: `packages/ui/src/modules/ModuleCatalog.tsx`

Display credit cost for module variants:

```typescript
// In variant list item (around lines 98-99), add credit cost:
<VariantItem>
  <span>{variant.name}</span>
  <span className="variant-costs">
    {variant.cost} BP | {variant.credit_cost?.toLocaleString() || '---'} CR
  </span>
</VariantItem>

// In cost comparison section, show credit delta:
{currentVariant && selectedVariant && (
  <CostDelta>
    BP: {selectedVariant.cost - currentVariant.cost}
    CR: {(selectedVariant.credit_cost || 0) - (currentVariant.credit_cost || 0)}
  </CostDelta>
)}
```

---

### Phase 5: Team Credits Integration

**Goal**: Fetch team credits from API and pass through component tree.

#### Task 5.1: Add Team Credits API Call

**File**: `packages/ui/src/api/client.ts` or `packages/api-client/src/rest.ts`

Add function to fetch team credits:

```typescript
export async function getTeamCredits(teamId: string): Promise<CreditBalanceResponse> {
  const response = await fetch(`${apiUrl}/v1/teams/${teamId}/credits`);
  if (!response.ok) {
    throw new Error(`Failed to fetch team credits: ${response.statusText}`);
  }
  return response.json();
}
```

#### Task 5.2: Fetch Team with Credits

**File**: `apps/web/src/App.tsx`

Update team fetching to include credits:

```typescript
const loadTeam = async (teamId: string): Promise<Team> => {
  // Option A: Fetch team details (if credits are included in team response)
  const response = await fetch(`${apiUrl}/v1/teams/${teamId}`);
  const team = await response.json();
  return team;  // Should now include credits field

  // Option B: Fetch credits separately and merge
  // const [teamResponse, creditsResponse] = await Promise.all([
  //   fetch(`${apiUrl}/v1/teams/${teamId}`),
  //   fetch(`${apiUrl}/v1/teams/${teamId}/credits`)
  // ]);
  // const team = await teamResponse.json();
  // const credits = await creditsResponse.json();
  // return { ...team, credits: credits.credits };
};
```

#### Task 5.3: Pass Team Through Lobby Workflow

**Files**:
- `packages/ui/src/lobby/lobbyWorkflowStore.ts`
- `packages/ui/src/lobby/LobbyWorkflow.tsx`

Ensure team object (with credits) is passed through:

```typescript
// In lobbyWorkflowStore.ts, ensure team state includes credits:
interface LobbyWorkflowState {
  // Existing state...
  team: Team | null;  // Team now includes credits
}

// In LobbyWorkflow.tsx, pass team to child components:
<ShipDesignWorkspace
  // Existing props...
  team={team}
/>
```

#### Task 5.4: Update Credits After Ship Creation

**File**: `packages/ui/src/lobby/ShipDesignWorkspace.tsx` or `LaunchControl.tsx`

After successful ship registration, update local team credits:

```typescript
const handleRegisterSchematic = async () => {
  // Existing registration logic...

  // After successful registration, refresh team credits:
  const updatedCredits = await getTeamCredits(team.id);
  setTeam(prev => ({ ...prev, credits: updatedCredits.credits }));
};
```

---

### Phase 6: Testing & Validation

**Goal**: Ensure credit system works correctly and doesn't break existing functionality.

#### Task 6.1: Manual Testing Checklist

1. **Ship Class Selection**
   - [ ] Credit costs display in ship class dropdown
   - [ ] Credit costs display in ship creation modal
   - [ ] Create button disabled when insufficient credits
   - [ ] Create button enabled when sufficient credits

2. **Ship Design Workspace**
   - [ ] Total credit cost displays in stats panel
   - [ ] Credit constraint bar shows usage vs. budget
   - [ ] Module slot credit costs display in browser
   - [ ] Module variant credit costs display in catalog
   - [ ] Warning appears when credits exceeded
   - [ ] Register Schematic disabled when credits exceeded

3. **Credit Deduction Flow**
   - [ ] Credits deducted after successful ship registration
   - [ ] Credit balance updates in UI after deduction
   - [ ] Subsequent ship designs reflect new balance

4. **Edge Cases**
   - [ ] Zero credit cost items display correctly
   - [ ] Missing credit_cost fields handled gracefully (show '---')
   - [ ] Very large credit values format correctly (with commas)

#### Task 6.2: Unit Tests

Add unit tests for credit calculation logic:

```typescript
// packages/ui/src/lobby/__tests__/creditCalculation.test.ts

describe('Credit Calculation', () => {
  it('should sum ship class and module credit costs', () => {
    // Test calculation logic
  });

  it('should handle missing credit_cost fields', () => {
    // Test graceful degradation
  });

  it('should detect insufficient credits', () => {
    // Test validation logic
  });
});
```

---

## File Change Summary

### New Files
| File | Purpose |
|------|---------|
| `packages/ui/src/types/team.ts` | Team type with credits |

### Modified Files (Priority Order)

| Priority | File | Changes |
|----------|------|---------|
| 1 | `packages/api-client/src/types.ts` | Add `credit_cost` to ModuleSlot, ModuleVariant |
| 1 | `packages/ui/src/types/shipClass.ts` | Add `cost` to ShipClassSummary, ShipClassDetails |
| 2 | `packages/ui/src/lobby/ShipStatsPanel.tsx` | Add creditCost fields to ShipStats, update display |
| 2 | `packages/ui/src/lobby/ShipDesignWorkspace.tsx` | Calculate credit costs, pass team credits |
| 3 | `packages/ui/src/lobby/ShipClassSelect.tsx` | Display credit cost in dropdown |
| 3 | `packages/ui/src/lobby/EnhancedShipCreationModal.tsx` | Show team balance, ship cost, validation |
| 3 | `packages/ui/src/shipclass/BuildConstraintsPanel.tsx` | Add optional credit constraint bar |
| 4 | `packages/ui/src/lobby/ModuleSlotBrowser.tsx` | Display slot credit costs |
| 4 | `packages/ui/src/modules/ModuleCatalog.tsx` | Display variant credit costs |
| 5 | `apps/web/src/App.tsx` | Fetch team with credits |
| 5 | `packages/ui/src/lobby/lobbyWorkflowStore.ts` | Include credits in team state |
| 5 | `packages/ui/src/api/client.ts` | Add getTeamCredits function |

---

## Implementation Notes

### Number Formatting
Use `toLocaleString()` for credit values to add thousand separators:
- `1000000` displays as `1,000,000 CR`
- Maintains alignment in monospace font

### Backward Compatibility
- All new fields are optional (`?`) in type definitions
- Gracefully handle missing `credit_cost` fields with fallback display
- Existing build point system unchanged

### UI Consistency
- Follow existing patterns for constraint bars (see build points implementation)
- Use same color coding: normal = muted blue, warning = muted yellow, exceeded = muted red
- Maintain strict flat design - no new visual elements beyond text and bars

### Error States
- If API fails to return credits, show "---" instead of 0
- Log warning but don't block user from viewing designs
- Credit validation only enforced when budget > 0

---

## Dependencies

### Hyperion Server Requirements (Completed)
- [x] Ship classes have `cost` field
- [x] Module slots have `credit_cost` field
- [x] Module variants have `credit_cost` field
- [x] Teams have `credits` field
- [x] `/v1/teams/:id/credits` endpoint exists
- [x] Credit deduction on ship compile
- [x] Credit refund on ship deletion

### No External Dependencies
- All UI work uses existing React + Zustand stack
- No new npm packages required
- No breaking changes to existing APIs

---

## Estimated Effort

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1: Type Definitions | 3 | Low |
| Phase 2: Stats Calculation | 3 | Medium |
| Phase 3: Ship Class Selection UI | 4 | Medium |
| Phase 4: Ship Design Workspace UI | 4 | Medium |
| Phase 5: Team Credits Integration | 4 | Medium |
| Phase 6: Testing | 2 | Low |

**Total**: 20 tasks across 6 phases

---

## Success Criteria

1. Team credit balance visible throughout ship design flow
2. Ship class costs visible during selection
3. Module credit costs visible in design workspace
4. Total ship cost calculated and displayed
5. Validation prevents registration when insufficient credits
6. Credits deducted after successful ship registration
7. No regressions to existing build point system
8. UI remains consistent with design philosophy
