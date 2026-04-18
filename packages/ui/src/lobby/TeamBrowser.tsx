/**
 * Team browser and creation component
 *
 * Displays available teams, faction information, and provides team creation interface.
 * Integrates with HYPERION API /v1/teams and /v1/factions endpoints.
 */

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { Panel, Stack, Modal } from "../layout";
import { Button, Badge } from "../components";
import { useAlert } from "../alerts";
import type { Player } from "./PlayerRegistration";

/**
 * Faction data from HYPERION API
 */
export interface Faction {
  id: string;
  name: string;
  description: string;
  traits?: string[];
}

/**
 * Team data from HYPERION API
 */
export interface Team {
  id: string;
  name: string;
  faction: string;
  members: string[];
  status?: "recruiting" | "active" | "in-mission" | "disbanded";
  /** Team's current credit balance */
  credits?: number;
}

/**
 * Team browser props
 */
export interface TeamBrowserProps {
  /** Base URL for HYPERION API */
  apiUrl: string;
  /** Current player (required for team operations) */
  currentPlayer?: Player;
  /** Callback when team is selected */
  onTeamSelected?: (team: Team) => void;
  /** Currently selected team (if any) */
  selectedTeam?: Team;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Team browser and creation component
 */
export function TeamBrowser({
  apiUrl,
  currentPlayer,
  onTeamSelected,
  selectedTeam,
  className = "",
}: TeamBrowserProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedFactionId, setSelectedFactionId] = useState("");
  const alert = useAlert();

  // Load teams and factions
  useEffect(() => {
    loadTeams();
    loadFactions();
  }, [apiUrl]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/teams`);
      if (!response.ok) {
        throw new Error(`Failed to load teams: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Server returned non-JSON response for /v1/teams");
        setTeams([]);
        return;
      }

      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.warn(
          "JSON parsing failed for /v1/teams - server may not have implemented this endpoint yet"
        );
        setTeams([]);
      } else {
        alert.danger("Load Failed", `Could not load teams: ${error}`);
        setTeams([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFactions = async () => {
    try {
      const response = await fetch(`${apiUrl}/v1/factions`);
      if (!response.ok) {
        throw new Error(`Failed to load factions: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Server returned non-JSON response for /v1/factions");
        setFactions([]);
        return;
      }

      const data = await response.json();
      const factionsArray = Array.isArray(data) ? data : [];
      setFactions(factionsArray);

      // Set default faction
      if (factionsArray.length > 0 && !selectedFactionId) {
        setSelectedFactionId(factionsArray[0].id);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.warn(
          "JSON parsing failed for /v1/factions - server may not have implemented this endpoint yet"
        );
        setFactions([]);
      } else {
        alert.warning("Load Failed", `Could not load factions: ${error}`);
        setFactions([]);
      }
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      alert.warning("Invalid Name", "Please enter a team name");
      return;
    }

    if (!selectedFactionId) {
      alert.warning("No Faction", "Please select a faction");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/v1/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeamName.trim(),
          faction: selectedFactionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create team: ${response.statusText}`);
      }

      const newTeam = await response.json();
      setTeams((prev) => [...prev, newTeam]);
      setNewTeamName("");
      setShowCreateModal(false);
      alert.success("Team Created", `${newTeam.name} has been created!`);

      if (onTeamSelected) {
        onTeamSelected(newTeam);
      }
    } catch (error) {
      alert.danger("Creation Failed", `Could not create team: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const selectTeam = (team: Team) => {
    if (onTeamSelected) {
      onTeamSelected(team);
    }
  };

  const getFactionById = (id: string): Faction | undefined => {
    return factions.find((f) => f.id === id);
  };

  return (
    <>
      <Panel title="Teams" className={className}>
        <Stack direction="column" gap={4}>
          {/* Selected team */}
          {selectedTeam && (
            <div className="p-3 bg-primary-900/20 border border-primary-600 rounded">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
                    Current Team
                  </div>
                  <div className="text-lg font-bold text-primary-400">{selectedTeam.name}</div>
                  {getFactionById(selectedTeam.faction) && (
                    <div className="text-sm text-text-secondary mt-1">
                      {getFactionById(selectedTeam.faction)!.name}
                    </div>
                  )}
                </div>
                <Badge variant="primary">{selectedTeam.members.length} members</Badge>
              </div>
            </div>
          )}

          {/* Team list */}
          {teams.length > 0 ? (
            <div>
              <div className="text-sm text-text-muted mb-2">Available Teams:</div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {teams.map((team) => {
                  const faction = getFactionById(team.faction);
                  const isSelected = selectedTeam?.id === team.id;

                  return (
                    <button
                      key={team.id}
                      onClick={() => selectTeam(team)}
                      disabled={loading}
                      className={clsx(
                        "w-full text-left p-3 rounded border transition-colors",
                        isSelected
                          ? "bg-primary-600 border-primary-500"
                          : "bg-background-800 border-primary-700 hover:bg-background-700",
                        loading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{team.name}</div>
                          {faction && (
                            <div className="text-xs text-text-muted mt-1">{faction.name}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge variant="info">{team.members.length}</Badge>
                          {currentPlayer?.team_id === team.id && (
                            <Badge variant="success">Joined</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              {loading ? "Loading teams..." : "No teams available. Create one to get started!"}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              disabled={loading}
              fullWidth
            >
              Create New Team
            </Button>
            <Button onClick={loadTeams} variant="ghost" size="sm" disabled={loading} fullWidth>
              {loading ? "Refreshing..." : "Refresh Team List"}
            </Button>
          </div>
        </Stack>
      </Panel>

      {/* Create team modal */}
      <Modal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Team"
        size="md"
      >
        <Stack direction="column" gap={4}>
          {/* Team name */}
          <div>
            <label className="block text-sm text-text-muted mb-2">Team Name:</label>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createTeam();
                }
              }}
              placeholder="Enter team name"
              maxLength={50}
              className="w-full bg-background-900 border border-primary-700 rounded px-4 py-2 text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
          </div>

          {/* Faction selection */}
          {factions.length > 0 && (
            <div>
              <label className="block text-sm text-text-muted mb-2">Faction:</label>
              <div className="space-y-2">
                {factions.map((faction) => (
                  <button
                    key={faction.id}
                    onClick={() => setSelectedFactionId(faction.id)}
                    disabled={loading}
                    className={clsx(
                      "w-full text-left p-3 rounded border transition-colors",
                      selectedFactionId === faction.id
                        ? "bg-primary-600 border-primary-500"
                        : "bg-background-800 border-primary-700 hover:bg-background-700",
                      loading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="font-medium">{faction.name}</div>
                    {faction.description && (
                      <div className="text-xs text-text-muted mt-1">{faction.description}</div>
                    )}
                    {faction.traits && faction.traits.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {faction.traits.map((trait) => (
                          <Badge key={trait} variant="info">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={createTeam}
              variant="primary"
              disabled={loading || !newTeamName.trim() || !selectedFactionId}
              fullWidth
            >
              {loading ? "Creating..." : "Create Team"}
            </Button>
            <Button
              onClick={() => {
                setShowCreateModal(false);
                setNewTeamName("");
              }}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </Stack>
      </Modal>
    </>
  );
}
