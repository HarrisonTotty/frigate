import type { Meta, StoryObj } from "@storybook/react";
import { StatsGrid } from "../lobby/StatsGrid";

/**
 * Stats Grid Story
 *
 * Reusable grid component for displaying statistics in various layouts.
 * Used for ship statistics, module stats, and constraint displays.
 */
const meta: Meta<typeof StatsGrid> = {
  title: "Lobby/StatsGrid",
  component: StatsGrid,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
The Stats Grid is a flexible, reusable component for displaying pairs of labels and values.

## Features

- **Flexible Columns**: Configurable number of columns (default: 2)
- **Multiple Display Types**: Support for text, progress bars, and gauge displays
- **Responsive**: Adapts to container width
- **Theme Integration**: Uses theme tokens for colors and spacing
- **Accessibility**: Proper semantic HTML and ARIA labels
- **Monospace Typography**: Consistent with hard sci-fi aesthetic

## Display Types

1. **text**: Simple label-value pairs (default)
   - Formatted text with optional units
   - Good for discrete values

2. **progress**: Progress bar display
   - Shows percentage of max value
   - Color-coded based on usage (success/warning/danger)
   - Includes numeric indicator

3. **gauge**: Analog-style gauge display
   - Visual representation of value range
   - Alternative to progress bars
   - Useful for environmental readings

## Layout

Each item is rendered as a label-value pair:
- **Label**: Small, uppercase, secondary color
- **Value**: Large, bold, primary color with unit
- **Progress/Gauge**: Optional visualization below value

Default 2-column grid:
\`\`\`
┌─────────────┬─────────────┐
│   STAT A    │   STAT B    │
│   Value     │   Value     │
├─────────────┼─────────────┤
│   STAT C    │   STAT D    │
│   Value     │   Value     │
└─────────────┴─────────────┘
\`\`\`

## Usage

\`\`\`typescript
<StatsGrid
  items={[
    { label: 'COST', value: '1200', unit: 'BP' },
    { label: 'WEIGHT', value: '4500', unit: 'kg', max: 10000, current: 4500, type: 'progress' },
    { label: 'POWER', value: '85', unit: '%', max: 100, current: 85, type: 'progress' },
  ]}
  columns={2}
  gap={16}
/>
\`\`\`
`,
      },
    },
  },
  argTypes: {
    items: {
      control: false,
      description: "Array of stat items to display",
    },
    columns: {
      control: { type: "number", min: 1, max: 4 },
      description: "Number of columns in the grid (default: 2)",
    },
    gap: {
      control: { type: "number", min: 0, max: 32 },
      description: "Gap between grid items in pixels",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatsGrid>;

/**
 * Default two-column text stats grid
 */
export const Default: Story = {
  args: {
    items: [
      { label: "TOTAL COST", value: "1200", unit: "BP" },
      { label: "HULL HP", value: "500", unit: "PTS" },
      { label: "WEIGHT", value: "4500", unit: "kg" },
      { label: "CREW", value: "12", unit: "personnel" },
    ],
    columns: 2,
    gap: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Default two-column grid with text-based statistics.",
      },
    },
  },
};

/**
 * Mixed display types with progress bars
 */
export const WithProgress: Story = {
  args: {
    items: [
      {
        label: "BUILD POINTS",
        value: "1200",
        unit: "BP",
        max: 1500,
        current: 1200,
        type: "progress" as const,
      },
      {
        label: "POWER USAGE",
        value: "80",
        unit: "%",
        max: 100,
        current: 80,
        type: "progress" as const,
      },
      {
        label: "HEAT GENERATION",
        value: "65",
        unit: "%",
        max: 100,
        current: 65,
        type: "progress" as const,
      },
      {
        label: "WEIGHT",
        value: "4500",
        unit: "kg",
        max: 5000,
        current: 4500,
        type: "progress" as const,
      },
    ],
    columns: 2,
    gap: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Grid with progress bar indicators showing resource usage percentages.",
      },
    },
  },
};

/**
 * Single column layout
 */
export const SingleColumn: Story = {
  args: {
    items: [
      { label: "SHIP CLASS", value: "Sovereign-class Explorer" },
      { label: "TOTAL COST", value: "3500 BP" },
      { label: "TOTAL WEIGHT", value: "45,000 kg" },
      { label: "POWER GENERATION", value: "850 MW" },
      { label: "HEAT DISSIPATION", value: "500 kW" },
      { label: "MAX CREW", value: "500 personnel" },
    ],
    columns: 1,
    gap: 2,
  },
  parameters: {
    docs: {
      description: {
        story: "Single-column layout for detailed ship specifications.",
      },
    },
  },
};

