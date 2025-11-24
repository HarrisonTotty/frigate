import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DataGrid, type DataGridColumn } from '../data-grid';
import { Badge } from '../components';

interface CrewMember {
  id: string;
  name: string;
  station: string;
  status: 'ready' | 'busy' | 'offline';
  level: number;
}

const meta: Meta<typeof DataGrid<CrewMember>> = {
  title: 'Components/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataGrid<CrewMember>>;

const sampleData: CrewMember[] = [
  { id: '1', name: 'Commander Shepard', station: 'Captain', status: 'ready', level: 10 },
  { id: '2', name: 'Lt. Martinez', station: 'Helm', status: 'ready', level: 8 },
  { id: '3', name: 'Ens. Chen', station: 'Engineering', status: 'busy', level: 6 },
  { id: '4', name: 'Lt. Cmdr. Kim', station: 'Tactical', status: 'ready', level: 9 },
  { id: '5', name: 'Dr. Patel', station: 'Science', status: 'busy', level: 7 },
  { id: '6', name: 'Lt. Johnson', station: 'Communications', status: 'offline', level: 5 },
];

const columns: DataGridColumn<CrewMember>[] = [
  {
    id: 'name',
    label: 'Name',
    width: '200px',
    sortable: true,
    accessor: (row) => row.name,
  },
  {
    id: 'station',
    label: 'Station',
    width: '150px',
    sortable: true,
    accessor: (row) => row.station,
  },
  {
    id: 'status',
    label: 'Status',
    width: '100px',
    align: 'center',
    render: (row) => {
      const variantMap = {
        ready: 'success' as const,
        busy: 'warning' as const,
        offline: 'danger' as const,
      };
      return <Badge variant={variantMap[row.status]}>{row.status.toUpperCase()}</Badge>;
    },
  },
  {
    id: 'level',
    label: 'Level',
    width: '80px',
    align: 'right',
    sortable: true,
    accessor: (row) => row.level,
  },
];

export const Default: Story = {
  args: {
    columns,
    data: sampleData,
    getRowKey: (row) => row.id,
  },
};

export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Set<string | number>>(new Set());

    return (
      <div>
        <DataGrid
          columns={columns}
          data={sampleData}
          getRowKey={(row) => row.id}
          selectable
          selectedRows={selected}
          onRowSelect={setSelected}
        />
        <div style={{ marginTop: 'var(--frigate-space-4)', fontFamily: 'var(--frigate-font-mono)', fontSize: 'var(--frigate-font-small)', color: 'var(--frigate-text-secondary)' }}>
          Selected: {selected.size} crew member{selected.size !== 1 ? 's' : ''}
        </div>
      </div>
    );
  },
};

export const Clickable: Story = {
  render: () => {
    const [clicked, setClicked] = React.useState<string | null>(null);

    return (
      <div>
        <DataGrid
          columns={columns}
          data={sampleData}
          getRowKey={(row) => row.id}
          onRowClick={(row) => setClicked(row.name)}
        />
        {clicked && (
          <div style={{ marginTop: 'var(--frigate-space-4)', fontFamily: 'var(--frigate-font-mono)', fontSize: 'var(--frigate-font-small)', color: 'var(--frigate-primary)' }}>
            Clicked: {clicked}
          </div>
        )}
      </div>
    );
  },
};

export const Compact: Story = {
  args: {
    columns,
    data: sampleData,
    getRowKey: (row) => row.id,
    compact: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    getRowKey: (row) => row.id,
  },
};

// Telemetry data example
interface TelemetryReading {
  id: string;
  timestamp: string;
  system: string;
  value: number;
  unit: string;
}

const telemetryColumns: DataGridColumn<TelemetryReading>[] = [
  {
    id: 'timestamp',
    label: 'Time',
    width: '120px',
  },
  {
    id: 'system',
    label: 'System',
    width: '150px',
  },
  {
    id: 'value',
    label: 'Value',
    width: '100px',
    align: 'right',
    render: (row) => row.value.toFixed(2),
  },
  {
    id: 'unit',
    label: 'Unit',
    width: '80px',
  },
];

const telemetryData: TelemetryReading[] = [
  { id: '1', timestamp: '12:34:56', system: 'REACTOR', value: 98.5, unit: '%' },
  { id: '2', timestamp: '12:34:57', system: 'SHIELDS', value: 72.3, unit: '%' },
  { id: '3', timestamp: '12:34:58', system: 'IMPULSE', value: 0.5, unit: 'c' },
  { id: '4', timestamp: '12:34:59', system: 'SENSORS', value: 1000, unit: 'km' },
];

export const TelemetryDisplay: Story = {
  render: () => (
    <DataGrid
      columns={telemetryColumns}
      data={telemetryData}
      getRowKey={(row) => row.id}
      compact
    />
  ),
};
