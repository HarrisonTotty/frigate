import { KeyboardShortcut } from "./context";
export type { KeyboardShortcut };

export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
    return false;
  }
  const modifiers = shortcut.modifiers || [];
  const hasCtrl = modifiers.includes("ctrl") || modifiers.includes("meta");
  const hasShift = modifiers.includes("shift");
  const hasAlt = modifiers.includes("alt");
  const ctrlOrMeta = event.ctrlKey || event.metaKey;
  if (hasCtrl && !ctrlOrMeta) return false;
  if (!hasCtrl && ctrlOrMeta) return false;
  if (hasShift && !event.shiftKey) return false;
  if (!hasShift && event.shiftKey) return false;
  if (hasAlt && !event.altKey) return false;
  if (!hasAlt && event.altKey) return false;
  return true;
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  const modifiers = shortcut.modifiers || [];
  if (modifiers.includes("ctrl") || modifiers.includes("meta")) {
    parts.push("CTRL");
  }
  if (modifiers.includes("shift")) {
    parts.push("SHIFT");
  }
  if (modifiers.includes("alt")) {
    parts.push("ALT");
  }
  const keyName =
    shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key.toUpperCase();
  parts.push(keyName);
  return parts.join("+");
}
