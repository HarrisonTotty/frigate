# Refactoring Cleanup Plan

A phased plan to act on the findings in
`docs/brainstorming/refactoring-opportunities.md`. Each phase is independently
shippable and ordered so later phases depend only on work completed in earlier
ones. Section numbers (§) refer to the brainstorming document.

## Guiding principles

- **One phase, one PR** unless a phase's subsections touch the same files —
  then bundle to avoid redundant churn.
- After every step, run `just ci` (or at minimum `just typecheck` and
  `just test`) before declaring it done.
- Preserve public API shape. Extracted utilities re-export from the old call
  sites only when a consumer lives outside the package; otherwise prefer a
  single canonical import path.
- No behavior changes. Where the brainstorming surfaced *inconsistencies*
  (e.g. `formatCredits` variants), pick one behavior explicitly and document
  it in a JSDoc comment on the extracted utility.

---

## Phase 1 — Cheap wins (low risk, ~2–3 hours)

Small, mostly mechanical changes. Ship as one PR titled
`refactor: consolidate formatting utils and remove dead code`.

### 1.1 — Extract `formatCredits` and `formatNumber` (§1.1, §1.2)

1. Create `packages/ui/src/utils/formatting.ts` with:
   - `formatCredits(value: number | null | undefined): string` —
     `toLocaleString()`, `"---"` for nullish. **Decision:** treat `0` as
     `"0"` (not `"---"`), because §1.1 flagged the `ModuleCatalog` variant
     that treats `0` as nullish as the odd one out. Document this with a
     JSDoc comment.
   - `formatNumber(value: number): string` — `value.toLocaleString()`.
2. Add `packages/ui/src/utils/index.ts` re-exporting both.
3. Replace each private copy listed in §1.1 and §1.2 with an import. Remove
   the local definitions.
4. In `ModuleCatalog.tsx` specifically: confirm the `0 → "---"` behavior is
   not load-bearing at the call site (it shouldn't be — modules with 0-cost
   are rare but not conceptually "unavailable"). If it is, use a different
   prop (e.g., `showZero={false}`) rather than keeping the divergent util.
5. `ModuleSlotCard.tsx:62` already guards `0` at the call site with a
   ternary (`safeCreditCost > 0 ? formatCredits(...) : "---"`). Leave that
   ternary in place; the canonical-behavior decision above does not change
   what this site renders.

**Files touched:**
- new: `packages/ui/src/utils/formatting.ts`,
  `packages/ui/src/utils/index.ts`
- edit: `EnhancedShipCreationModal.tsx`, `ModuleSlotCard.tsx`,
  `ShipClassSelect.tsx`, `ModuleCatalog.tsx`, `BuildConstraintsPanel.tsx`,
  `ShipStatsPanel.tsx` (credits); `AmmunitionTooltip.tsx`,
  `AmmunitionDetailModal.tsx`, `InventoryConstraintsPanel.tsx`,
  `LoadedInventoryPanel.tsx` (number).

**Verification:** `just test` — existing rendering tests should exercise the
replaced call sites. Spot-check the `ShipClassSelect` output since its
original used `String(value)` and will now use `toLocaleString()`; confirm no
snapshot tests pin the old numeric formatting.

### 1.2 — Consolidate `formatPlayerId` (§1.3)

1. Keep the implementation in `packages/ui/src/lobby/playerUtils.ts` as
   canonical.
2. In `packages/ui/src/lobby/helpers.ts`, replace the local
   `formatPlayerId` with `export { formatPlayerId } from "./playerUtils"`.
3. In `packages/ui/src/lobby/ShipSelectionHeader.tsx`, delete the local copy
   at line 15 and import from `./playerUtils`.

**Verification:** existing tests; grep to confirm only one definition
remains.

### 1.3 — Delete dead `phase1.3`/`phase1.4` files (§5.1)

Confirmed via grep: no references outside the files themselves.

1. Delete `packages/api-client/src/rest.phase1.3.test.ts`.
2. Delete `packages/api-client/src/index.phase1.4.ts`.
3. Delete `packages/api-client/src/index.phase1.4.test.ts`.

