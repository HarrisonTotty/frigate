/**
 * Ship Schematic File Types
 *
 * TypeScript types for ship schematic files that can be saved/loaded
 * via the Tauri backend commands.
 */

/**
 * A module slot assignment in a schematic
 */
export interface SchematicModule {
  /** The slot type ID (e.g., "kinetic-weapon", "power-core") */
  slot: string;
  /** The module variant ID, or null if no variant selected */
  module: string | null;
}

/**
 * Ship schematic file format
 *
 * Represents a saved ship configuration that can be loaded
 * to quickly recreate a ship design.
 */
export interface SchematicFile {
  /** File format version (currently 1) */
  version: number;
  /** Ship name */
  name: string;
  /** Ship class ID */
  ship_class: string;
  /** Module slot assignments */
  modules: SchematicModule[];
}
