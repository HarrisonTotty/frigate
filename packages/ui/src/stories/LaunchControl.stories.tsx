import type { Meta, StoryObj } from '@storybook/react';
import { LaunchControl } from '../lobby/LaunchControl';
import type { Blueprint } from '../lobby/BlueprintList';
import { AlertProvider } from '../alerts';

const meta: Meta<typeof LaunchControl> = {
  title: 'Lobby/LaunchControl',
  component: LaunchControl,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <AlertProvider>
        <div style={{ width: '600px', maxWidth: '100vw' }}>
          <Story />
        </div>
      </AlertProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof LaunchControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockBlueprintReady: Blueprint = {
  id: 'bp-001',
  name: 'USS Enterprise',
  class: 'battleship',
  faction: 'federation',
  created_at: new Date().toISOString(),
  crew: [
    { player_id: 'p1', role: 'captain', ready: true },
    { player_id: 'p2', role: 'science', ready: true },
    { player_id: 'p3', role: 'engineering', ready: true },
    { player_id: 'p4', role: 'helm', ready: true },
  ],
  modules: []
};

const mockBlueprintPartialReady: Blueprint = {
  id: 'bp-002',
  name: 'USS Voyager',
  class: 'cruiser',
  faction: 'federation',
  created_at: new Date().toISOString(),
  crew: [
    { player_id: 'p1', role: 'captain', ready: true },
    { player_id: 'p2', role: 'helm', ready: true },
    { player_id: 'p3', role: 'engineering', ready: false },
    { player_id: 'p4', role: 'helm', ready: false },
  ],
  modules: []
};

const mockBlueprintWithIssues: Blueprint = {
  id: 'bp-003',
  name: 'Defiant',
  class: 'destroyer',
  faction: 'federation',
  created_at: new Date().toISOString(),
  crew: [
    { player_id: 'p1', role: 'captain', ready: true },
  ],
  modules: []
};

/**
 * No blueprint selected - shows empty state
 */
export const NoBlueprint: Story = {
  args: {
    blueprint: null,
    apiBaseUrl: 'http://localhost:8000',
    onLaunchSuccess: (shipId: string) => console.log('Launch success:', shipId),
    onCancel: () => console.log('Launch cancelled'),
  },
};

/**
 * Blueprint with all crew ready and valid - ready to launch
 */
export const ReadyToLaunch: Story = {
  args: {
    blueprint: mockBlueprintReady,
    apiBaseUrl: 'http://localhost:8000',
    onLaunchSuccess: (shipId: string) => console.log('Launch success:', shipId),
    onCancel: () => console.log('Launch cancelled'),
  },
};

/**
 * Blueprint with partial crew readiness - launch disabled
 */
export const PartialCrewReady: Story = {
  args: {
    blueprint: mockBlueprintPartialReady,
    apiBaseUrl: 'http://localhost:8000',
    onLaunchSuccess: (shipId: string) => console.log('Launch success:', shipId),
    onCancel: () => console.log('Launch cancelled'),
  },
};

/**
 * Blueprint with validation issues - shows critical errors
 */
export const ValidationIssues: Story = {
  args: {
    blueprint: mockBlueprintWithIssues,
    apiBaseUrl: 'http://localhost:8000',
    onLaunchSuccess: (shipId: string) => console.log('Launch success:', shipId),
    onCancel: () => console.log('Launch cancelled'),
  },
};

/**
 * Interactive demo with event handlers
 */
export const InteractiveDemo: Story = {
  args: {
    blueprint: mockBlueprintReady,
    apiBaseUrl: 'http://localhost:8000',
    onLaunchSuccess: (shipId: string) => {
      alert(`Ship compiled successfully!\n\nShip ID: ${shipId}\n\nRedirecting to bridge...`);
    },
    onCancel: () => {
      alert('Launch cancelled - returning to lobby');
    },
  },
};

/**
 * Shows compilation flow with progress indicator
 * Note: In real usage, API would be called. This demo simulates the UI states.
 */
export const CompilationFlow: Story = {
  args: {
    blueprint: mockBlueprintReady,
    apiBaseUrl: 'http://localhost:8000',
    onLaunchSuccess: (shipId: string) => console.log('Ship launched:', shipId),
    onCancel: () => console.log('Cancelled'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Click "Launch Ship" to see the compilation progress UI. The component shows validation, compilation, and initialization stages with progress feedback.',
      },
    },
  },
};