**Verification:** `just build` still succeeds; `just test` shows fewer
suites but no failures.

### 1.4 — Remove or adopt the unused `assert` export (§5.2)

Two options; pick based on current utility needs:

- **Remove** (simplest): delete the `assert` function from
  `packages/utils/src/index.ts` and its test in `index.test.ts`.
- **Adopt**: leave the export and use it at one validation boundary that
  currently throws a generic `Error`. Good candidates are API response
  narrowing sites in `packages/api-client/src/rest.ts`.

**Recommendation:** remove, unless a reviewer flags an imminent consumer.
Easier to add back than to carry dead exports.

---

## Phase 2a — Schematic file extraction (~2 hours)

Isolated change. Ship as its own PR titled
`refactor: extract shared schematic YAML module`. Does not depend on Phase 1.

### 2a.1 — Create shared module (§2.1)

1. Create `packages/ui/src/lobby/schematicYaml.ts` containing:
   - `type SchematicModule = { slot: string; module: string | null }`
   - `type SchematicFile = { version: number; name: string; ship_class: string; modules: SchematicModule[] }`
   - `parseSchematicYaml(yaml: string): SchematicFile`
   - `serializeSchematicYaml(schematic: SchematicFile): string`

   Source the implementations from either of the existing hooks (they agree);
   do not reuse the test-file copy verbatim — it was written against the
   same spec and should continue to validate behavior.

2. Update `packages/ui/src/lobby/__tests__/schematicYaml.test.ts` to import
   `parseSchematicYaml`, `serializeSchematicYaml`, `SchematicFile`, and
   `SchematicModule` from `../schematicYaml` and delete the local copies.

**Verification:** `just test --filter schematicYaml` — all existing tests
pass unchanged.

### 2a.2 — Thin the two `useSchematicFile` hooks

1. Create `packages/ui/src/hooks/useSchematicFile.ts`: a platform-agnostic
   core accepting a `persistence` adapter:

   ```ts
   type SchematicPersistence = {
     open: () => Promise<{ content: string; name: string } | null>;
     save: (content: string, suggestedName: string) => Promise<boolean>;
   };

   export function useSchematicFile(persistence: SchematicPersistence): UseSchematicFileReturn;
   ```

   Move the shared browser-File-API adapter into the same file as
   `webPersistence` (exported).

2. Replace `apps/web/src/hooks/useSchematicFile.ts` with a thin re-export
   wiring `webPersistence`.

3. Replace `apps/desktop/src/hooks/useSchematicFile.ts` with a thin wrapper
   that passes a `tauriPersistence` adapter (keeps the Tauri FS calls local
   to the desktop app where `@tauri-apps/*` imports belong).

**Files touched:**
- new: `packages/ui/src/lobby/schematicYaml.ts`,
  `packages/ui/src/hooks/useSchematicFile.ts`
- edit: `apps/web/src/hooks/useSchematicFile.ts` (shrink),
  `apps/desktop/src/hooks/useSchematicFile.ts` (shrink),
  `packages/ui/src/lobby/__tests__/schematicYaml.test.ts` (use real import)

**Verification:** `just typecheck` (hook signatures unchanged at call
sites); manual smoke test of save/load in both apps.

---

## Phase 2b — Shared panel components (~3 hours)

Touches the same files repeatedly. Ship as one PR titled
`refactor: extract shared StatRow/ConstraintBar/Panel components`. Depends on
Phase 1 only cosmetically (the extracted components will use the new
`formatNumber`).

### 2b.1 — `StatRow` (§3.1)

1. Create `packages/ui/src/components/StatRow.tsx`:

   ```tsx
   type StatRowProps = {
     label: React.ReactNode;
     value: React.ReactNode;
     unit?: string;
     className?: string;
   };
   ```

2. Pick the visual baseline from `ShipStatsPanel.tsx` (most feature-complete)
   and migrate the other two call sites. Preserve their existing className
   customizations via the `className` prop.

3. Delete the three private implementations.

### 2b.2 — `ConstraintBar` (§3.2)

