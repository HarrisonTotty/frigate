import React, { createContext, useContext } from 'react';

export type KeyModifier = 'ctrl' | 'shift' | 'alt' | 'meta';

export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers?: KeyModifier[];
  description: string;
  category?: string;
  context?: string;
  handler: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}

export interface KeyboardShortcutContextValue {
  register: (shortcut: KeyboardShortcut) => void;
  unregister: (id: string) => void;
  getShortcuts: () => KeyboardShortcut[];
  setContext: (context: string | undefined) => void;
  getContext: () => string | undefined;
}

export const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | undefined>(undefined);

export function useKeyboardShortcuts(): KeyboardShortcutContextValue {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutProvider');
  }
  return context;
}
