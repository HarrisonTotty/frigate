/**
 * Schematic File Hook (Desktop Binding)
 *
 * Binds the shared `useSchematicFile` core from `@frigate/ui` to a Tauri-based
 * persistence adapter, falling back to the shared browser adapter when running
 * outside of Tauri (dev builds served by vite without the Tauri shell).
 */

import { invoke } from "@tauri-apps/api/core";
import {
  useSchematicFile as useSchematicFileCore,
  webPersistence,
  parseSchematicYaml,
  serializeSchematicYaml,
  type SchematicFile,
  type SchematicPersistence,
  type UseSchematicFileReturn,
} from "@frigate/ui";

export type { UseSchematicFileReturn };

/**
 * Tauri 2.x exposes `__TAURI_INTERNALS__` (older releases used `__TAURI__`).
 */
function isTauri(): boolean {
  return (
    typeof window !== "undefined" && ("__TAURI__" in window || "__TAURI_INTERNALS__" in window)
  );
}

const tauriPersistence: SchematicPersistence = {
  async open() {
    const schematic = await invoke<SchematicFile | null>("load_schematic_file");
    if (!schematic) return null;
    return {
      content: serializeSchematicYaml(schematic),
      name: `${schematic.name}.yaml`,
    };
  },
  async save(content, _suggestedName) {
    const schematic = parseSchematicYaml(content);
    return invoke<boolean>("save_schematic_file", { schematic });
  },
};

const desktopPersistence: SchematicPersistence = {
  open: () => (isTauri() ? tauriPersistence.open() : webPersistence.open()),
  save: (content, suggestedName) =>
    isTauri()
      ? tauriPersistence.save(content, suggestedName)
      : webPersistence.save(content, suggestedName),
};

export function useSchematicFile(): UseSchematicFileReturn {
  return useSchematicFileCore(desktopPersistence);
}

export default useSchematicFile;
