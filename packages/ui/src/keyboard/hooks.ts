import { useEffect } from "react";
import { KeyboardShortcut } from "./context";
import { useKeyboardShortcuts } from "./context";

export function useKeyboardShortcut(shortcut: KeyboardShortcut): void {
  const { register, unregister } = useKeyboardShortcuts();
  useEffect(() => {
    register(shortcut);
    return () => unregister(shortcut.id);
  }, [shortcut.id, shortcut.key, shortcut.modifiers?.join(","), shortcut.context]);
}