1. Create `packages/ui/src/components/ConstraintBar.tsx` with props that
   cover both current use cases: `current`, `max`, `warningThreshold?`,
   `dangerThreshold?`, `label?`.

2. Migrate `InventoryConstraintsPanel.tsx` and `ShipStatsPanel.tsx`.

### 2b.3 — `PanelHeader` / `PanelFooter` (§3.3)

Three local instances: the two in §3.3 plus `ShipStatsPanelHeader` /
`ShipStatsPanelFooter` at `ShipStatsPanel.tsx:108,145`.

1. Create `packages/ui/src/components/PanelHeader.tsx` and
   `PanelFooter.tsx` with the superset of current props
   (`title`, `itemCount?`, `warningCount?`, `children?`, `actions?`).

2. Migrate all three panel files. Remove the prefixed
   `ShipStatsPanelHeader/Footer` names.

**Verification:** Visual regression is the main risk. Run `just storybook`
and eyeball each panel; add co-located unit tests for the new components
asserting that `itemCount` / `warningCount` render conditionally.

---

## Phase 2c — Type consolidation (~4–6 hours)

Ship as its own PR titled `refactor: consolidate Player/Team/Faction types`.
Can land before or after Phase 2b.

> **⚠️ Scope note.** The brainstorming doc framed this as a mechanical
> re-export from `@frigate/api-client`. Inspection of the current code shows
> it is not. The UI definitions and the api-client definitions disagree on
> field names (snake vs. camel) **and** on field sets (UI superset fields
> that do not exist in api-client). This phase therefore requires an
> explicit reconciliation decision before any migration happens. Budget
> more time than the original §4 estimate.

### 2c.0 — Reconcile the canonical shape (no code changes yet)

Current mismatches:

- `Player` — canonical `packages/api-client/src/types.ts:14`:
  `{ id, name, teamId: string | null }` (camelCase, required `teamId`).
  UI copies use `team_id` (snake_case) and add `created_at` /
  `last_active_at` (see `packages/ui/src/lobby/playerTypes.ts:1`,
  `PlayerRegistration.tsx:17`). `rest.ts` already normalizes the wire
  format (`team_id`) to camelCase inside `mapPlayer`, so the UI snake-case
  usage is a parallel code path that bypasses that mapper.
- `Team` — canonical api-client: `{ id, name, faction, members, credits }`
  with `credits` required and `members: readonly string[]`.
  `TeamBrowser.tsx:28` adds `status?: "recruiting" | "active" | ...` and
  marks `credits` optional.
- `Faction` — the api-client does not export one. `helpers.ts:1` has a
  minimal `{id, name}`; `TeamBrowser.tsx:18` adds `description` + `traits[]`;
  `TeamSelectionView.tsx:17` is a third minimal variant.

**Pick one of these reconciliation strategies before touching call sites:**

1. **Promote UI reality into api-client** (recommended). Add `status?` to
   `Team`, add `traits?` + `description` to a new api-client `Faction`
   type, and either (a) rename `Player.teamId` → `team_id` to match wire
   format OR (b) update the UI call sites to read `teamId`. This makes
   the api-client the single source of truth.
2. **Keep a UI-side superset** in `packages/ui/src/types/` that imports
   api-client types and extends them. Acceptable if the extra UI fields
   truly are presentation-only and not API-backed.

Record the choice in the PR description before starting 2c.1. If (1a) is
chosen, `rest.ts:56,107,129` also need updating.

### 2c.1 — Extend `packages/ui/src/types/`

> The directory already exists (contains `shipClass.ts`). Add files;
> don't recreate.

1. `packages/ui/src/types/player.ts` — per 2c.0 decision.
2. `packages/ui/src/types/team.ts` — per 2c.0 decision.
3. `packages/ui/src/types/faction.ts` — keep the richest variant
   (`TeamBrowser.tsx` with `traits[]`) as the canonical UI shape; if the
   traits belong in the API type, move them there instead (part of 2c.0
   strategy 1).
4. Create `packages/ui/src/types/index.ts` barrel re-exporting `player`,
   `team`, `faction`, and the existing `shipClass` module.

