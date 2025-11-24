/**
 * Storybook stories for blueprint workflow components
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  BlueprintWorkflow,
  BlueprintList,
  RoleAssignment,
  BlueprintReadiness,
} from '../lobby';
import type { Blueprint } from '../lobby';
import { AlertProvider, AlertManager } from '../alerts';
import { Panel } from '../layout';

// Mock API URL
const MOCK_API_URL = 'http://localhost:8000';

const meta: Meta = {
  title: 'Lobby/Blueprint Workflow',
  decorators: [
    (Story) => (
      <AlertProvider>
        <div className="p-4">
          <Story />
        </div>
        <AlertManager />
      </AlertProvider>
    ),
  ],
};

export default meta;

/**
 * Blueprint list component
 */
export const BlueprintListDemo: StoryObj = {
  render: () => {
    const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | undefined>();
    const [currentPlayerId] = useState('player-123');

    return (
      <div className="max-w-md">
        <BlueprintList
          apiUrl={MOCK_API_URL}
          currentPlayerId={currentPlayerId}
          onBlueprintSelected={setSelectedBlueprint}
          selectedBlueprint={selectedBlueprint}
        />

        {selectedBlueprint && (
          <Panel title="Selection Event" variant="muted" className="mt-4">
            <pre className="text-xs">
              {JSON.stringify(selectedBlueprint, null, 2)}
            </pre>
          </Panel>
        )}
      </div>
    );
  },
};

/**
 * Role assignment component
 */
export const RoleAssignmentDemo: StoryObj = {
  render: () => {
    const [changes, setChanges] = useState(0);
    const [currentPlayerId] = useState('player-123');
    const [blueprint] = useState<Blueprint>({
      id: 'blueprint-456',
      name: 'USS Enterprise',
      class: 'battleship',
      faction: 'federation',
      crew: [
        { player_id: 'player-789', role: 'captain', ready: true },
        { player_id: 'player-123', role: 'helm', ready: false },
      ],
      modules: [],
    });

    return (
      <div className="max-w-md">
        <RoleAssignment
          apiUrl={MOCK_API_URL}
          currentPlayerId={currentPlayerId}
          blueprint={blueprint}
          onRolesChanged={() => setChanges((prev) => prev + 1)}
        />

        <Panel title="Role Changes" variant="muted" className="mt-4">
          <div className="text-sm">
            Roles changed <strong>{changes}</strong> times
          </div>
        </Panel>
      </div>
    );
  },
};

/**
 * Blueprint readiness component
 */
export const ReadinessDemo: StoryObj = {
  render: () => {
    const [changes, setChanges] = useState(0);
    const [currentPlayerId] = useState('player-123');
    const [blueprint] = useState<Blueprint>({
      id: 'blueprint-456',
      name: 'USS Enterprise',
      class: 'battleship',
      faction: 'federation',
      crew: [
        { player_id: 'player-789', role: 'captain', ready: true },
        { player_id: 'player-123', role: 'helm', ready: false },
        { player_id: 'player-456', role: 'engineering', ready: true },
      ],
      modules: [],
    });

    return (
      <div className="max-w-md">
        <BlueprintReadiness
          apiUrl={MOCK_API_URL}
          currentPlayerId={currentPlayerId}
          blueprint={blueprint}
          onReadinessChanged={() => setChanges((prev) => prev + 1)}
        />

        <Panel title="Readiness Changes" variant="muted" className="mt-4">
          <div className="text-sm">
            Readiness changed <strong>{changes}</strong> times
          </div>
        </Panel>
      </div>
    );
  },
};

/**
 * Complete blueprint workflow
 */
export const CompleteWorkflow: StoryObj = {
  render: () => {
    const [currentPlayerId] = useState('player-123');

    return (
      <div className="h-screen bg-background-900 p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-primary-400 mb-2">
            Ship Blueprint Design
          </h1>
          <p className="text-sm text-text-muted">
            Create or select a blueprint, join the crew, assign roles, and prepare for launch.
          </p>
        </div>

        <BlueprintWorkflow
          apiUrl={MOCK_API_URL}
          currentPlayerId={currentPlayerId}
          onLaunch={(blueprint) => {
            console.log('Launching with blueprint:', blueprint);
          }}
        />

        <div className="mt-4 p-3 bg-background-800 rounded border border-primary-700">
          <div className="text-xs text-text-muted">
            <strong>Note:</strong> This demo requires a running HYPERION server at{' '}
            <code className="px-1 py-0.5 bg-background-900 rounded">
              {MOCK_API_URL}
            </code>
            . The UI will show errors if the server is not available, but all interactions
            are functional.
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Workflow with mock data
 */
export const WorkflowWithMockData: StoryObj = {
  render: () => {
    const [currentPlayerId] = useState('player-123');

    return (
      <div className="h-screen bg-background-900 p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-primary-400 mb-2">
            Ship Blueprint Design (Mock Data)
          </h1>
          <p className="text-sm text-text-muted">
            Demonstration with simulated blueprint data
          </p>
        </div>

        <div className="space-y-4">
          <Panel title="Mock Data Info" variant="muted">
            <div className="text-sm space-y-2">
              <div>
                <strong>Blueprints:</strong> USS Enterprise (Battleship), Voyager (Cruiser)
              </div>
              <div>
                <strong>Ship Classes:</strong> Battleship, Cruiser, Destroyer, Frigate, Corvette, Scout, Carrier
              </div>
              <div>
                <strong>Roles:</strong> Captain, Helm, Engineering, Communications, Science, Weapons, Countermeasures
              </div>
            </div>
          </Panel>

          <BlueprintWorkflow
            apiUrl={MOCK_API_URL}
            currentPlayerId={currentPlayerId}
          />
        </div>
      </div>
    );
  },
};

/**
 * Responsive workflow layout
 */
export const ResponsiveWorkflow: StoryObj = {
  render: () => {
    const [currentPlayerId] = useState('player-123');

    return (
      <div className="min-h-screen bg-background-900 p-2 sm:p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-400 mb-2">
            Ship Blueprint Design
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Resize your browser to see responsive behavior
          </p>
        </div>

        <BlueprintWorkflow
          apiUrl={MOCK_API_URL}
          currentPlayerId={currentPlayerId}
        />
      </div>
    );
  },
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};

/**
 * All roles visualization
 */
export const AllRolesDisplay: StoryObj = {
  render: () => {
    const [currentPlayerId] = useState('player-123');
    const [blueprint] = useState<Blueprint>({
      id: 'blueprint-456',
      name: 'USS Enterprise',
      class: 'battleship',
      faction: 'federation',
      crew: [
        { player_id: 'player-001', role: 'captain', ready: true },
        { player_id: 'player-002', role: 'helm', ready: true },
        { player_id: 'player-003', role: 'engineering', ready: true },
        { player_id: 'player-004', role: 'comms', ready: false },
        { player_id: 'player-005', role: 'science', ready: false },
        { player_id: 'player-006', role: 'energy_weapons', ready: true },
        { player_id: 'player-007', role: 'kinetic_weapons', ready: false },
        { player_id: 'player-008', role: 'missile_weapons', ready: false },
        { player_id: 'player-009', role: 'countermeasures', ready: true },
      ],
      modules: [],
    });

    return (
      <div className="max-w-md">
        <RoleAssignment
          apiUrl={MOCK_API_URL}
          currentPlayerId={currentPlayerId}
          blueprint={blueprint}
        />
      </div>
    );
  },
};
