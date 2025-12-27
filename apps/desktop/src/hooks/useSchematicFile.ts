/**
 * Schematic File Hook
 *
 * Provides file I/O operations for ship schematic files.
 * Uses Tauri commands in desktop environment, falls back to
 * browser File API for web builds.
 */

import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { SchematicFile } from '../types/schematic';

/**
 * Hook return type
 */
export interface UseSchematicFileReturn {
  /** Save schematic to file (opens save dialog) */
  saveSchematic: (schematic: SchematicFile) => Promise<boolean>;
  /** Load schematic from file (opens file picker) */
  loadSchematic: () => Promise<SchematicFile | null>;
  /** Whether a file operation is in progress */
  loading: boolean;
  /** Last error message, if any */
  error: string | null;
  /** Clear the current error */
  clearError: () => void;
}

/**
 * Check if running in Tauri environment
 * Tauri 2.0 uses __TAURI_INTERNALS__ instead of __TAURI__
 */
const isTauri = (): boolean => {
  return typeof window !== 'undefined' &&
    ('__TAURI__' in window || '__TAURI_INTERNALS__' in window);
};

/**
 * Parse YAML string to SchematicFile (basic parser for web fallback)
 *
 * Note: This is a simple parser that handles the specific schematic format.
 * For production use, consider using a proper YAML library.
 */
function parseSchematicYaml(yaml: string): SchematicFile {
  const lines = yaml.split('\n');
  const schematic: Partial<SchematicFile> = {
    modules: [],
  };

  let currentModule: Partial<{ slot: string; module: string | null }> | null = null;
  let inModules = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check for key-value pairs
    if (trimmed.startsWith('version:')) {
      schematic.version = parseInt(trimmed.split(':')[1].trim(), 10);
    } else if (trimmed.startsWith('name:')) {
      schematic.name = trimmed.split(':').slice(1).join(':').trim();
    } else if (trimmed.startsWith('ship_class:')) {
      schematic.ship_class = trimmed.split(':').slice(1).join(':').trim();
    } else if (trimmed === 'modules:') {
      inModules = true;
    } else if (inModules && trimmed.startsWith('- slot:')) {
      // New module entry
      if (currentModule && currentModule.slot) {
        schematic.modules!.push({
          slot: currentModule.slot,
          module: currentModule.module ?? null,
        });
      }
      currentModule = {
        slot: trimmed.replace('- slot:', '').trim(),
        module: null,
      };
    } else if (inModules && currentModule && trimmed.startsWith('module:')) {
      const value = trimmed.split(':').slice(1).join(':').trim();
      currentModule.module = value === 'null' || value === '' ? null : value;
    }
  }

  // Don't forget the last module
  if (currentModule && currentModule.slot) {
    schematic.modules!.push({
      slot: currentModule.slot,
      module: currentModule.module ?? null,
    });
  }

  // Validate required fields
  if (schematic.version === undefined) throw new Error('Missing version field');
  if (!schematic.name) throw new Error('Missing name field');
  if (!schematic.ship_class) throw new Error('Missing ship_class field');

  return schematic as SchematicFile;
}

/**
 * Serialize SchematicFile to YAML string (for web fallback)
 */
function serializeSchematicYaml(schematic: SchematicFile): string {
  const lines: string[] = [
    `version: ${schematic.version}`,
    `name: ${schematic.name}`,
    `ship_class: ${schematic.ship_class}`,
    'modules:',
  ];

  for (const mod of schematic.modules) {
    lines.push(`  - slot: ${mod.slot}`);
    lines.push(`    module: ${mod.module ?? 'null'}`);
  }

  return lines.join('\n');
}

/**
 * Hook for schematic file operations
 */
export function useSchematicFile(): UseSchematicFileReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Save schematic to file
   * Returns true if saved, false if cancelled
   */
  const saveSchematic = useCallback(async (schematic: SchematicFile): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (isTauri()) {
        // Use Tauri command
        const saved = await invoke<boolean>('save_schematic_file', { schematic });
        return saved;
      } else {
        // Web fallback: Download as file
        const yaml = serializeSchematicYaml(schematic);
        const blob = new Blob([yaml], { type: 'application/x-yaml' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${schematic.name}.yaml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return true;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('[useSchematicFile] Save error:', message);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load schematic from file
   * Returns the schematic or null if cancelled
   */
  const loadSchematic = useCallback(async (): Promise<SchematicFile | null> => {
    setLoading(true);
    setError(null);

    try {
      if (isTauri()) {
        // Use Tauri command
        const schematic = await invoke<SchematicFile | null>('load_schematic_file');
        return schematic;
      } else {
        // Web fallback: File input
        // Note: We must handle setLoading(false) inside the Promise callbacks
        // because the file input is async and we want loading to stay true
        // until the user completes their selection
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.yaml,.yml';

          input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) {
              setLoading(false);
              resolve(null);
              return;
            }

            try {
              const text = await file.text();
              const schematic = parseSchematicYaml(text);
              setLoading(false);
              resolve(schematic);
            } catch (parseError) {
              const message = parseError instanceof Error ? parseError.message : String(parseError);
              console.error('[useSchematicFile] Parse error:', message);
              setError(`Failed to parse schematic: ${message}`);
              setLoading(false);
              resolve(null);
            }
          };

          // Handle cancel (no file selected)
          input.oncancel = () => {
            setLoading(false);
            resolve(null);
          };

          input.click();
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('[useSchematicFile] Load error:', message);
      setError(message);
      return null;
    } finally {
      // Only set loading false for Tauri path - web fallback handles it in callbacks
      if (isTauri()) {
        setLoading(false);
      }
    }
  }, []);

  return {
    saveSchematic,
    loadSchematic,
    loading,
    error,
    clearError,
  };
}

export default useSchematicFile;
