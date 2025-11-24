/**
 * Player registration and selection component
 * 
 * Allows players to register new accounts or select existing player profiles.
 * Integrates with HYPERION API /v1/players endpoints.
 */

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Panel, Stack } from '../layout';
import { Button } from '../components';
import { useAlert } from '../alerts';

/**
 * Player data from HYPERION API
 */
export interface Player {
  id: string;
  name: string;
  team_id?: string;
}

/**
 * Player registration props
 */
export interface PlayerRegistrationProps {
  /** Callback when a player is selected */
  onPlayerSelected: (player: Player) => void;
  /** Base URL for HYPERION API */
  apiUrl: string;
  /** Currently selected player (if any) */
  selectedPlayer?: Player;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Player registration and selection component
 */
export function PlayerRegistration({
  onPlayerSelected,
  apiUrl,
  selectedPlayer,
  className = '',
}: PlayerRegistrationProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const alert = useAlert();

  // Load existing players
  useEffect(() => {
    loadPlayers();
  }, [apiUrl]);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/players`);
      if (!response.ok) {
        throw new Error(`Failed to load players: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Server returned non-JSON response for /v1/players');
        setPlayers([]);
        return;
      }
      
      const data = await response.json();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.warn('JSON parsing failed for /v1/players - server may not have implemented this endpoint yet');
        setPlayers([]);
      } else {
        alert.danger('Load Failed', `Could not load players: ${error}`);
        setPlayers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const createPlayer = async () => {
    if (!newPlayerName.trim()) {
      alert.warning('Invalid Name', 'Please enter a player name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlayerName.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create player: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        alert.warning('Endpoint Not Implemented', 'Player registration endpoint not yet implemented on server');
        return;
      }

      const newPlayer = await response.json();
      setPlayers((prev) => [...prev, newPlayer]);
      setNewPlayerName('');
      setShowRegistration(false);
      alert.success('Player Created', `Welcome, ${newPlayer.name}!`);
      onPlayerSelected(newPlayer);
    } catch (error) {
      if (error instanceof SyntaxError) {
        alert.warning('Endpoint Not Implemented', 'Player registration endpoint not yet implemented on server');
      } else {
        alert.danger('Registration Failed', `Could not create player: ${error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectPlayer = (player: Player) => {
    onPlayerSelected(player);
    alert.info('Player Selected', `Playing as ${player.name}`);
  };

  if (loading && players.length === 0) {
    return (
      <Panel title="Player Selection" className={className}>
        <div className="text-center py-8 text-text-muted">
          Loading personnel roster...
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Player Selection" className={className}>
      <Stack direction="column" gap={4}>
        {/* Currently selected player */}
        {selectedPlayer && (
          <div className="p-3 bg-primary-900/20 border border-primary-600 rounded">
            <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
              Current Player
            </div>
            <div className="text-lg font-bold text-primary-400">
              {selectedPlayer.name}
            </div>
            {selectedPlayer.team_id && (
              <div className="text-sm text-text-secondary mt-1">
                Team: {selectedPlayer.team_id}
              </div>
            )}
          </div>
        )}

        {/* Existing players */}
        {players.length > 0 && !showRegistration && (
          <div>
            <div className="text-sm text-text-muted mb-2">Select Player:</div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => selectPlayer(player)}
                  disabled={loading}
                  className={clsx(
                    'w-full text-left p-3 rounded border transition-colors',
                    selectedPlayer?.id === player.id
                      ? 'bg-primary-600 border-primary-500'
                      : 'bg-background-800 border-primary-700 hover:bg-background-700',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="font-medium">{player.name}</div>
                  {player.team_id && (
                    <div className="text-xs text-text-muted mt-1">
                      Team: {player.team_id}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Registration form */}
        {showRegistration ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-text-muted mb-2">
                Name:
              </label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createPlayer();
                  }
                }}
                placeholder="Enter your name"
                maxLength={50}
                className="w-full bg-background-900 border border-primary-700 rounded px-4 py-2 text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createPlayer}
                variant="primary"
                disabled={loading || !newPlayerName.trim()}
                fullWidth
              >
                {loading ? 'Creating...' : 'Create Player'}
              </Button>
              <Button
                onClick={() => {
                  setShowRegistration(false);
                  setNewPlayerName('');
                }}
                variant="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowRegistration(true)}
            variant="secondary"
            disabled={loading}
            fullWidth
          >
            Register New Player
          </Button>
        )}

        {/* Refresh button */}
        <Button
          onClick={loadPlayers}
          variant="ghost"
          size="sm"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Refreshing...' : 'Refresh Player List'}
        </Button>
      </Stack>
    </Panel>
  );
}
