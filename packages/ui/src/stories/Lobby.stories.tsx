/**
 * Storybook stories for lobby components
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { LobbyView, PlayerRegistration, TeamBrowser, TeamMembership } from '../lobby';
import type { Player, Team } from '../lobby';
import { AlertProvider, AlertManager } from '../alerts';
import { Panel } from '../layout';

// Mock API URL
const MOCK_API_URL = 'http://localhost:8000';

const meta: Meta = {
  title: 'Lobby/Lobby Components',
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
 * Player Registration component
 */
export const PlayerRegistrationDemo: StoryObj = {
  render: () => {
    const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();

    return (
      <div className="max-w-md">
        <PlayerRegistration
          apiUrl={MOCK_API_URL}
          onPlayerSelected={setSelectedPlayer}
          selectedPlayer={selectedPlayer}
        />

        {selectedPlayer && (
          <Panel title="Selection Event" variant="muted" className="mt-4">
            <pre className="text-xs">
              {JSON.stringify(selectedPlayer, null, 2)}
            </pre>
          </Panel>
        )}
      </div>
    );
  },
};

/**
 * Team Browser component
 */
export const TeamBrowserDemo: StoryObj = {
  render: () => {
    const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
    const [currentPlayer] = useState<Player>({
      id: 'player-123',
      name: 'Test Player',
    });

    return (
      <div className="max-w-md">
        <TeamBrowser
          apiUrl={MOCK_API_URL}
          currentPlayer={currentPlayer}
          onTeamSelected={setSelectedTeam}
          selectedTeam={selectedTeam}
        />

        {selectedTeam && (
          <Panel title="Selection Event" variant="muted" className="mt-4">
            <pre className="text-xs">
              {JSON.stringify(selectedTeam, null, 2)}
            </pre>
          </Panel>
        )}
      </div>
    );
  },
};

/**
 * Team Membership component
 */
export const TeamMembershipDemo: StoryObj = {
  render: () => {
    const [membershipChanges, setMembershipChanges] = useState<number>(0);
    const [currentPlayer] = useState<Player>({
      id: 'player-123',
      name: 'Test Player',
    });
    const [currentTeam] = useState<Team>({
      id: 'team-456',
      name: 'Alpha Squad',
      faction: 'federation',
      members: ['player-123', 'player-789'],
    });

    return (
      <div className="max-w-md">
        <TeamMembership
          apiUrl={MOCK_API_URL}
          currentPlayer={currentPlayer}
          currentTeam={currentTeam}
          onMembershipChanged={() => setMembershipChanges((prev) => prev + 1)}
          pollingInterval={5000}
        />

        <Panel title="Membership Changes" variant="muted" className="mt-4">
          <div className="text-sm">
            Membership changed <strong>{membershipChanges}</strong> times
          </div>
        </Panel>
      </div>
    );
  },
};

/**
 * Complete lobby view
 */
export const CompleteLobby: StoryObj = {
  render: () => {
    return (
      <div className="h-screen bg-background-900 p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-primary-400 mb-2">
            HYPERION Mission Lobby
          </h1>
          <p className="text-sm text-text-muted">
            Register or select your player, create or join a team, and prepare for deployment.
          </p>
        </div>

        <LobbyView
          apiUrl={MOCK_API_URL}
          enableWebSocket={false}
          pollingInterval={5000}
          onAdvance={(player, team) => {
            console.log('Advancing with player:', player, 'and team:', team);
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
 * Lobby with simulated data
 */
export const LobbyWithMockData: StoryObj = {
  render: () => {
    return (
      <div className="h-screen bg-background-900 p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-primary-400 mb-2">
            HYPERION Mission Lobby (Mock Data)
          </h1>
          <p className="text-sm text-text-muted">
            Demonstration with simulated player and team data
          </p>
        </div>

        <div className="space-y-4">
          <Panel title="Mock Data Info" variant="muted">
            <div className="text-sm space-y-2">
              <div>
                <strong>Players:</strong> Alice, Bob, Charlie
              </div>
              <div>
                <strong>Teams:</strong> Alpha Squad (Federation), Beta Company (Alliance)
              </div>
              <div>
                <strong>Factions:</strong> Federation, Alliance, Independent
              </div>
            </div>
          </Panel>

          <LobbyView
            apiUrl={MOCK_API_URL}
            enableWebSocket={false}
            pollingInterval={10000}
          />
        </div>
      </div>
    );
  },
};

/**
 * Responsive lobby layout
 */
export const ResponsiveLobby: StoryObj = {
  render: () => {
    return (
      <div className="min-h-screen bg-background-900 p-2 sm:p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-400 mb-2">
            HYPERION Mission Lobby
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Resize your browser to see responsive behavior
          </p>
        </div>

        <LobbyView
          apiUrl={MOCK_API_URL}
          enableWebSocket={false}
          pollingInterval={5000}
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
