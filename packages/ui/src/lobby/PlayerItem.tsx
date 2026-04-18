import React from "react";
import { Button } from "../components";
import { Player } from "./playerTypes";
import { formatPlayerId, formatRelativeTime } from "./playerUtils";

export interface PlayerItemProps {
  player: Player;
  onSelect: (p: Player) => void;
}

export function PlayerItem({ player, onSelect }: PlayerItemProps) {
  return (
    <div
      key={player.id}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--frigate-space-3) var(--frigate-space-4)",
        borderBottom: "1px solid var(--frigate-border-base)",
        fontFamily: "var(--frigate-font-mono)",
        fontSize: "var(--frigate-font-small)",
        transition: "background-color var(--frigate-transition-state)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--frigate-bg-raised)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{ color: "var(--frigate-text-primary)", marginBottom: "var(--frigate-space-1)" }}
        >
          {formatPlayerId(player.id)} - {player.name}
        </div>
        <div style={{ color: "var(--frigate-text-muted)", fontSize: "var(--frigate-font-tiny)" }}>
          LAST ACTIVE: {formatRelativeTime(player.last_active_at)}
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={() => onSelect(player)}>
        [SELECT]
      </Button>
    </div>
  );
}

export default PlayerItem;
