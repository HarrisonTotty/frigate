/**
 * Canonical Player type for Frigate UI.
 *
 * Re-exported from `@frigate/api-client`. The canonical shape uses
 * wire-format snake_case for `team_id`, `created_at`, and `last_active_at`
 * because most UI consumers fetch `/v1/players` directly rather than going
 * through `RestClient`, and those raw responses use snake_case.
 */
export type { Player } from "@frigate/api-client";
