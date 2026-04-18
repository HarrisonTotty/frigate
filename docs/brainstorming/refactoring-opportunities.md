# Refactoring Opportunities

A survey of dead and duplicated code across the Frigate monorepo, intended as
input for one or more focused refactoring plans. Findings are grouped by kind,
ordered roughly by severity within each section. File references use
`path:line` format.

## Scope & method

- Surveyed: `apps/desktop`, `apps/web`, and `packages/{state,ui,utils}`.
- `packages/api-client` was partially skipped (generated or scaffolded code),
  but top-level `index*.ts` / `rest*.ts` were checked for obvious dead files.
- Focus: unused exports/files, near-identical utilities, parallel component
  subtrees, and type definitions that shadow the canonical API types.

---

## 1. Duplicated utilities

### 1.1 `formatCredits` — six variants, three behaviors

Same semantic function copy-pasted with subtle differences.

- `packages/ui/src/lobby/EnhancedShipCreationModal.tsx:56` — `toLocaleString`, `"---"` for nullish.
- `packages/ui/src/lobby/ModuleSlotCard.tsx:8` — same as above.
- `packages/ui/src/lobby/ShipClassSelect.tsx:11` — **`String(value)`, no `toLocaleString`** (inconsistent output).
- `packages/ui/src/modules/ModuleCatalog.tsx:99` — also treats `0` as nullish.
- `packages/ui/src/shipclass/BuildConstraintsPanel.tsx:35` — likely the same pattern.
- `packages/ui/src/lobby/ShipStatsPanel.tsx:367` — local arrow-function; `value.toLocaleString()` with no nullish handling.

**Action:** extract to `packages/ui/src/utils/formatting.ts` with a single
implementation (`toLocaleString` + `"---"` for nullish). Decide explicitly
whether `0` should render as `"0"` or `"---"` and document it.

### 1.2 `formatNumber` — four identical copies

`(value) => value.toLocaleString()` in four files.

- `packages/ui/src/components/AmmunitionTooltip.tsx:35`
- `packages/ui/src/lobby/AmmunitionDetailModal.tsx:41`
- `packages/ui/src/lobby/InventoryConstraintsPanel.tsx:49`
- `packages/ui/src/lobby/LoadedInventoryPanel.tsx:36`

**Action:** move into the same `utils/formatting.ts` module as `formatCredits`.

### 1.3 `formatPlayerId` — two exports, one local reimplementation

- `packages/ui/src/lobby/helpers.ts:6` — exported, used by `TeamSelectionViewHeader`.
- `packages/ui/src/lobby/playerUtils.ts:27` — exported, used by `PlayerItem`.
- `packages/ui/src/lobby/ShipSelectionHeader.tsx:15` — local function, uses neither export.

**Action:** keep the `playerUtils.ts` version, re-export from `helpers.ts` (or
remove that alias), and replace the `ShipSelectionHeader` local copy with an
import.

### 1.4 `useFocusTrap` defined inside a component

- `packages/ui/src/modules/ModuleCatalog.tsx:11`

Modals in `packages/ui/src/lobby/*` would benefit from the same trap.

**Action:** extract to `packages/ui/src/hooks/useFocusTrap.ts` and reuse from
other modals (`AmmunitionDetailModal`, `EnhancedShipCreationModal`, etc.).

---

## 2. Duplicated hooks & logic

### 2.1 `useSchematicFile` — parallel implementations in both apps

- `apps/desktop/src/hooks/useSchematicFile.ts` (248 lines) — web path + Tauri fallback.
- `apps/web/src/hooks/useSchematicFile.ts` (230 lines) — web-only.

Both redeclare `SchematicFile`, `SchematicModule`, and
`UseSchematicFileReturn`, and both reimplement `parseSchematicYaml` /
`serializeSchematicYaml`.

A **third** copy of the YAML logic lives in the test file at
`packages/ui/src/lobby/__tests__/schematicYaml.test.ts` — there is no
`schematicYaml.ts` source file; the test hand-rolls its own copy to test
against. This is the strongest signal that the logic belongs in `packages/ui`.

**Action (tentative):**
1. Create `packages/ui/src/lobby/schematicYaml.ts` — pure parse/serialize
   functions and the shared types. Update the existing test to import from it
   instead of duplicating.
2. Create `packages/ui/src/hooks/useSchematicFile.ts` — platform-agnostic core
   using the browser File API.
3. Either pass a `persistence` adapter into the hook (Tauri FS for desktop,
   download-blob for web) or keep the Tauri branch in `apps/desktop` as a thin
   wrapper around the shared hook. The former is cleaner and removes the
   duplication entirely.

---

## 3. Duplicated component patterns

### 3.1 `StatRow` — three private implementations

- `packages/ui/src/components/AmmunitionTooltip.tsx:42`
- `packages/ui/src/lobby/InventoryConstraintsPanel.tsx:122`
- `packages/ui/src/lobby/ShipStatsPanel.tsx:237`

All render a label/value pair in a flex row with minor styling differences.

**Action:** extract a `<StatRow label value unit? className?>` component to
`packages/ui/src/components/StatRow.tsx`.

### 3.2 `ConstraintBar` — two near-identical copies

- `packages/ui/src/lobby/InventoryConstraintsPanel.tsx:56`
- `packages/ui/src/lobby/ShipStatsPanel.tsx:285`

Both render a horizontal fill bar with threshold coloring.

**Action:** extract to `packages/ui/src/components/ConstraintBar.tsx`.

