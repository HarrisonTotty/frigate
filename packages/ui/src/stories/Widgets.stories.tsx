import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Badge, ProgressBar, Gauge } from '../components';
import { Stack } from '../layout';

const BadgeMeta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default BadgeMeta;
type BadgeStory = StoryObj<typeof Badge>;

export const Default: BadgeStory = {
  args: {
    variant: 'neutral',
    children: 'STATUS',
  },
};

export const Primary: BadgeStory = {
  args: {
    variant: 'primary',
    children: 'ONLINE',
  },
};

export const Success: BadgeStory = {
  args: {
    variant: 'success',
    children: 'READY',
  },
};

export const Warning: BadgeStory = {
  args: {
    variant: 'warning',
    children: 'CAUTION',
  },
};

export const Danger: BadgeStory = {
  args: {
    variant: 'danger',
    children: 'ALERT',
  },
};

export const Info: BadgeStory = {
  args: {
    variant: 'info',
    children: 'INFO',
  },
};

export const AllVariants: BadgeStory = {
  render: () => (
    <Stack direction="row" gap={2}>
      <Badge variant="neutral">NEUTRAL</Badge>
      <Badge variant="primary">PRIMARY</Badge>
      <Badge variant="success">SUCCESS</Badge>
      <Badge variant="warning">WARNING</Badge>
      <Badge variant="danger">DANGER</Badge>
      <Badge variant="info">INFO</Badge>
      <Badge variant="active">ACTIVE</Badge>
      <Badge variant="offline">OFFLINE</Badge>
      <Badge variant="standby">STANDBY</Badge>
    </Stack>
  ),
};

// ProgressBar Stories
const ProgressMeta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export { ProgressMeta };

export const ProgressDefault: StoryObj<typeof ProgressBar> = {
  args: {
    value: 65,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ProgressWithLabel: StoryObj<typeof ProgressBar> = {
  args: {
    value: 75,
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ProgressSuccess: StoryObj<typeof ProgressBar> = {
  args: {
    value: 100,
    variant: 'success',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ProgressWarning: StoryObj<typeof ProgressBar> = {
  args: {
    value: 50,
    variant: 'warning',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ProgressDanger: StoryObj<typeof ProgressBar> = {
  args: {
    value: 20,
    variant: 'danger',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ResourceBars: StoryObj<typeof ProgressBar> = {
  render: () => (
    <Stack direction="column" gap={3}>
      <div>
        <div style={{ marginBottom: 'var(--frigate-space-2)', color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-small)' }}>
          HULL INTEGRITY
        </div>
        <ProgressBar value={85} variant="success" showLabel />
      </div>
      <div>
        <div style={{ marginBottom: 'var(--frigate-space-2)', color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-small)' }}>
          SHIELD STRENGTH
        </div>
        <ProgressBar value={45} variant="primary" showLabel />
      </div>
      <div>
        <div style={{ marginBottom: 'var(--frigate-space-2)', color: 'var(--frigate-text-secondary)', fontSize: 'var(--frigate-font-small)' }}>
          POWER RESERVES
        </div>
        <ProgressBar value={62} variant="warning" showLabel />
      </div>
    </Stack>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

// Gauge Stories
const GaugeMeta: Meta<typeof Gauge> = {
  title: 'Components/Gauge',
  component: Gauge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export { GaugeMeta };

export const GaugeDefault: StoryObj<typeof Gauge> = {
  args: {
    label: 'Speed',
    value: '0.5',
    unit: 'c',
  },
};

export const GaugePrimary: StoryObj<typeof Gauge> = {
  args: {
    label: 'Heading',
    value: 45,
    unit: '°',
    variant: 'primary',
  },
};

export const GaugeSuccess: StoryObj<typeof Gauge> = {
  args: {
    label: 'Hull',
    value: 98,
    unit: '%',
    variant: 'success',
  },
};

export const GaugeWarning: StoryObj<typeof Gauge> = {
  args: {
    label: 'Temperature',
    value: 350,
    unit: 'K',
    variant: 'warning',
  },
};

export const GaugeDanger: StoryObj<typeof Gauge> = {
  args: {
    label: 'Radiation',
    value: 'HIGH',
    variant: 'danger',
  },
};

export const GaugePanel: StoryObj<typeof Gauge> = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--frigate-space-4)' }}>
      <Gauge label="Speed" value="0.5" unit="c" variant="primary" />
      <Gauge label="Heading" value={45} unit="°" />
      <Gauge label="Altitude" value={1250} unit="m" />
      <Gauge label="Hull" value={98} unit="%" variant="success" />
      <Gauge label="Shields" value={72} unit="%" variant="primary" />
      <Gauge label="Power" value={85} unit="%" variant="warning" />
    </div>
  ),
};