/**
 * Four-column compact layout
 */
export const FourColumn: Story = {
  args: {
    items: [
      { label: "HP", value: "500" },
      { label: "PWR", value: "850" },
      { label: "HEAT", value: "450" },
      { label: "WEIGHT", value: "45k" },
      { label: "COST", value: "3500" },
      { label: "MODULES", value: "12" },
      { label: "CREW", value: "500" },
      { label: "STATUS", value: "ONLINE" },
    ],
    columns: 4,
    gap: 2,
  },
  parameters: {
    docs: {
      description: {
        story: "Four-column compact layout for dashboard-style displays.",
      },
    },
  },
};

/**
 * Constraint violation indicators
 */
export const ConstraintWarnings: Story = {
  args: {
    items: [
      {
        label: "BUILD POINTS",
        value: "1600",
        unit: "BP",
        max: 1500,
        current: 1600,
        type: "progress" as const,
      },
      {
        label: "POWER USAGE",
        value: "120",
        unit: "%",
        max: 100,
        current: 120,
        type: "progress" as const,
      },
      {
        label: "HEAT GENERATION",
        value: "95",
        unit: "%",
        max: 100,
        current: 95,
        type: "progress" as const,
      },
      {
        label: "WEIGHT",
        value: "5100",
        unit: "kg",
        max: 5000,
        current: 5100,
        type: "progress" as const,
      },
    ],
    columns: 2,
    gap: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows constraint violations with progress bars exceeding their limits (>100%).",
      },
    },
  },
};

/**
 * Module-level statistics
 */
export const ModuleStats: Story = {
  args: {
    items: [
      { label: "MODULE", value: "Mk II Fusion Core" },
      { label: "STATUS", value: "ONLINE" },
      { label: "POWER OUTPUT", value: "120", unit: "MW" },
      { label: "HEAT GENERATION", value: "45", unit: "kW" },
      { label: "WEIGHT", value: "850", unit: "kg" },
      {
        label: "EFFICIENCY",
        value: "92",
        unit: "%",
        max: 100,
        current: 92,
        type: "progress" as const,
      },
    ],
    columns: 2,
    gap: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Statistics for an individual module instance showing operational metrics.",
      },
    },
  },
};

/**
 * Compact status display
 */
export const CompactStatus: Story = {
  args: {
    items: [
      { label: "MODULES", value: "12" },
      { label: "STATUS", value: "ONLINE" },
      { label: "WARNINGS", value: "0" },
      { label: "ERRORS", value: "0" },
    ],
    columns: 4,
    gap: 2,
  },
  parameters: {
    docs: {
      description: {
        story: "Compact status indicators for system overview.",
      },
    },
  },
};

/**
 * Large stats grid with many items
 */
export const LargeGrid: Story = {
  args: {
    items: Array.from({ length: 12 }, (_, i) => ({
      label: `STAT ${String.fromCharCode(65 + i)}`,
      value: `${1000 + i * 100}`,
      unit: i % 3 === 0 ? "MW" : i % 3 === 1 ? "kg" : "%",
      ...(i % 2 === 0 && { max: 100, current: 50 + i * 5, type: "progress" as const }),
    })),
    columns: 3,
    gap: 3,
  },
  parameters: {
    docs: {
      description: {
        story: "Large grid with 12 items showing mixed text and progress bar displays.",
      },
    },
  },
};

/**
 * Custom large gap for spacious layout
 */
export const SpacedLayout: Story = {
  args: {
    items: [
      { label: "COST", value: "1200", unit: "BP" },
      {
        label: "WEIGHT",
        value: "4500",
        unit: "kg",
        max: 5000,
        current: 4500,
        type: "progress" as const,
      },
      { label: "POWER", value: "850", unit: "MW" },
      {
        label: "HEAT",
        value: "450",
        unit: "kW",
        max: 500,
        current: 450,
        type: "progress" as const,
      },
    ],
    columns: 2,
    gap: 6,
  },
  parameters: {
    docs: {
      description: {
        story: "Grid with larger gap between items for more spacious layout.",
      },
    },
  },
};
