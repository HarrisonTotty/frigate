/**
 * Schematic File Hook (Platform-Agnostic Core)
 *
 * Provides file I/O operations for ship schematic files. Platform-specific
 * persistence (Tauri file-system commands vs. browser download/file-input) is
 * delegated to a {@link SchematicPersistence} adapter supplied by the caller.
 * The hook owns the loading/error state and the YAML serialization boundary.
 */

import { useCallback, useState } from "react";
import {
  parseSchematicYaml,
  serializeSchematicYaml,
  type SchematicFile,
} from "../lobby/schematicYaml";

/**
 * Platform adapter for schematic file persistence.
 *
 * Implementations abstract away the file-system mechanism (dialog, download,
 * Tauri command, etc.) and deal purely in YAML strings.
 */
export type SchematicPersistence = {
  /**
   * Present a file picker and resolve with the chosen file's content, or
   * `null` if the user cancelled.
   */
  open: () => Promise<{ content: string; name: string } | null>;
  /**
   * Persist the supplied YAML string. `suggestedName` is the schematic's
   * logical name (without extension); the adapter decides where/how to store
   * the file. Resolves to `true` on success, `false` on user cancellation.
   */
  save: (content: string, suggestedName: string) => Promise<boolean>;
};

/**
 * Return shape of the {@link useSchematicFile} hook.
 */
export type UseSchematicFileReturn = {
  /** Save schematic via the injected persistence adapter. */
  saveSchematic: (schematic: SchematicFile) => Promise<boolean>;
  /** Load schematic via the injected persistence adapter. */
  loadSchematic: () => Promise<SchematicFile | null>;
  /** Whether a file operation is in progress. */
  loading: boolean;
  /** Last error message, if any. */
  error: string | null;
  /** Clear the current error. */
  clearError: () => void;
};

/**
 * Browser-based persistence adapter.
 *
 * Uses a hidden `<input type="file">` for loading and a download link for
 * saving — the standard fallback when no native file-system API is available.
 */
export const webPersistence: SchematicPersistence = {
  open() {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".yaml,.yml";

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        try {
          const text = await file.text();
          resolve({ content: text, name: file.name });
        } catch (readError) {
          const message = readError instanceof Error ? readError.message : String(readError);
          console.error("[webPersistence] Read error:", message);
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);

      input.click();
    });
  },
  async save(content, suggestedName) {
    const blob = new Blob([content], { type: "application/x-yaml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${suggestedName}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  },
};

/**
 * Hook for schematic file operations. Pass in a platform-appropriate
 * {@link SchematicPersistence} adapter to control how files are opened/saved.
 */
export function useSchematicFile(persistence: SchematicPersistence): UseSchematicFileReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const saveSchematic = useCallback(
    async (schematic: SchematicFile): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const content = serializeSchematicYaml(schematic);
        return await persistence.save(content, schematic.name);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("[useSchematicFile] Save error:", message);
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [persistence],
  );

  const loadSchematic = useCallback(async (): Promise<SchematicFile | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await persistence.open();
      if (!result) return null;

      try {
        return parseSchematicYaml(result.content);
      } catch (parseError) {
        const message = parseError instanceof Error ? parseError.message : String(parseError);
        console.error("[useSchematicFile] Parse error:", message);
        setError(`Failed to parse schematic: ${message}`);
        return null;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("[useSchematicFile] Load error:", message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [persistence]);

  return {
    saveSchematic,
    loadSchematic,
    loading,
    error,
    clearError,
  };
}

export default useSchematicFile;
