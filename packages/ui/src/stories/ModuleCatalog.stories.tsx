import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ModuleCatalog } from '../modules/ModuleCatalog';

/**
 * Module Catalog Story
 * 
 * Dialog for selecting and configuring module variants within the Ship Design Workspace.
 * Players use this to choose specific implementations of module slots.
 */
const meta: Meta<typeof ModuleCatalog> = {
  title: 'Lobby/ModuleCatalog',
  component: ModuleCatalog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Module Catalog is a modal dialog that appears when editing a module instance.
It allows players to:

- **Browse Variants**: See all available variants for a specific module slot type
- **View Details**: Check specifications and descriptions for each variant
- **Compare Options**: See variant stats and features before selection
- **Select Variant**: Choose and apply a variant to their module instance

## Layout

**Two-column design:**

1. **Left Column - Variant List** (flexible, scrollable)
   - List of all variants for the selected slot type
   - Shows variant name and brief description
   - Highlights selected variant with primary color
   - Click or keyboard to select

2. **Right Column - Specifications** (320px fixed)
   - Full details for selected variant
   - Displays name, description, and stats
   - Shows technical specifications
   - [CLOSE] and [CONFIRM] action buttons

## Features

- **Keyboard Navigation**: Arrow up/down to browse, Enter to select, Escape to close
- **Dashed Borders**: Column separator uses dashed line for visual hierarchy
- **Real-time Preview**: Details update as you browse variants
- **Theme Integration**: Uses theme tokens for colors and spacing
- **Accessibility**: Full keyboard access and ARIA support

## Styling

Follows hard sci-fi design:
- Monospace typography (Roboto Mono)
- Uppercase labels: "MODULE VARIANT CATALOG", "SPECIFICATIONS"
- Dashed column separator
- Theme token colors and spacing
- Terminal-style layout (Panel component with ASCII borders)
`,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the catalog is visible',
    },
    slotType: {
      control: false,
      description: 'The module slot type being configured',
    },
    variants: {
      control: false,
      description: 'Array of available module variants',
    },
    selectedVariantId: {
      control: 'text',
      description: 'Currently selected variant ID',
    },
    onSelect: {
      action: 'variant selected',
      description: 'Callback when variant is selected',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when catalog is closed',
    },
  },
};

export default meta;

type Story = StoryObj<typeof ModuleCatalog>;

/**
 * Default catalog showing power core variants
 */
export const Default: Story = {
  args: {
    isOpen: true,
    slotType: { id: 'slot-1', name: 'Power Core' } as any,
    variants: [
      {
        id: 'core-1',
        name: 'Mk I Fusion Core',
        desc: 'Basic fusion-based power generation',
        description: 'A reliable entry-level power core suitable for small vessels',
      } as any,
      {
        id: 'core-2',
        name: 'Mk II Fusion Core',
        desc: 'Improved fusion core with higher output',
        description: 'Enhanced fusion design with 30% improved power output',
      } as any,
      {
        id: 'core-3',
        name: 'Quantum-State Reactor',
        desc: 'Advanced quantum-stabilized power source',
        description: 'Cutting-edge power generation using quantum state stabilization. 50% efficiency gain.',
      } as any,
    ],
    selectedVariantId: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a typical variant selection with three power core options.',
      },
    },
  },
};

/**
 * Catalog with a variant already selected
 */
export const WithSelection: Story = {
  args: {
    isOpen: true,
    slotType: { id: 'slot-1', name: 'Power Core' } as any,
    variants: [
      {
        id: 'core-1',
        name: 'Mk I Fusion Core',
        desc: 'Basic fusion-based power generation',
      } as any,
      {
        id: 'core-2',
        name: 'Mk II Fusion Core',
        desc: 'Improved fusion core with higher output',
      } as any,
      {
        id: 'core-3',
        name: 'Quantum-State Reactor',
        desc: 'Advanced quantum-stabilized power source',
      } as any,
    ],
    selectedVariantId: 'core-2',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows catalog with "Mk II Fusion Core" selected and highlighted in the list.',
      },
    },
  },
};

/**
 * Catalog with single variant
 */
export const SingleVariant: Story = {
  args: {
    isOpen: true,
    slotType: { id: 'slot-2', name: 'Navigation Suite' } as any,
    variants: [
      {
        id: 'nav-1',
        name: 'Standard Navigation Suite',
        desc: 'Complete navigation and helm controls',
        description: 'Includes FTL navigation, stellar cartography, and course plotting systems.',
      } as any,
    ],
    selectedVariantId: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows catalog with only one variant available for the selected slot type.',
      },
    },
  },
};

/**
 * Catalog with many variants
 */
export const ManyVariants: Story = {
  args: {
    isOpen: true,
    slotType: { id: 'slot-3', name: 'Weapon System' } as any,
    variants: Array.from({ length: 12 }, (_, i) => ({
      id: `weapon-${i + 1}`,
      name: `Weapon Variant ${String.fromCharCode(65 + i)}`,
      desc: `Weapon configuration type ${String.fromCharCode(65 + i)}`,
      description: `Technical specifications for variant ${String.fromCharCode(65 + i)}`,
    })) as any,
    selectedVariantId: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the catalog with many variants, showing scrollable list behavior.',
      },
    },
  },
};

/**
 * Empty catalog (loading or no variants)
 */
export const NoVariants: Story = {
  args: {
    isOpen: true,
    slotType: { id: 'slot-4', name: 'Unknown System' } as any,
    variants: [],
    selectedVariantId: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows catalog when no variants are available for the selected slot type.',
      },
    },
  },
};

/**
 * Catalog in loading state
 */
export const Loading: Story = {
  args: {
    isOpen: true,
    slotType: { id: 'slot-1', name: 'Power Core' } as any,
    variants: null, // null indicates loading
    selectedVariantId: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows catalog while variants are being loaded from the API.',
      },
    },
  },
};
