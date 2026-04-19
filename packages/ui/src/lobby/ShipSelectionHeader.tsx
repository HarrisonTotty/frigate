import React from "react";
import { Button } from "../components";
import type { Player, Team } from "../types";
import { formatPlayerId } from "./playerUtils";

export interface ShipSelectionHeaderProps {
  player: Player;
  team: Team;
  onChangePlayer: () => void;
  onChangeTeam: () => void;
  onDisconnect?: () => void;
  className?: string;
}

export function ShipSelectionHeader({
  player,
  team,
  onChangePlayer,
  onChangeTeam,
  onDisconnect,
  className = "",
}: ShipSelectionHeaderProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "var(--frigate-bg-surface)",
        borderBottom: "1px solid var(--frigate-border-base)",
        padding: "var(--frigate-space-3) var(--frigate-space-4)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--frigate-space-3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--frigate-space-2)" }}>
            <span
              style={{
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-secondary)",
                textTransform: "uppercase",
              }}
            >
              PLAYER:
            </span>
            <span
              style={{
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-primary)",
                fontWeight: 600,
              }}
            >
              {player.name}_{formatPlayerId(player.id)}
            </span>
            <Button size="sm" variant="secondary" onClick={onChangePlayer}>
              [CHANGE]
            </Button>
          </div>

          <span style={{ color: "var(--frigate-text-muted)" }}>|</span>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--frigate-space-2)" }}>
            <span
              style={{
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-text-secondary)",
                textTransform: "uppercase",
              }}
            >
              TEAM:
            </span>
            <span
              style={{
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                color: "var(--frigate-primary)",
                fontWeight: 600,
              }}
            >
              {team.name}
            </span>
            <Button size="sm" variant="secondary" onClick={onChangeTeam}>
              [CHANGE]
            </Button>
          </div>
        </div>
        {onDisconnect && (
          <Button size="sm" variant="danger" onClick={onDisconnect}>
            [DISCONNECT]
          </Button>
        )}
      </div>
    </div>
  );
}

export default ShipSelectionHeader;