### 3.3 `PanelHeader` / `PanelFooter` duplicated with mismatched signatures

Two files each define local `PanelHeader` and `PanelFooter` components with
the same names but different prop shapes:

- `packages/ui/src/lobby/InventoryConstraintsPanel.tsx:167,204`
  (`PanelHeader()`, `PanelFooter({ warningCount })`)
- `packages/ui/src/lobby/LoadedInventoryPanel.tsx:298,335`
  (`PanelHeader({ itemCount })`, `PanelFooter()`)

A third, name-prefixed instance of the same pattern lives at
`packages/ui/src/lobby/ShipStatsPanel.tsx:108,145`
(`ShipStatsPanelHeader()`, `ShipStatsPanelFooter({ warningCount })`) and
should likely fold into the same shared component.

**Action:** one pair of components with optional props, shared between the
panels above (and usable by future ones).

### 3.4 `WorkspaceHeader` / `WorkspaceFooter` — divergent copies

- `packages/ui/src/lobby/ShipDesignWorkspace.tsx:73,162`
- `packages/ui/src/lobby/InventoryWorkspace.tsx:83,150`

Same structural pattern; lower priority than the panel headers since only two
call sites exist today.

**Action:** fold into a single `Workspace` layout wrapper or defer until a
third workspace appears.

---

## 4. Duplicated type definitions

The canonical `Player` and `Team` types live in
`packages/api-client/src/types.ts`, but multiple UI components declare their
own narrower versions.

### 4.1 `Player` — five definitions

- `packages/api-client/src/types.ts:14` — canonical.
- `packages/ui/src/lobby/playerTypes.ts:1` — `{id, name, created_at, last_active_at, team_id}`.
- `packages/ui/src/lobby/PlayerRegistration.tsx:17` — `{id, name, team_id}`.
- `packages/ui/src/lobby/InventoryWorkspace.tsx:30` — `{id, name}`.
- `apps/desktop/src/hooks/useAutoSetup.ts:14` — local to the desktop auto-setup hook.

`packages/ui/src/lobby/TeamBrowser.tsx:13` imports `type { Player }` from
`PlayerRegistration` rather than from any canonical source.

### 4.2 `Team` — four definitions

- `packages/api-client/src/types.ts:20` — canonical.
- `packages/ui/src/lobby/TeamBrowser.tsx:28`.
- `packages/ui/src/lobby/InventoryWorkspace.tsx:38`.
- `apps/desktop/src/hooks/useAutoSetup.ts:24` — local to the desktop auto-setup hook.

### 4.3 `Faction` — three versions

- `packages/ui/src/lobby/helpers.ts:1` — basic.
- `packages/ui/src/lobby/TeamBrowser.tsx:18` — extended with `traits[]`.
- `packages/ui/src/lobby/TeamSelectionView.tsx:17` — third variant.

**Action:** consolidate under `packages/ui/src/types/{player,team,faction}.ts`
(or re-export the api-client shapes). Where components need a subset, use
`Pick<Player, ...>` at the prop boundary rather than redefining. This keeps
one source of truth when the API schema evolves.

---

## 5. Dead code

### 5.1 `rest.phase1.3.test.ts` and `index.phase1.4.{ts,test.ts}`

- `packages/api-client/src/rest.phase1.3.test.ts`
- `packages/api-client/src/index.phase1.4.ts`
- `packages/api-client/src/index.phase1.4.test.ts`

`grep` for `phase1.3` and `phase1.4` returns no hits outside these files
themselves. Current code uses `rest.ts` and `index.ts`.

**Action:** delete, unless the user wants to keep them as historical
snapshots — in which case they should move out of `src/` so they aren't
picked up by the test runner.

### 5.2 Unused `assert` export

- `packages/utils/src/index.ts:1` exports an `assert` helper.
- Imports: only its own test file. No app or package consumes it.

**Action:** either remove it or actually use it at validation boundaries that
currently throw generic errors.

### 5.3 TODO stubs with hardcoded values

Not dead, but tagged for follow-up and likely to silently diverge from the
real data shape:

- `packages/ui/src/lobby/InventoryWorkspace.tsx:274` — `availableWeight ?? 1000`.
- `apps/web/src/App.tsx:352–358` — `availableWeight={100}`,
  `installedModules={[]}`, and an unhandled cargo-registration step.

**Action:** wire up real blueprint/ship-class data before this drifts further.

---

## 6. Organizational follow-ups

These are not duplicates per se but surface after the deduplication above is
done:

- `packages/ui/src/lobby/helpers.ts` and `playerUtils.ts` overlap in purpose —
  consider folding into a `packages/ui/src/utils/` tree split by concern
  (`formatting.ts`, `time.ts`, `players.ts`) with a single re-export.
- `packages/ui/src/types/` does not exist. Creating it as the canonical home
  for UI-facing types (re-exporting or `Pick`ing from api-client) gives the
  consolidation in §4 somewhere to live.

---

## Suggested sequencing

1. **Cheap wins first (low risk, ≈2–3h):** §1.1, §1.2, §1.3, §5.1, §5.2.
2. **High-impact dedup (≈4–5h):** §2.1 schematic hook/logic, §3.1–§3.3
   component extraction, §4.1–§4.3 type consolidation.
3. **Polish / follow-through:** §1.4 `useFocusTrap`, §3.4 workspace wrappers,
   §5.3 TODOs, §6 reorganization.

Each numbered section above is small enough to ship as its own PR. Phase 2
items touch the same files repeatedly, so batching §3 and §4 together avoids
redundant churn.
