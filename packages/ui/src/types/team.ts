/**
 * Canonical Team type for Frigate UI.
 *
 * Re-exported from `@frigate/api-client`. Includes the UI-facing optional
 * `status` field (`"recruiting" | "active" | "in-mission" | "disbanded"`),
 * which is promoted into the api-client shape so every consumer sees the
 * same contract.
 */
export type { Team, TeamStatus } from "@frigate/api-client";
