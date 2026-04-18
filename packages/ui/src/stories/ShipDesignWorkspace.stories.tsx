import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ShipDesignWorkspace } from "../lobby/ShipDesignWorkspace";
import { AlertProvider } from "../alerts";

/**
 * Ship Design Workspace Story
 *
 * Demonstrates the complete Ship Blueprint Design Workspace with all three columns:
 * - Module Slot Browser (left)
 * - Installed Modules List (center)
 * - Ship Statistics Panel (right)
 *
 * This is the main interface for designing and customizing spaceships.
 */
const meta: Meta<typeof ShipDesignWorkspace> = {
  title: "Lobby/ShipDesignWorkspace",
  component: ShipDesignWorkspace,
  decorators: [
    (Story) => (
      <AlertProvider>
        <Story />
      </AlertProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The Ship Design Workspace is the central hub for blueprint design. Players can:

- **Browse Module Slots**: Search and filter available module types in the left column
- **Add Modules**: Click [ADD] to install new modules to their blueprint
- **Configure Modules**: Click [EDIT] to change module variants using the Module Catalog
- **Manage Instances**: Remove modules with [REMOVE] button in the center column
- **Track Resources**: Monitor Build Points, Power, Heat, and Weight constraints in real-time
- **View Statistics**: See aggregate ship statistics update as modules are added/removed

## Three-Column Layout

1. **Left Column - Module Slot Browser** (320px fixed)
   - Search and filter available module slots by category
   - Display cost, required/optional status, and max allowed count
   - [ADD] buttons to install modules to the blueprint
   - Build Points indicator showing usage (XX/YY)

2. **Center Column - Installed Modules List** (flexible)
   - Display all installed module instances
   - Show variant selection status ([UNCONFIGURED] or variant name)
   - Display key stats (PWR, HEAT, WEIGHT) for each module
   - [EDIT] and [REMOVE] action buttons
   - Dashed borders between rows for visual separation

3. **Right Column - Ship Statistics** (300px fixed)
   - Aggregate statistics grid (COST, WEIGHT, HP, PWR, HEAT, BP)
   - Progress bars for constrained resources
   - Warnings section for constraint violations
   - Real-time updates when modules change

## Features

- **Keyboard Navigation**: Tab between columns, ↑/↓ within lists, Enter to activate, Escape to close
- **Real-time Updates**: All stats update immediately when modules are added/removed
- **Constraint Tracking**: Visual progress bars and warning indicators for resources
- **Accessibility**: Full WCAG 2.1 AA compliance with ARIA labels and semantic HTML
- **Responsive Design**: Adapts to different screen sizes

## Design Philosophy

The workspace follows hard sci-fi design aesthetics:
- Monospace typography (Roboto Mono)
- Flat design with no rounded corners
- ASCII art borders and dashed separators
- Dense information layout prioritizing data
- Uppercase labels and technical terminology
- High contrast (light text on dark backgrounds)
- Theme token consistency for maintainability
`,
      },
    },
  },
  argTypes: {
    apiUrl: {
      control: "text",
      description: "Base URL for the API server",
      table: { category: "API" },
    },
    blueprintId: {
      control: "text",
      description: "Unique identifier for the blueprint being edited",
      table: { category: "API" },
    },
    className: {
      control: "text",
      description: "Optional CSS class name for the root element",
      table: { category: "Styling" },
    },
    player: {
      control: false,
      description: "Optional player context object",
      table: { category: "Context" },
    },
    team: {
      control: false,
      description: "Optional team context object",
      table: { category: "Context" },
    },
    onBack: {
      action: "back clicked",
      description: "Callback when user clicks [BACK] button",
      table: { category: "Callbacks" },
    },
    onDisconnect: {
      action: "disconnected",
      description: "Callback when connection is lost",
      table: { category: "Callbacks" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ShipDesignWorkspace>;

/**
 * Default workspace showing a typical blueprint with several modules
 */
export const Default: Story = {
  args: {
    apiUrl: "http://localhost:3000",
    blueprintId: "b1",
  },
  parameters: {
    docs: {
      description: {
        story:
          "A typical Ship Design Workspace showing a blueprint with multiple modules installed and configured.",
      },
    },
  },
};

/**
 * Workspace showing a blueprint with high Build Point usage
 */
export const HighBuildPointUsage: Story = {
  args: {
    apiUrl: "http://localhost:3000",
    blueprintId: "blueprint-high-bp",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the workspace when Build Points are nearly exhausted (80%+ usage). The progress bar shows warning color and [ADD] buttons are disabled.",
      },
    },
  },
};

/**
 * Workspace showing constraint violations
 */
export const ConstraintViolations: Story = {
  args: {
    apiUrl: "http://localhost:3000",
    blueprintId: "blueprint-overloaded",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a blueprint that exceeds one or more constraints (power, heat, weight, or build points). Warning and error indicators are displayed in the Ship Statistics panel.",
      },
    },
  },
};

/**
 * Empty blueprint with no modules installed
 */
export const EmptyBlueprint: Story = {
  args: {
    apiUrl: "http://localhost:3000",
    blueprintId: "blueprint-empty",
  },
  parameters: {
    docs: {
      description: {
        story:
          "A fresh blueprint with no modules installed. The center column shows empty state, and all slots in the browser are available for configuration.",
      },
    },
  },
};

/**
 * Demonstration of keyboard navigation capabilities
 */
export const KeyboardNavigation: Story = {
  args: {
    apiUrl: "http://localhost:3000",
    blueprintId: "blueprint-default",
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates keyboard navigation features available throughout the workspace:

- **Tab**: Move focus between interactive elements and columns
- **Shift+Tab**: Move focus backward
- **↑/↓ Arrow Keys**: Navigate within lists (Module Slots, Installed Modules)
- **Enter/Space**: Activate buttons and open selections
- **Escape**: Close modals, catalogs, and overlays

The footer displays keyboard shortcuts relevant to the current context.
Try using Tab to move focus through the three columns, then use Arrow keys within each column's list.
`,
      },
    },
  },
};

/**
 * Workspace with player and team context
 */
export const WithContext: Story = {
  args: {
    apiUrl: "http://localhost:3000",
    blueprintId: "blueprint-team-design",
    player: { id: "player-1", name: "Captain Anderson" },
    team: { id: "team-1", name: "Alpha Squadron" },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the workspace with player and team context, which may enable multiplayer features or team-based restrictions.",
      },
    },
  },
};

/**
 * Mobile/responsive layout demonstration
 */
export const ResponsiveLayout: Story = {
  args: {
    apiUrl: "http://localhost:3000",
    blueprintId: "blueprint-default",
  },
  parameters: {
    viewport: {
      defaultViewport: "ipad",
    },
    docs: {
      description: {
        story:
          "Demonstrates how the three-column layout adapts to tablet/mobile screen sizes. The columns may be reordered or stacked based on viewport width.",
      },
    },
  },
};
