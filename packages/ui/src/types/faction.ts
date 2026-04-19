/**
 * Canonical Faction type for Frigate UI.
 *
 * Re-exported from `@frigate/api-client`. Prior to consolidation, three
 * parallel local definitions existed (`helpers.ts`, `TeamBrowser.tsx`,
 * `TeamSelectionView.tsx`); the richest variant (with optional
 * `description` and `traits`) is now the single source of truth.
 */
export type { Faction } from "@frigate/api-client";
