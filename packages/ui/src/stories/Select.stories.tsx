import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Select } from '../components';
import { Stack } from '../layout';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    children: (
      <>
        <option value="">SELECT OPTION</option>
        <option value="1">OPTION ONE</option>
        <option value="2">OPTION TWO</option>
        <option value="3">OPTION THREE</option>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: (
      <>
        <option value="">SELECT OPTION</option>
        <option value="1">OPTION ONE</option>
        <option value="2">OPTION TWO</option>
        <option value="3">OPTION THREE</option>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '250px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: (
      <>
        <option value="">SELECT OPTION</option>
        <option value="1">OPTION ONE</option>
        <option value="2">OPTION TWO</option>
        <option value="3">OPTION THREE</option>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: (
      <>
        <option value="">SELECT OPTION</option>
        <option value="1">OPTION ONE</option>
        <option value="2">OPTION TWO</option>
        <option value="3">OPTION THREE</option>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <option value="">SELECT OPTION</option>
        <option value="1">OPTION ONE</option>
        <option value="2">OPTION TWO</option>
        <option value="3">OPTION THREE</option>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const FactionSelector: Story = {
  render: () => (
    <Stack direction="column" gap={3}>
      <div>
        <label
          htmlFor="faction-select"
          style={{
            display: 'block',
            marginBottom: 'var(--frigate-space-2)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          FACTION:
        </label>
        <Select id="faction-select" fullWidth>
          <option value="terran-federation">TERRAN FEDERATION</option>
          <option value="mars-coalition">MARS COALITION</option>
          <option value="belt-alliance">BELT ALLIANCE</option>
          <option value="europa-compact">EUROPA COMPACT</option>
          <option value="outer-rim-collective">OUTER RIM COLLECTIVE</option>
          <option value="corporate-syndicate">CORPORATE SYNDICATE</option>
        </Select>
      </div>
    </Stack>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ShipClassSelector: Story = {
  render: () => (
    <Stack direction="column" gap={3}>
      <div>
        <label
          htmlFor="ship-class-select"
          style={{
            display: 'block',
            marginBottom: 'var(--frigate-space-2)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          SHIP CLASS:
        </label>
        <Select id="ship-class-select" fullWidth>
          <option value="">SELECT SHIP CLASS</option>
          <option value="corvette">CORVETTE - LIGHT PATROL</option>
          <option value="frigate">FRIGATE - MULTI-ROLE</option>
          <option value="destroyer">DESTROYER - HEAVY ESCORT</option>
          <option value="cruiser">CRUISER - CAPITAL SHIP</option>
          <option value="battleship">BATTLESHIP - DREADNOUGHT</option>
        </Select>
      </div>
    </Stack>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const MultipleSelects: Story = {
  render: () => (
    <Stack direction="column" gap={4}>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--frigate-space-2)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-secondary)',
            textTransform: 'uppercase',
          }}
        >
          POWER ALLOCATION:
        </label>
        <Select size="sm" fullWidth>
          <option value="balanced">BALANCED</option>
          <option value="weapons">WEAPONS PRIORITY</option>
          <option value="shields">SHIELDS PRIORITY</option>
          <option value="engines">ENGINES PRIORITY</option>
        </Select>
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--frigate-space-2)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-secondary)',
            textTransform: 'uppercase',
          }}
        >
          ALERT STATUS:
        </label>
        <Select size="sm" fullWidth>
          <option value="green">GREEN - NORMAL OPS</option>
          <option value="yellow">YELLOW - CAUTION</option>
          <option value="red">RED - COMBAT</option>
        </Select>
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--frigate-space-2)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-secondary)',
            textTransform: 'uppercase',
          }}
        >
          SCANNER MODE:
        </label>
        <Select size="sm" fullWidth>
          <option value="passive">PASSIVE SCAN</option>
          <option value="active">ACTIVE SCAN</option>
          <option value="deep">DEEP SCAN</option>
          <option value="tactical">TACTICAL SWEEP</option>
        </Select>
      </div>
    </Stack>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
};
