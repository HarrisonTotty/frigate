/**
 * UI-facing type barrel.
 *
 * ## Phase 2c reconciliation decision
 *
 * The brainstorming doc framed Player/Team/Faction consolidation as a
 * mechanical re-export from `@frigate/api-client`. Inspection showed the
 * UI and api-client shapes disagreed on both field names (snake vs. camel)
 * and field sets (UI had `status` on Team, `description`/`traits` on
 * Faction, and `created_at`/`last_active_at` on Player that the api-client
 * did not expose).
 *
 * **Strategy 1a was chosen**: the UI's wire-format snake_case reality was
 * promoted into the api-client. `Player` now uses `team_id` (matching the
 * wire format and the raw-fetch call sites throughout the lobby), plus
 * optional `created_at` / `last_active_at`. `Team` gains an optional
 * `status`. A new `Faction` type with optional `description` / `traits`
 * replaces the three parallel definitions.
 *
 * Consequences in `packages/api-client/src/rest.ts`:
 * - `mapPlayer` emits `team_id` and lifts `created_at` / `last_active_at`
 *   through when present.
 * - `mapTeam` lifts `status` through when present.
 * - `mapBlueprint` and `mapShip` emit `team_id` (previously `teamId`) so
 *   every mapped type is uniformly wire-format.
 */
export type { Player } from "./player";
export type { Team, TeamStatus } from "./team";
export type { Faction } from "./faction";
export type {
  ShipSize,
  ShipRole,
  BonusCategory,
  ShipClassBonus,
  BonusCategoryMetadata,
  ManufacturerInfo,
  TechnicalSpecs,
  ShipClassSummary,
  ShipClassDetails,
  ShipClassVariant,
  OperationalMetadata,
  ShipClassFilter,
  ShipClassSortBy,
  SortOrder,
  ShipClassComparison,
} from "./shipClass";
