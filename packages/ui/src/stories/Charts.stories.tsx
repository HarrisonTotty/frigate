import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { RadarChart, BarChart, LineChart, type RadarContact, type BarChartData } from '../charts';
import { Panel, Stack } from '../layout';

const RadarMeta: Meta<typeof RadarChart> = {
  title: 'Charts/RadarChart',
  component: RadarChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default RadarMeta;

const sampleContacts: RadarContact[] = [
  { id: '1', x: 0.3, y: 0.5, type: 'friendly', label: 'F-1' },
  { id: '2', x: -0.4, y: 0.2, type: 'friendly', label: 'F-2' },
  { id: '3', x: 0.6, y: -0.3, type: 'hostile', label: 'H-1' },
  { id: '4', x: -0.2, y: -0.6, type: 'hostile', label: 'H-2' },
  { id: '5', x: 0.8, y: 0.1, type: 'neutral', label: 'N-1' },
  { id: '6', x: -0.5, y: -0.4, type: 'unknown', label: '?' },
];

export const Default: StoryObj<typeof RadarChart> = {
  args: {
    contacts: sampleContacts,
    range: 1000,
    showRings: true,
    ringCount: 4,
    size: 300,
  },
};

export const LargeRadar: StoryObj<typeof RadarChart> = {
  args: {
    contacts: sampleContacts,
    range: 2000,
    showRings: true,
    ringCount: 5,
    size: 400,
  },
};

export const NoRings: StoryObj<typeof RadarChart> = {
  args: {
    contacts: sampleContacts,
    range: 1000,
    showRings: false,
    size: 300,
  },
};

export const Interactive: StoryObj<typeof RadarChart> = {
  render: () => {
    const [selected, setSelected] = React.useState<string | null>(null);

    return (
      <Stack direction="column" gap={4}>
        <RadarChart
          contacts={sampleContacts}
          range={1000}
          size={300}
          onContactClick={(contact) => setSelected(contact.id)}
        />
        {selected && (
          <div
            style={{
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-small)',
              color: 'var(--frigate-primary)',
            }}
          >
            Selected: {sampleContacts.find((c) => c.id === selected)?.label}
          </div>
        )}
      </Stack>
    );
  },
};

// BarChart Stories
const BarMeta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export { BarMeta };

const powerAllocationData: BarChartData[] = [
  { label: 'Shields', value: 30, color: 'var(--frigate-status-shields)' },
  { label: 'Weapons', value: 25, color: 'var(--frigate-status-weapons)' },
  { label: 'Engines', value: 20, color: 'var(--frigate-primary)' },
  { label: 'Life Support', value: 15, color: 'var(--frigate-success)' },
  { label: 'Sensors', value: 10, color: 'var(--frigate-info)' },
];

export const BarDefault: StoryObj<typeof BarChart> = {
  args: {
    data: powerAllocationData,
    showValues: true,
    height: 200,
  },
};

export const BarWithoutValues: StoryObj<typeof BarChart> = {
  args: {
    data: powerAllocationData,
    showValues: false,
    height: 200,
  },
};

export const BarTall: StoryObj<typeof BarChart> = {
  args: {
    data: powerAllocationData,
    showValues: true,
    height: 300,
  },
};

export const PowerAllocation: StoryObj<typeof BarChart> = {
  render: () => (
    <Panel title="Power Allocation">
      <BarChart data={powerAllocationData} showValues height={250} />
    </Panel>
  ),
};

// LineChart Stories
const LineMeta: Meta<typeof LineChart> = {
  title: 'Charts/LineChart',
  component: LineChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export { LineMeta };

const speedData = [0, 5, 12, 18, 25, 32, 38, 45, 50, 52, 50, 48, 45, 42, 40];

export const LineDefault: StoryObj<typeof LineChart> = {
  args: {
    data: speedData,
    height: 100,
    width: 300,
  },
};

export const LineWithPoints: StoryObj<typeof LineChart> = {
  args: {
    data: speedData,
    showPoints: true,
    height: 100,
    width: 300,
  },
};

export const LineFilled: StoryObj<typeof LineChart> = {
  args: {
    data: speedData,
    filled: true,
    height: 100,
    width: 300,
  },
};

export const LineSuccess: StoryObj<typeof LineChart> = {
  args: {
    data: speedData,
    color: 'var(--frigate-success)',
    filled: true,
    height: 100,
    width: 300,
  },
};

export const LineDanger: StoryObj<typeof LineChart> = {
  args: {
    data: speedData,
    color: 'var(--frigate-danger)',
    filled: true,
    showPoints: true,
    height: 100,
    width: 300,
  },
};

export const TelemetryDashboard: StoryObj = {
  render: () => {
    const speedHistory = [0, 5, 12, 18, 25, 32, 38, 45, 50, 52, 50, 48, 45, 42, 40];
    const powerHistory = [100, 98, 95, 92, 88, 85, 82, 80, 78, 76, 75, 74, 73, 72, 72];
    const hullHistory = [100, 100, 100, 98, 95, 92, 88, 85, 85, 85, 86, 87, 88, 89, 90];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--frigate-space-4)' }}>
        <Panel title="Speed History">
          <LineChart data={speedHistory} color="var(--frigate-primary)" filled height={120} width={400} />
        </Panel>
        <Panel title="Power Consumption">
          <LineChart data={powerHistory} color="var(--frigate-warning)" filled height={120} width={400} />
        </Panel>
        <Panel title="Hull Integrity">
          <LineChart data={hullHistory} color="var(--frigate-success)" filled height={120} width={400} />
        </Panel>
      </div>
    );
  },
};
