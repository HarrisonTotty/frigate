import React from "react";
import { InlineLoading } from "../loading";
import PlayerItem from "./PlayerItem";
import type { Player } from "../types";

export interface PlayerListProps {
  players: Player[];
  loading: boolean;
  onSelect: (p: Player) => void;
}

export function PlayerList({ players, loading, onSelect }: PlayerListProps) {
  return (
    <InlineLoading loading={loading} loadingText="LOADING PERSONNEL FILES...">
      {players.length === 0 ? (
        <div
          style={{
            padding: "var(--frigate-space-8)",
            textAlign: "center",
            color: "var(--frigate-text-muted)",
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-small)",
          }}
        >
          NO EXISTING PERSONNEL FILES FOUND
        </div>
      ) : (
        <div style={{ border: "1px solid var(--frigate-border-base)", borderRadius: 0 }}>
          <div
            style={{
              padding: "var(--frigate-space-3) var(--frigate-space-4)",
              borderBottom: "1px solid var(--frigate-border-base)",
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              backgroundColor: "var(--frigate-bg-surface)",
            }}
          >
            EXISTING PERSONNEL FILES
          </div>

          {players.map((p) => (
            <PlayerItem key={p.id} player={p} onSelect={onSelect} />
          ))}
        </div>
      )}
    </InlineLoading>
  );
}

export default PlayerList;
