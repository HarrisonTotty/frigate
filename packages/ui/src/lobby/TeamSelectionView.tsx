/**
 * Team selection view - Phase 4.5
 */

import React, { useState, useEffect } from 'react';
import { Panel, Stack } from '../layout';
import { Button } from '../components';
import TeamListItem from './TeamListItem';
import { LoadingText } from '../loading';
import { useAlert } from '../alerts';
import CreateTeamModal from './CreateTeamModal';
import { useLobbyWorkflowStore } from './lobbyWorkflowStore';
import TeamSelectionViewHeader from './TeamSelectionViewHeader';
import type { Player } from './PlayerSelectionView';
import type { Team } from './TeamBrowser';

export interface Faction {
  id: string;
  name: string;
}

export interface TeamSelectionViewProps {
  apiUrl: string;
  player: Player;
  onBack?: () => void;
  onDisconnect?: () => void;
  className?: string;
}

export function TeamSelectionView({
  apiUrl,
  player,
  onBack,
  onDisconnect,
  className = '',
}: TeamSelectionViewProps): React.ReactElement {
  const [teams, setTeams] = useState<Team[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedFactionId, setSelectedFactionId] = useState('');
  const [creating, setCreating] = useState(false);
  
  const alert = useAlert();
  const { setTeam, goBack } = useLobbyWorkflowStore();

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/v1/teams`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.teams) setTeams(data.teams);
        }
      } catch (error) {
        console.error('Failed to load teams:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, [apiUrl]);

  useEffect(() => {
    const loadFactions = async () => {
      try {
        const response = await fetch(`${apiUrl}/v1/factions`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.factions) {
            setFactions(data.factions);
            if (data.factions.length > 0) {
              setSelectedFactionId(data.factions[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load factions:', error);
      }
    };
    loadFactions();
  }, [apiUrl]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !selectedFactionId) return;

    // Validation: 3-32 characters
    if (newTeamName.length < 3 || newTeamName.length > 32) {
      alert.danger('Invalid Name', 'Team name must be 3-32 characters');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${apiUrl}/v1/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName,
          faction: selectedFactionId,
          player_id: player.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Team created successfully:', data);
        
        // The API returns the team object directly, not wrapped in { team: ... }
        if (data && data.id) {
          console.log('Setting team ID:', data.id);
          
          // Close modal first
          setShowCreateModal(false);
          setNewTeamName('');
          
          // Show success alert
          alert.success('Team Created', `Successfully created team ${newTeamName}`);
          
          // Advance to next step (this will unmount this component)
          console.log('Calling setTeam to advance workflow...');
          setTeam(data.id);
          console.log('setTeam called');
        } else {
          console.error('Team data missing in response:', data);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert.danger('Creation Failed', errorData.error || 'Failed to create team');
      }
    } catch (error) {
      console.error('Failed to create team:', error);
      alert.danger('Network Error', 'Failed to connect to server');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectTeam = (teamId: string) => {
    setTeam(teamId);
    alert.success('Team Selected', 'Successfully joined team');
  };

  const handleBack = () => {
    goBack();
    if (onBack) onBack();
  };

  return (
    <div className={className}>
      <TeamSelectionViewHeader player={player} onBack={handleBack} onDisconnect={onDisconnect} />

      <Panel title="TEAM SELECTION" fullHeight>
        <Stack gap={4}>
          {/* Status text (optional, for consistency) */}
          <div style={{
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {/* Could add a status or instructions here if desired */}
          </div>

          {/* Team list or loading/empty state */}
          {loading ? (
            <LoadingText message="LOADING TEAMS..." />
          ) : teams.length === 0 ? (
            <div style={{ padding: 'var(--frigate-space-8)', textAlign: 'center', color: 'var(--frigate-text-muted)', fontFamily: 'var(--frigate-font-mono)' }}>
              NO TEAMS AVAILABLE
            </div>
          ) : (
            <Stack gap={2}>
              {teams.map((team) => (
                <TeamListItem key={team.id} team={team} onJoin={handleSelectTeam} />
              ))}
            </Stack>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--frigate-space-3)', marginTop: 'auto' }}>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              style={{ flex: 1 }}
            >
              [CREATE NEW TEAM]
            </Button>
            <Button
              variant="secondary"
              onClick={handleBack}
            >
              [BACK]
            </Button>
          </div>
        </Stack>
      </Panel>

      {/* Create Team Modal (extracted) */}
      {showCreateModal && (
        <CreateTeamModal
          factions={factions}
          selectedFactionId={selectedFactionId}
          setSelectedFactionId={setSelectedFactionId}
          newTeamName={newTeamName}
          setNewTeamName={setNewTeamName}
          creating={creating}
          onCreate={handleCreateTeam}
          onCancel={() => {
            setShowCreateModal(false);
            setNewTeamName('');
          }}
        />
      )}
    </div>
  );
}
