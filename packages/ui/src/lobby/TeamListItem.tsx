import React from "react";
import { Button, Badge } from "../components";
import type { Team } from "./TeamBrowser";
import { getStatusBadgeVariant } from "./helpers";

interface TeamListItemProps {
  team: Team;
  onJoin: (teamId: string) => void;
}

export function TeamListItem({ team, onJoin }: TeamListItemProps) {
  return (
    <div
      key={team.id}
      style={{
        backgroundColor: "var(--frigate-bg-surface)",
        border: "1px solid var(--frigate-border-base)",
        padding: "var(--frigate-space-3)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--frigate-space-2)",
            marginBottom: "var(--frigate-space-1)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-body)",
              color: "var(--frigate-text-primary)",
              fontWeight: 600,
            }}
          >
            {team.name}
          </span>
          {team.status && (
            <Badge variant={getStatusBadgeVariant(team.status)} size="sm">
              {team.status.toUpperCase().replace("-", " ")}
            </Badge>
          )}
        </div>
        <div
          style={{
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-small)",
            color: "var(--frigate-text-secondary)",
          }}
        >
          {team.faction.toUpperCase()} • {team.members?.length || 0}/8 MEMBERS
        </div>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={() => onJoin(team.id)}
        disabled={team.status === "in-mission" || team.status === "disbanded"}
      >
        [JOIN]
      </Button>
    </div>
  );
}

export default TeamListItem;
