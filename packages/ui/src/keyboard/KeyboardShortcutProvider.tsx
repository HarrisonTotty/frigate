import React, { useRef, useCallback, useEffect } from 'react';
import { KeyboardShortcut, KeyboardShortcutContext } from './context';
import { matchesShortcut } from './utils';

export function KeyboardShortcutProvider({ children }: { children: React.ReactNode }) {
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());
  const contextRef = useRef<string | undefined>(undefined);

  const register = useCallback((shortcut: KeyboardShortcut) => {
    shortcutsRef.current.set(shortcut.id, shortcut);
  }, []);

  const unregister = useCallback((id: string) => {
    shortcutsRef.current.delete(id);
  }, []);

  const getShortcuts = useCallback(() => {
    return Array.from(shortcutsRef.current.values());
  }, []);

  const setContext = useCallback((context: string | undefined) => {
    contextRef.current = context;
  }, []);

  const getContext = useCallback(() => {
    return contextRef.current;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }
      const currentContext = contextRef.current;
      for (const shortcut of shortcutsRef.current.values()) {
        if (shortcut.context !== undefined && shortcut.context !== currentContext) {
          continue;
        }
        if (matchesShortcut(event, shortcut)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler(event);
          break;
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = {
    register,
    unregister,
    getShortcuts,
    setContext,
    getContext,
  };

  return (
    <KeyboardShortcutContext.Provider value={value}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
}
