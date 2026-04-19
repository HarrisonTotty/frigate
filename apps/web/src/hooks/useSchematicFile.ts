/**
 * Schematic File Hook (Web Binding)
 *
 * Binds the shared `useSchematicFile` core from `@frigate/ui` to the
 * browser-based persistence adapter.
 */

import {
  useSchematicFile as useSchematicFileCore,
  webPersistence,
  type UseSchematicFileReturn,
} from "@frigate/ui";

export type { UseSchematicFileReturn };

export function useSchematicFile(): UseSchematicFileReturn {
  return useSchematicFileCore(webPersistence);
}

export default useSchematicFile;
