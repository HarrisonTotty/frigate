import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ModuleInstanceRow } from '../lobby/ModuleInstanceRow';

/**
 * Module Instance Row Story
 * 
 * Component for displaying an individual installed module instance in the Ship Design Workspace.
 * Shows module info, stats, and action buttons for editing or removing the module.
 */
const meta: Meta<typeof ModuleInstanceRow> = {
  title: 'Lobby/ModuleInstanceRow',
  component: ModuleInstanceRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Module Instance Row displays a single installed module in the Installed Modules List.

## Features

- **Module Information**: Displays slot type name and variant (or [UNCONFIGURED])
- **Instance Tracking**: Shows unique instance ID
- **Key Stats**: Displays power, heat, and weight inline
- **Action Buttons**: [EDIT] and [REMOVE] buttons for managing the module
- **Hover Effects**: Highlights row on hover with visual feedback
- **Keyboard Support**: Fully accessible via Tab and activation keys
- **Responsive**: Adapts to different container widths

## Row Layout

Three main sections:
1. **Left**: Slot name and variant info with ID (small, muted)
2. **Center**: Key stats (PWR: X, HEAT: X, WEIGHT: X)
3. **Right**: Action buttons ([EDIT] [REMOVE])

## States

- **Configured**: Shows variant name with normal styling
- **Unconfigured**: Shows [UNCONFIGURED] badge in warning color
- **Hover**: Highlighted background with increased contrast
- **Active**: Focused with keyboard navigation highlight

## Design

- Monospace typography for consistency
- Dashed border below each row
- Uses theme tokens for colors and spacing
- Follows hard sci-fi aesthetic with technical formatting
`,
      },
    },
  },
  argTypes: {
    instance: {
      control: false,
      description: 'The module instance data to display',
    },
    variantInfo: {
      control: false,
      description: 'Optional variant information for the installed module',
    },
    onEdit: {
      action: 'edit clicked',
      description: 'Callback when [EDIT] button is clicked',
    },
    onRemove: {
      action: 'remove clicked',
      description: 'Callback when [REMOVE] button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ModuleInstanceRow>;

/**
 * Module instance with configured variant
 */
export const Configured: Story = {
  args: {
    instance: {
      id: 'instance-1',
      slotId: 'slot-power-1',
      slotName: 'Power Core',
      variantId: 'core-mk2',
      stats: {
        power: 120,
        heat: 45,
        weight: 850,
      },
    } as any,
    variantInfo: {
      id: 'core-mk2',
      name: 'Mk II Fusion Core',
      description: 'Improved fusion power core with 30% output boost',
    },
    onEdit: () => console.log('Edit clicked'),
    onRemove: () => console.log('Remove clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a module instance that has been configured with a variant selection.',
      },
    },
  },
};

/**
 * Unconfigured module instance
 */
export const Unconfigured: Story = {
  args: {
    instance: {
      id: 'instance-2',
      slotId: 'slot-weapon-1',
      slotName: 'Weapon System',
      variantId: null,
      stats: {
        power: 0,
        heat: 0,
        weight: 0,
      },
    } as any,
    variantInfo: undefined,
    onEdit: () => console.log('Edit clicked'),
    onRemove: () => console.log('Remove clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a module instance that has not been configured yet, displaying [UNCONFIGURED] badge.',
      },
    },
  },
};

/**
 * High power consumption module
 */
export const HighPowerConsumption: Story = {
  args: {
    instance: {
      id: 'instance-3',
      slotId: 'slot-engine-1',
      slotName: 'Main Impulse Engine',
      variantId: 'engine-mk3',
      stats: {
        power: 450,
        heat: 280,
        weight: 3200,
      },
    } as any,
    variantInfo: {
      id: 'engine-mk3',
      name: 'Mk III Warp Drive',
      description: 'High-performance FTL engine system',
    },
    onEdit: () => console.log('Edit clicked'),
    onRemove: () => console.log('Remove clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a module with high power and heat consumption, representing a major system.',
      },
    },
  },
};

/**
 * Support system with minimal stats
 */
export const SupportSystem: Story = {
  args: {
    instance: {
      id: 'instance-4',
      slotId: 'slot-support-1',
      slotName: 'Auxiliary Support System',
      variantId: 'support-1',
      stats: {
        power: 15,
        heat: 8,
        weight: 120,
      },
    } as any,
    variantInfo: {
      id: 'support-1',
      name: 'Standard Repair Bay',
      description: 'Basic repair and maintenance facilities',
    },
    onEdit: () => console.log('Edit clicked'),
    onRemove: () => console.log('Remove clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a support system with minimal power/heat/weight requirements.',
      },
    },
  },
};

/**
 * Multiple instances to show list rendering
 */
export const MultipleInstances: Story = {
  args: {
    instance: {
      id: 'instance-5',
      slotId: 'slot-comms-1',
      slotName: 'Communication System',
      variantId: 'comms-advanced',
      stats: {
        power: 45,
        heat: 20,
        weight: 280,
      },
    } as any,
    variantInfo: {
      id: 'comms-advanced',
      name: 'Advanced Communications Array',
      description: 'Long-range communication and sensor suite',
    },
    onEdit: () => console.log('Edit clicked'),
    onRemove: () => console.log('Remove clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a communication system instance. Multiple of these rows would appear in a list.',
      },
    },
  },
};
