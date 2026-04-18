/**
 * Storybook stories for command palette
 */

import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { CommandPalette, useCommandPalette, type Command } from "../command-palette";
import { KeyboardShortcutProvider } from "../keyboard";
import { Panel } from "../layout";

const meta: Meta<typeof CommandPalette> = {
  title: "Interaction/Command Palette",
  component: CommandPalette,
  decorators: [
    (Story) => (
      <KeyboardShortcutProvider>
        <Story />
      </KeyboardShortcutProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

/**
 * Sample commands for stories
 */
const sampleCommands: Command[] = [
  {
    id: "helm-full-stop",
    label: "Full Stop",
    description: "Immediately halt all movement",
    category: "Helm",
    keywords: ["stop", "halt", "brake"],
    handler: () => console.log("Full stop"),
  },
  {
    id: "helm-warp",
    label: "Engage Warp Drive",
    description: "Enter warp speed",
    category: "Helm",
    keywords: ["warp", "ftl", "fast"],
    handler: () => console.log("Warp engaged"),
  },
  {
    id: "tactical-fire",
    label: "Fire All Weapons",
    description: "Fire all armed weapon systems",
    category: "Tactical",
    keywords: ["fire", "shoot", "attack"],
    handler: () => console.log("Weapons fired"),
  },
  {
    id: "tactical-shields-up",
    label: "Raise Shields",
    description: "Activate defensive shields",
    category: "Tactical",
    keywords: ["shields", "defense", "protect"],
    handler: () => console.log("Shields raised"),
  },
  {
    id: "eng-power-weapons",
    label: "Prioritize Weapons Power",
    description: "Allocate maximum power to weapon systems",
    category: "Engineering",
    keywords: ["power", "weapons", "energy"],
    handler: () => console.log("Power to weapons"),
  },
  {
    id: "eng-repair",
    label: "Emergency Repairs",
    description: "Begin emergency repair procedures",
    category: "Engineering",
    keywords: ["repair", "fix", "damage"],
    handler: () => console.log("Repairs started"),
  },
  {
    id: "comm-hail",
    label: "Open Hailing Frequencies",
    description: "Initiate communication",
    category: "Communications",
    keywords: ["hail", "communicate", "message"],
    handler: () => console.log("Hailing"),
  },
  {
    id: "sci-scan",
    label: "Deep Scan",
    description: "Perform detailed sensor scan",
    category: "Science",
    keywords: ["scan", "analyze", "sensors"],
    handler: () => console.log("Scanning"),
  },
];

/**
 * Basic command palette
 */
export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close"),
    commands: sampleCommands,
  },
};

/**
 * With fuzzy search demonstration
 */
export const FuzzySearch: Story = {
  render: () => {
    const Demo = () => {
      const [isOpen, setIsOpen] = useState(true);
      const [lastCommand, setLastCommand] = useState<string>("");

      const commandsWithFeedback = sampleCommands.map((cmd) => ({
        ...cmd,
        handler: () => {
          setLastCommand(cmd.label);
          setIsOpen(false);
        },
      }));

      return (
        <div>
          <Panel title="Command Palette Demo">
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Try searching with partial matches like &quot;wrp&quot;, &quot;fir&quot;,
                &quot;shld&quot;, etc.
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-primary-600 rounded hover:bg-primary-500"
              >
                Open Palette (or press Cmd+K)
              </button>
              {lastCommand && (
                <div className="p-3 bg-success-900/20 border border-success-500 rounded">
                  Last executed: <strong>{lastCommand}</strong>
                </div>
              )}
            </div>
          </Panel>

          <CommandPalette
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            commands={commandsWithFeedback}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * With categories and recent commands
 */
export const WithCategories: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close"),
    commands: sampleCommands,
  },
};

/**
 * Empty state
 */
export const EmptyState: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close"),
    commands: [],
    placeholder: "No commands available...",
  },
};

/**
 * With disabled commands
 */
export const WithDisabledCommands: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close"),
    commands: sampleCommands.map((cmd, i) => ({
      ...cmd,
      enabled: i % 2 === 0, // Disable every other command
    })),
  },
};

/**
 * Using the useCommandPalette hook
 */
export const WithHook: StoryObj = {
  render: () => {
    const Demo = () => {
      const [log, setLog] = useState<string[]>([]);

      const commandsWithLogging = sampleCommands.map((cmd) => ({
        ...cmd,
        handler: () => {
          setLog((prev) => [...prev, `Executed: ${cmd.label}`]);
          cmd.handler();
        },
      }));

      const { palette, open, isOpen } = useCommandPalette(commandsWithLogging);

      return (
        <div className="space-y-4">
          <Panel title="Command Palette Hook Demo">
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                Press{" "}
                <kbd className="px-2 py-1 bg-background-800 border border-primary-700 rounded">
                  Cmd+K
                </kbd>{" "}
                to open the palette, or click the button below.
              </p>
              <button
                onClick={open}
                className="px-4 py-2 bg-primary-600 rounded hover:bg-primary-500"
              >
                Open Command Palette
              </button>
              <div className="text-sm">
                Palette is currently: <strong>{isOpen ? "Open" : "Closed"}</strong>
              </div>
            </div>
          </Panel>

          {log.length > 0 && (
            <Panel title="Execution Log" variant="muted">
              <div className="font-mono text-sm space-y-1">
                {log.map((entry, i) => (
                  <div key={i}>{entry}</div>
                ))}
              </div>
            </Panel>
          )}

          {palette}
        </div>
      );
    };
    return <Demo />;
  },
};
