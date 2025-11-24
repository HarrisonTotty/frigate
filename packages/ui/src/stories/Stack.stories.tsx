import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Stack, Panel, type StackProps } from '../layout';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const VerticalStack: Story = {
  args: {
    direction: 'column',
    gap: 4,
  },
  render: (args: StackProps) => (
    <Stack {...args}>
      <Panel title="Item 1">First item</Panel>
      <Panel title="Item 2">Second item</Panel>
      <Panel title="Item 3">Third item</Panel>
    </Stack>
  ),
};

export const HorizontalStack: Story = {
  args: {
    direction: 'row',
    gap: 4,
  },
  render: (args: StackProps) => (
    <Stack {...args}>
      <Panel title="Left">Left panel</Panel>
      <Panel title="Center">Center panel</Panel>
      <Panel title="Right">Right panel</Panel>
    </Stack>
  ),
};

export const CenteredContent: Story = {
  args: {
    direction: 'column',
    gap: 3,
    align: 'center',
    justify: 'center',
  },
  render: (args: StackProps) => (
    <div style={{ height: '400px' }}>
      <Stack {...args}>
        <h2 style={{ margin: 0, color: 'var(--frigate-text-primary)' }}>Centered Title</h2>
        <p style={{ margin: 0, color: 'var(--frigate-text-secondary)' }}>
          This stack centers its content both vertically and horizontally.
        </p>
      </Stack>
    </div>
  ),
};

export const SpaceBetween: Story = {
  args: {
    direction: 'row',
    justify: 'space-between',
    align: 'center',
  },
  render: (args: StackProps) => (
    <Stack {...args}>
      <span style={{ color: 'var(--frigate-text-primary)' }}>Left Content</span>
      <span style={{ color: 'var(--frigate-primary)' }}>Center Content</span>
      <span style={{ color: 'var(--frigate-text-primary)' }}>Right Content</span>
    </Stack>
  ),
};

export const ButtonGroup: Story = {
  args: {
    direction: 'row',
    gap: 2,
  },
  render: (args: StackProps) => (
    <Stack {...args}>
      <button
        style={{
          padding: 'var(--frigate-space-2) var(--frigate-space-4)',
          backgroundColor: 'var(--frigate-primary)',
          color: 'var(--frigate-text-primary)',
          border: 'none',
          borderRadius: 'var(--frigate-radius-md)',
          cursor: 'pointer',
        }}
      >
        Primary
      </button>
      <button
        style={{
          padding: 'var(--frigate-space-2) var(--frigate-space-4)',
          backgroundColor: 'transparent',
          color: 'var(--frigate-text-primary)',
          border: '1px solid var(--frigate-border-base)',
          borderRadius: 'var(--frigate-radius-md)',
          cursor: 'pointer',
        }}
      >
        Secondary
      </button>
      <button
        style={{
          padding: 'var(--frigate-space-2) var(--frigate-space-4)',
          backgroundColor: 'var(--frigate-danger)',
          color: 'var(--frigate-text-primary)',
          border: 'none',
          borderRadius: 'var(--frigate-radius-md)',
          cursor: 'pointer',
        }}
      >
        Danger
      </button>
    </Stack>
  ),
};
