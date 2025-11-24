/**
 * Player selection and registration view
 * 
 * First step in the lobby workflow. Allows users to select an existing player
 * or create a new one via a centered modal dialog.
 */

import React, { useState, useEffect } from 'react';
import { Panel, Stack } from '../layout';
import { Button } from '../components';
import { InlineLoading } from '../loading';
import { useAlert } from '../alerts';
import { safeJsonParse } from './apiHelpers';
import { useLobbyWorkflowStore } from './lobbyWorkflowStore';
import type { Player } from './playerTypes';
import { formatPlayerId, formatRelativeTime } from './playerUtils';
import PlayerList from './PlayerList';
import CreatePlayerModal from './CreatePlayerModal';

// Re-export Player type for backwards compatibility with files that import
// Player from this module (older code expected `export interface Player` here).
export type { Player } from './playerTypes';


/**
 * Player selection view props
 */
export interface PlayerSelectionViewProps {
  /** Base URL for HYPERION API */
  apiUrl: string;
  /** Callback when user disconnects */
  onDisconnect?: () => void;
  /** Additional CSS class name */
  className?: string;
}


/**
 * Player selection view component
 */
export function PlayerSelectionView({
  apiUrl,
  onDisconnect,
  className = '',
}: PlayerSelectionViewProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [creating, setCreating] = useState(false);
  
  const alert = useAlert();
  const { setPlayer } = useLobbyWorkflowStore();

  // Load players on mount
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
      
      const data = await safeJsonParse<{ players: Player[]; count: number }>(response);
      if (data && data.players && Array.isArray(data.players)) {
        // Sort by last active (most recent first)
        const sorted = data.players.sort((a, b) => {
          const aTime = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
          const bTime = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
          return bTime - aTime;
        });
        setPlayers(sorted);
      } else {
        setPlayers([]);
      }
    } catch (error) {
      console.error('Failed to load players:', error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlayer = (player: Player) => {
    setPlayer(player.id);
    alert.success('Player Selected', `Playing as ${player.name}`);
  };

  const handleCreatePlayer = async () => {
    const trimmed = newPlayerName.trim();
    
    // Validation
    if (!trimmed) {
      alert.warning('Invalid Name', 'Player name cannot be empty');
      return;
    }
    
    if (trimmed.length < 3 || trimmed.length > 32) {
      alert.warning('Invalid Name', 'Player name must be 3-32 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      alert.warning('Invalid Name', 'Player name can only contain letters, numbers, and underscores');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${apiUrl}/v1/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create player: ${response.statusText}`);
      }

      const newPlayer = await safeJsonParse<Player>(response);
      if (!newPlayer) {
        throw new Error('Server returned invalid response');
      }

      // Add to list and select
      setPlayers((prev) => [newPlayer, ...prev]);
      setShowCreateModal(false);
      setNewPlayerName('');
      alert.success('Player Created', `Welcome, ${newPlayer.name}!`);
      setPlayer(newPlayer.id);
    } catch (error) {
      alert.danger('Creation Failed', `Could not create player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={className} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Panel title="PERSONNEL FILE REGISTRATION" fullHeight>
        <Stack gap={4}>
          <div style={{
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            
          </div>

          <PlayerList players={players} loading={loading} onSelect={handleSelectPlayer} />

          <div style={{ display: 'flex', gap: 'var(--frigate-space-3)', marginTop: 'auto' }}>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              style={{ flex: 1 }}
            >
              [REGISTER NEW PERSONNEL FILE]
            </Button>
            {onDisconnect && (
              <Button
                variant="secondary"
                onClick={onDisconnect}
              >
                [DISCONNECT]
              </Button>
            )}
          </div>
        </Stack>
      </Panel>

      <CreatePlayerModal
        visible={showCreateModal}
        name={newPlayerName}
        onChangeName={(v) => setNewPlayerName(v)}
        onCreate={handleCreatePlayer}
        onCancel={() => {
          setShowCreateModal(false);
          setNewPlayerName('');
        }}
        creating={creating}
      />
    </div>
  );
}
