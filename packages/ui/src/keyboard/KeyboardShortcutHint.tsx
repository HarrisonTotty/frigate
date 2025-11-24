import React from 'react';
import { KeyboardShortcut, formatShortcut } from './utils';

export interface KeyboardShortcutHintProps {
  shortcut: KeyboardShortcut;
  className?: string;
}

export function KeyboardShortcutHint({ shortcut, className = '' }: KeyboardShortcutHintProps) {
  return (
    <kbd
      className={`inline-flex items-center gap-1 px-2 py-1 font-mono border text-xs ${className}`}
      style={{
        fontFamily: 'var(--frigate-font-mono)',
        fontSize: 'var(--frigate-font-tiny)',
        letterSpacing: '0.05em',
        borderColor: 'var(--frigate-border-base)',
        backgroundColor: 'var(--frigate-bg-raised)',
        color: 'var(--frigate-text-secondary)',
        fontWeight: 600,
      }}
      title={shortcut.description}
    >
      [{formatShortcut(shortcut)}]
    </kbd>
  );
}
