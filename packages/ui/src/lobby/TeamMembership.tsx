/**
 * Team membership management component
 * 
 * Allows players to join/leave teams and displays team roster with real-time updates.
 * Integrates with HYPERION API team membership endpoints.
 */

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Panel, Stack } from '../layout';
import { Button, Badge } from '../components';
import { useAlert } from '../alerts';
import { safeJsonParse } from './apiHelpers';
import type { Player } from './PlayerRegistration';
import type { Team } from './TeamBrowser';

/**
 * Team membership props
 */
export interface TeamMembershipProps {
  /** Base URL for HYPERION API */
  apiUrl: string;
  /** Current player */
  currentPlayer?: Player;
  /** Currently selected team */
  currentTeam?: Team;
  /** Callback when membership changes */
  onMembershipChanged?: () => void;
  /** Enable WebSocket updates */
  enableWebSocket?: boolean;
  /** Polling interval in ms (fallback when WebSocket not available) */
  pollingInterval?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Team membership management component
 */
export function TeamMembership({
  apiUrl,
  currentPlayer,
  currentTeam,
  onMembershipChanged,
  enableWebSocket = false,
  pollingInterval = 5000,
  className = '',
}: TeamMembershipProps) {
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const alert = useAlert();

  // Load team members and all players
  useEffect(() => {
    if (currentTeam) {
      setTeamMembers(currentTeam.members || []);
      loadAllPlayers();
    }
  }, [currentTeam?.id]);

  // Polling for updates (fallback)
  useEffect(() => {
    if (!enableWebSocket && currentTeam && pollingInterval > 0) {
      const interval = setInterval(() => {
        refreshTeamMembers();
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [currentTeam?.id, enableWebSocket, pollingInterval]);

  const loadAllPlayers = async () => {
    try {
      const response = await fetch(`${apiUrl}/v1/players`);
      if (!response.ok) {
        throw new Error(`Failed to load players: ${response.statusText}`);
      }
      const data = await safeJsonParse<Player[]>(response);
      setAllPlayers(data && Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load players:', error);
    }
  };

  const refreshTeamMembers = async () => {
    if (!currentTeam) return;

    try {
      const response = await fetch(`${apiUrl}/v1/teams/${currentTeam.id}`);
      if (!response.ok) {
        throw new Error(`Failed to refresh team: ${response.statusText}`);
      }
      const updatedTeam = await safeJsonParse<Team>(response);
      setTeamMembers(updatedTeam?.members || []);
    } catch (error) {
      console.error('Failed to refresh team members:', error);
    }
  };

  const joinTeam = async () => {
    if (!currentPlayer || !currentTeam) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/teams/${currentTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: currentPlayer.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to join team: ${response.statusText}`);
      }

      // Update local state
      setTeamMembers((prev) => [...prev, currentPlayer.id]);
      alert.success('Joined Team', `You have joined ${currentTeam.name}!`);

      if (onMembershipChanged) {
        onMembershipChanged();
      }
    } catch (error) {
      alert.danger('Join Failed', `Could not join team: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async () => {
    if (!currentPlayer || !currentTeam) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/v1/teams/${currentTeam.id}/players/${currentPlayer.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error(`Failed to leave team: ${response.statusText}`);
      }

      // Update local state
      setTeamMembers((prev) => prev.filter((id) => id !== currentPlayer.id));
      alert.info('Left Team', `You have left ${currentTeam.name}`);

      if (onMembershipChanged) {
        onMembershipChanged();
      }
    } catch (error) {
      alert.danger('Leave Failed', `Could not leave team: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerById = (id: string): Player | undefined => {
    return allPlayers.find((p) => p.id === id);
  };

  const isPlayerInTeam = currentPlayer && teamMembers.includes(currentPlayer.id);

  if (!currentTeam) {
    return (
      <Panel title="Team Membership" className={className}>
        <div className="text-center py-8 text-text-muted">
          Select a team to view membership
        </div>
      </Panel>
    );
  }

  if (!currentPlayer) {
    return (
      <Panel title="Team Membership" className={className}>
        <div className="text-center py-8 text-text-muted">
          Select a player to manage team membership
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Team Membership" className={className}>
      <Stack direction="column" gap={4}>
        {/* Team info */}
        <div className="p-3 bg-background-800 rounded border border-primary-700">
          <div className="text-sm text-text-muted mb-1">Team</div>
          <div className="text-lg font-bold">{currentTeam.name}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="primary">{teamMembers.length} members</Badge>
            {isPlayerInTeam && <Badge variant="success">You're in this team</Badge>}
          </div>
        </div>

        {/* Join/Leave button */}
        <div>
          {isPlayerInTeam ? (
            <Button
              onClick={leaveTeam}
              variant="danger"
              disabled={loading}
              fullWidth
            >
              {loading ? 'Leaving...' : 'Leave Team'}
            </Button>
          ) : (
            <Button
              onClick={joinTeam}
              variant="success"
              disabled={loading}
              fullWidth
            >
              {loading ? 'Joining...' : 'Join Team'}
            </Button>
          )}
        </div>

        {/* Team roster */}
        {teamMembers.length > 0 && (
          <div>
            <div className="text-sm text-text-muted mb-2">Team Roster:</div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamMembers.map((memberId) => {
                const player = getPlayerById(memberId);
                const isCurrent = memberId === currentPlayer.id;

                return (
                  <div
                    key={memberId}
                    className={clsx(
                      'p-3 rounded border flex items-center justify-between',
                      isCurrent
                        ? 'bg-primary-900/20 border-primary-600'
                        : 'bg-background-800 border-primary-700'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {player?.name || memberId}
                      </div>
                      <div className="text-xs text-text-muted">
                        ID: {memberId.substring(0, 8)}...
                      </div>
                    </div>
                    {isCurrent && (
                      <Badge variant="primary">You</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Refresh button (when not using WebSocket) */}
        {!enableWebSocket && (
          <Button
            onClick={refreshTeamMembers}
            variant="ghost"
            size="sm"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Refreshing...' : 'Refresh Roster'}
          </Button>
        )}

        {/* Status indicator */}
        <div className="text-xs text-text-muted text-center">
          {enableWebSocket ? (
            <span>🟢 Real-time updates enabled</span>
          ) : (
            <span>🔄 Polling every {pollingInterval / 1000}s</span>
          )}
        </div>
      </Stack>
    </Panel>
  );
}
