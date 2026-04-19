/**
 * Lobby view component
 *
 * Main orchestrator for the pre-mission lobby experience, combining player registration,
 * team browsing, and team membership management.
 */

import React, { useState } from "react";
import { Grid } from "../layout";
import type { Player, Team } from "../types";
import { PlayerRegistration } from "./PlayerRegistration";
import { TeamBrowser } from "./TeamBrowser";
import { TeamMembership } from "./TeamMembership";

/**
 * Lobby view props
 */
export interface LobbyViewProps {
  /** Base URL for HYPERION API */
  apiUrl: string;
  /** Enable WebSocket for real-time updates */
  enableWebSocket?: boolean;
  /** Polling interval in ms (when WebSocket disabled) */
  pollingInterval?: number;
  /** Callback when player advances to next phase */
  onAdvance?: (player: Player, team: Team) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Lobby view component
 *
 * Provides a complete pre-mission lobby interface with player registration,
 * team management, and membership controls.
 */
export function LobbyView({
  apiUrl,
  enableWebSocket = false,
  pollingInterval = 5000,
  onAdvance: _onAdvance,
  className = "",
}: LobbyViewProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
  const [membershipKey, setMembershipKey] = useState(0);

  const handlePlayerSelected = (player: Player) => {
    setSelectedPlayer(player);
    // Reload team membership when player changes
    setMembershipKey((prev) => prev + 1);
  };

  const handleTeamSelected = (team: Team) => {
    setSelectedTeam(team);
    // Reload team membership when team changes
    setMembershipKey((prev) => prev + 1);
  };

  const handleMembershipChanged = () => {
    // Trigger refresh by incrementing key
    setMembershipKey((prev) => prev + 1);
  };

  return (
    <div className={className}>
      <Grid cols="1fr 1fr 1fr" gap={4} fullHeight>
        {/* Player registration */}
        <PlayerRegistration
          apiUrl={apiUrl}
          onPlayerSelected={handlePlayerSelected}
          selectedPlayer={selectedPlayer}
        />

        {/* Team browser */}
        <TeamBrowser
          apiUrl={apiUrl}
          currentPlayer={selectedPlayer}
          onTeamSelected={handleTeamSelected}
          selectedTeam={selectedTeam}
        />

        {/* Team membership */}
        <TeamMembership
          key={membershipKey}
          apiUrl={apiUrl}
          currentPlayer={selectedPlayer}
          currentTeam={selectedTeam}
          onMembershipChanged={handleMembershipChanged}
          enableWebSocket={enableWebSocket}
          pollingInterval={pollingInterval}
        />
      </Grid>
    </div>
  );
}
