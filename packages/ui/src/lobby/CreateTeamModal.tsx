import React from "react";
import { Stack } from "../layout";
import { Button, Select } from "../components";
import type { Faction } from "./helpers";

interface CreateTeamModalProps {
  factions: Faction[];
  selectedFactionId: string;
  setSelectedFactionId: (id: string) => void;
  newTeamName: string;
  setNewTeamName: (v: string) => void;
  creating: boolean;
  onCreate: () => void;
  onCancel: () => void;
}

export function CreateTeamModal({
  factions,
  selectedFactionId,
  setSelectedFactionId,
  newTeamName,
  setNewTeamName,
  creating,
  onCreate,
  onCancel,
}: CreateTeamModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
          setNewTeamName("");
        }
      }}
    >
      <div
        style={{
          width: "500px",
          maxWidth: "90vw",
          border: "2px solid var(--frigate-primary)",
          borderRadius: 0,
          backgroundColor: "var(--frigate-bg-base)",
          boxShadow: "none",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "var(--frigate-space-4)",
            borderBottom: "2px solid var(--frigate-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--frigate-bg-surface)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-heading)",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--frigate-text-primary)",
            }}
          >
            CREATE NEW TEAM
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onCancel();
              setNewTeamName("");
            }}
          >
            [X]
          </Button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "var(--frigate-space-6)" }}>
          <Stack gap={4}>
            <div>
              <label
                htmlFor="team-name"
                style={{
                  display: "block",
                  marginBottom: "var(--frigate-space-2)",
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-small)",
                  color: "var(--frigate-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                TEAM NAME:
              </label>
              <input
                id="team-name"
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !creating) {
                    onCreate();
                  } else if (e.key === "Escape") {
                    onCancel();
                    setNewTeamName("");
                  }
                }}
                placeholder="ENTER TEAM NAME"
                disabled={creating}
                style={{
                  width: "100%",
                  padding: "var(--frigate-space-3)",
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-body)",
                  color: "var(--frigate-text-primary)",
                  backgroundColor: "var(--frigate-bg-surface)",
                  border: "1px solid var(--frigate-border-base)",
                  borderRadius: 0,
                  outline: "none",
                  textTransform: "uppercase",
                }}
                autoFocus
              />
              <div
                style={{
                  marginTop: "var(--frigate-space-2)",
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-muted)",
                }}
              >
                3-32 CHARACTERS
              </div>
            </div>

            <div>
              <label
                htmlFor="faction-select"
                style={{
                  display: "block",
                  marginBottom: "var(--frigate-space-2)",
                  fontFamily: "var(--frigate-font-mono)",
                  fontSize: "var(--frigate-font-small)",
                  color: "var(--frigate-text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                FACTION:
              </label>
              <Select
                id="faction-select"
                value={selectedFactionId}
                onChange={(e) => setSelectedFactionId(e.target.value)}
                disabled={creating || factions.length === 0}
                fullWidth
              >
                {factions.length === 0 ? (
                  <option>LOADING FACTIONS...</option>
                ) : (
                  factions.map((faction) => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name.toUpperCase()}
                    </option>
                  ))
                )}
              </Select>
            </div>

            <div
              style={{
                display: "flex",
                gap: "var(--frigate-space-3)",
                marginTop: "var(--frigate-space-4)",
              }}
            >
              <Button
                variant="primary"
                onClick={onCreate}
                disabled={creating || !newTeamName.trim() || !selectedFactionId}
                style={{ flex: 1 }}
              >
                {creating ? "[CREATING...]" : "[CREATE]"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  onCancel();
                }}
                disabled={creating}
              >
                [CANCEL]
              </Button>
            </div>
          </Stack>
        </div>
      </div>
    </div>
  );
}

export default CreateTeamModal;