### 2c.2 — Migrate call sites

For each local `Player` / `Team` / `Faction` definition listed in §4 (plus
`apps/desktop/src/hooks/useAutoSetup.ts:14,24`), either:

- Replace with an import from `../types/`, or
- If the component genuinely uses a subset, prefer
  `type Props = { player: Pick<Player, "id" | "name"> }` at the prop
  boundary over a new named type.

If 2c.0 chose strategy 1a (snake_case on `Player`), also update reads like
`player.team_id` vs `player.teamId` across the UI; `grep -rn "team_id\\|teamId"`
lists 18+ sites in `packages/ui/src/lobby/` alone.

**Files touched:**
- new: `packages/ui/src/types/{player,team,faction,index}.ts`
- edit: `playerTypes.ts`, `PlayerRegistration.tsx`, `InventoryWorkspace.tsx`,
  `TeamBrowser.tsx`, `TeamSelectionView.tsx`, `helpers.ts`,
  `apps/desktop/src/hooks/useAutoSetup.ts`, and (if 2c.0 strategy 1a) every
  snake/camel access site in `packages/ui/src/lobby/*`
- possibly edit: `packages/api-client/src/types.ts`, `rest.ts` (if 2c.0
  strategy 1)

**Verification:** `just typecheck` is the primary gate — any field mismatch
between local shapes and the canonical API type surfaces as a compile error,
which is the point. Also run `just test` because renaming `team_id` ↔
`teamId` will flush out test fixtures that pinned the old shape.

---

## Phase 3 — Polish and follow-through (~2 hours)

Ship as separate small PRs.

### 3.1 — Extract `useFocusTrap` (§1.4)

1. Create `packages/ui/src/hooks/useFocusTrap.ts` from the
   `ModuleCatalog.tsx` inline definition.
2. Update `ModuleCatalog.tsx` to import.
3. Adopt in `AmmunitionDetailModal.tsx` and `EnhancedShipCreationModal.tsx`
   — these are the two modals flagged in §1.4.

### 3.2 — Fix hardcoded TODOs (§5.3)

1. `packages/ui/src/lobby/InventoryWorkspace.tsx:274` — resolve
   `availableWeight ?? 1000` by sourcing from ship-class / blueprint data.
2. `apps/web/src/App.tsx:352–358` — wire `availableWeight` from the selected
   ship class; pass real `installedModules`; connect the cargo-registration
   step.

This is feature work disguised as cleanup; may need its own plan if the
data wiring is non-trivial.

### 3.3 — Workspace wrappers (§3.4) — defer

Only two call sites exist. Revisit when a third workspace lands; extracting
now is speculative abstraction per `.claude/rules/development.md`.

### 3.4 — Utils reorg (§6) — defer

The `helpers.ts` / `playerUtils.ts` split becomes obvious once Phase 2
completes. Re-evaluate after the dust settles; splitting a 100-line helpers
file is pure churn without new content.

---

## Sequencing summary

| Phase | Description | PR | Est. |
|-------|-------------|-----|------|
| 1 | Cheap wins: formatting utils, formatPlayerId, dead phase1.3/1.4, unused assert | 1 | 2–3h |
| 2a | Schematic YAML + hook extraction | 1 | 2h |
| 2b | StatRow / ConstraintBar / PanelHeader+Footer | 1 | 3h |
| 2c | Player / Team / Faction type consolidation (requires reconciliation decision up front) | 1 | 4–6h |
| 3.1 | `useFocusTrap` extraction + adoption | 1 | 30m |
| 3.2 | Hardcoded TODO wiring (may become its own plan) | 1 | 1h+ |
| 3.3, 3.4 | Deferred | — | — |

Phases 2a/2b/2c are independent and can ship in parallel if split between
contributors. Phase 3 waits on Phase 2 only because the extracted utilities
are the natural import destinations.

## Out-of-scope

- `packages/api-client` internals beyond deleting the `phase1.*` files.
- Any behavior change to parse/serialize YAML — the extracted module is a
  pure move.
- Storybook story rewrites, unless a migrated component breaks an existing
  story.
