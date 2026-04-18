/**
 * Storybook stories for keyboard shortcut system
 */

import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import {
  KeyboardShortcutProvider,
  useKeyboardShortcut,
  KeyboardShortcutHint,
  type KeyboardShortcut,
} from "../keyboard";
import { Panel } from "../layout";

const meta: Meta = {
  title: "Interaction/Keyboard Shortcuts",
  decorators: [
    (Story) => (
      <KeyboardShortcutProvider>
        <Story />
      </KeyboardShortcutProvider>
    ),
  ],
};

export default meta;

/**
 * Basic keyboard shortcut demonstration
 */
export const BasicShortcuts: StoryObj = {
  render: () => {
    const Demo = () => {
      const [log, setLog] = useState<string[]>([]);

      const addLog = (message: string) => {
        setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
      };

      // Register some shortcuts
      useKeyboardShortcut({
        id: "save",
        key: "s",
        modifiers: ["meta"],
        description: "Save current work",
        handler: () => addLog("Save triggered"),
      });

      useKeyboardShortcut({
        id: "search",
        key: "f",
        modifiers: ["meta"],
        description: "Open search",
        handler: () => addLog("Search triggered"),
      });

      useKeyboardShortcut({
        id: "help",
        key: "?",
        modifiers: ["shift"],
        description: "Show help",
        handler: () => addLog("Help triggered"),
      });

      return (
        <div className="space-y-4">
          <Panel title="Active Shortcuts">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Save current work</span>
                <KeyboardShortcutHint
                  shortcut={{
                    id: "save",
                    key: "s",
                    modifiers: ["meta"],
                    description: "Save",
                    handler: () => {},
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Open search</span>
                <KeyboardShortcutHint
                  shortcut={{
                    id: "search",
                    key: "f",
                    modifiers: ["meta"],
                    description: "Search",
                    handler: () => {},
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Show help</span>
                <KeyboardShortcutHint
                  shortcut={{
                    id: "help",
                    key: "?",
                    modifiers: ["shift"],
                    description: "Help",
                    handler: () => {},
                  }}
                />
              </div>
            </div>
          </Panel>

          <Panel title="Event Log" variant="muted">
            <div className="font-mono text-sm space-y-1 max-h-40 overflow-y-auto">
              {log.length === 0 ? (
                <div className="text-text-muted">Try pressing the shortcuts above...</div>
              ) : (
                log.map((entry, i) => <div key={i}>{entry}</div>)
              )}
            </div>
          </Panel>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * Context-aware shortcuts
 */
export const ContextAwareShortcuts: StoryObj = {
  render: () => {
    const Demo = () => {
      const [context, setContext] = useState<string | undefined>(undefined);
      const [log, setLog] = useState<string[]>([]);

      const addLog = (message: string) => {
        setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
      };

      // Global shortcuts
      useKeyboardShortcut({
        id: "global-help",
        key: "h",
        modifiers: ["meta"],
        description: "Global help",
        handler: () => addLog("Global help (always available)"),
      });

      // Helm context
      useKeyboardShortcut({
        id: "helm-thrust",
        key: "w",
        description: "Increase thrust",
        context: "helm",
        handler: () => addLog("Helm: Increase thrust"),
      });

      // Tactical context
      useKeyboardShortcut({
        id: "tactical-fire",
        key: "space",
        description: "Fire weapons",
        context: "tactical",
        handler: () => addLog("Tactical: Fire weapons"),
      });

      return (
        <div className="space-y-4">
          <Panel title="Context Selection">
            <div className="flex gap-2">
              <button
                onClick={() => setContext(undefined)}
                className={`px-4 py-2 rounded ${
                  context === undefined ? "bg-primary-600" : "bg-background-800"
                }`}
              >
                None
              </button>
              <button
                onClick={() => setContext("helm")}
                className={`px-4 py-2 rounded ${
                  context === "helm" ? "bg-primary-600" : "bg-background-800"
                }`}
              >
                Helm
              </button>
              <button
                onClick={() => setContext("tactical")}
                className={`px-4 py-2 rounded ${
                  context === "tactical" ? "bg-primary-600" : "bg-background-800"
                }`}
              >
                Tactical
              </button>
            </div>
            <div className="mt-2 text-sm text-text-muted">
              Current context: <strong>{context || "Global"}</strong>
            </div>
          </Panel>

          <Panel title="Available Shortcuts">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Global help (always available)</span>
                <kbd className="px-2 py-1 text-xs font-mono rounded border border-primary-700 bg-background-800">
                  ⌘H
                </kbd>
              </div>
              {context === "helm" && (
                <div className="flex items-center justify-between">
                  <span>Increase thrust (Helm only)</span>
                  <kbd className="px-2 py-1 text-xs font-mono rounded border border-primary-700 bg-background-800">
                    W
                  </kbd>
                </div>
              )}
              {context === "tactical" && (
                <div className="flex items-center justify-between">
                  <span>Fire weapons (Tactical only)</span>
                  <kbd className="px-2 py-1 text-xs font-mono rounded border border-primary-700 bg-background-800">
                    Space
                  </kbd>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Event Log" variant="muted">
            <div className="font-mono text-sm space-y-1 max-h-40 overflow-y-auto">
              {log.length === 0 ? (
                <div className="text-text-muted">
                  Try pressing shortcuts in different contexts...
                </div>
              ) : (
                log.map((entry, i) => <div key={i}>{entry}</div>)
              )}
            </div>
          </Panel>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * Shortcut formatting examples
 */
export const ShortcutFormatting: StoryObj = {
  render: () => {
    const shortcuts: KeyboardShortcut[] = [
      { id: "1", key: "s", modifiers: ["meta"], description: "Save", handler: () => {} },
      {
        id: "2",
        key: "k",
        modifiers: ["meta", "shift"],
        description: "Command palette",
        handler: () => {},
      },
      { id: "3", key: "Enter", description: "Confirm", handler: () => {} },
      { id: "4", key: "Escape", description: "Cancel", handler: () => {} },
      { id: "5", key: "f", modifiers: ["ctrl", "alt"], description: "Find", handler: () => {} },
    ];

    return (
      <Panel title="Shortcut Formatting">
        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.id} className="flex items-center justify-between">
              <span>{shortcut.description}</span>
              <div className="flex items-center gap-2">
                <code className="text-xs text-text-muted">
                  {JSON.stringify({ key: shortcut.key, modifiers: shortcut.modifiers })}
                </code>
                <KeyboardShortcutHint shortcut={shortcut} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  },
};
