/**
 * Ship Schematic YAML Module
 *
 * Shared type definitions and YAML parse/serialize helpers for ship schematic
 * files. Used by the cross-platform `useSchematicFile` hook and by consumers
 * that need to round-trip schematic data through YAML.
 *
 * The YAML format is intentionally simple; a hand-rolled parser handles the
 * small, fixed schema without pulling in a full YAML dependency.
 */

/**
 * A module slot assignment in a schematic.
 */
export type SchematicModule = {
  /** The slot type ID (e.g., "kinetic-weapon", "power-core"). */
  slot: string;
  /** The module variant ID, or null if no variant selected. */
  module: string | null;
};

/**
 * Ship schematic file format — a saved ship configuration.
 */
export type SchematicFile = {
  /** File format version (currently 1). */
  version: number;
  /** Ship name. */
  name: string;
  /** Ship class ID. */
  ship_class: string;
  /** Module slot assignments. */
  modules: SchematicModule[];
};

/**
 * Parse a schematic YAML string into a {@link SchematicFile}.
 *
 * Handles the specific schematic schema only. Throws if any required top-level
 * field is missing.
 */
export function parseSchematicYaml(yaml: string): SchematicFile {
  const lines = yaml.split("\n");
  const schematic: Partial<SchematicFile> = {
    modules: [],
  };

  let currentModule: Partial<{ slot: string; module: string | null }> | null = null;
  let inModules = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("version:")) {
      schematic.version = parseInt(trimmed.split(":")[1].trim(), 10);
    } else if (trimmed.startsWith("name:")) {
      schematic.name = trimmed.split(":").slice(1).join(":").trim();
    } else if (trimmed.startsWith("ship_class:")) {
      schematic.ship_class = trimmed.split(":").slice(1).join(":").trim();
    } else if (trimmed === "modules:") {
      inModules = true;
    } else if (inModules && trimmed.startsWith("- slot:")) {
      if (currentModule && currentModule.slot) {
        schematic.modules!.push({
          slot: currentModule.slot,
          module: currentModule.module ?? null,
        });
      }
      currentModule = {
        slot: trimmed.replace("- slot:", "").trim(),
        module: null,
      };
    } else if (inModules && currentModule && trimmed.startsWith("module:")) {
      const value = trimmed.split(":").slice(1).join(":").trim();
      currentModule.module = value === "null" || value === "" ? null : value;
    }
  }

  if (currentModule && currentModule.slot) {
    schematic.modules!.push({
      slot: currentModule.slot,
      module: currentModule.module ?? null,
    });
  }

  if (schematic.version === undefined) throw new Error("Missing version field");
  if (!schematic.name) throw new Error("Missing name field");
  if (!schematic.ship_class) throw new Error("Missing ship_class field");

  return schematic as SchematicFile;
}

/**
 * Serialize a {@link SchematicFile} to its YAML string representation.
 */
export function serializeSchematicYaml(schematic: SchematicFile): string {
  const lines: string[] = [
    `version: ${schematic.version}`,
    `name: ${schematic.name}`,
    `ship_class: ${schematic.ship_class}`,
    "modules:",
  ];

  for (const mod of schematic.modules) {
    lines.push(`  - slot: ${mod.slot}`);
    lines.push(`    module: ${mod.module ?? "null"}`);
  }

  return lines.join("\n");
}
