/**
 * Auto-Setup Hook
 *
 * Orchestrates automatic setup when CLI arguments are provided.
 * Handles: connect → find/create player → find/create team → find/create ship
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLobbyWorkflowStore, type Player, type Team } from "@frigate/ui";
import type { CliArgs, AutoSetupState, AutoSetupStep } from "../types/cli";

interface PlayersResponse {
  players: Player[];
}

interface TeamsResponse {
  teams: Team[];
}

interface Blueprint {
  id: string;
  name: string;
  ship_class: string;
  team_id: string;
}

interface BlueprintsResponse {
  blueprints: Blueprint[];
}

interface HealthResponse {
  status: string;
}

/** Hook options */
export interface UseAutoSetupOptions {
  /** Called when auto-setup successfully connects to a server */
  onConnect?: (serverUrl: string) => void;
  /** Called when auto-setup completes */
  onComplete?: () => void;
  /** Called when auto-setup encounters an error */
  onError?: (error: string) => void;
}

/** Hook return type */
export interface UseAutoSetupReturn {
  /** CLI arguments from Rust backend */
  cliArgs: CliArgs | null;
  /** Current auto-setup state */
  state: AutoSetupState;
  /** Whether auto-setup should run (has --connect arg) */
  hasAutoSetup: boolean;
  /** Run the auto-setup process */
  runAutoSetup: () => Promise<void>;
  /** Continue manually after error */
  continueManually: () => void;
  /** Server URL if connected */
  serverUrl: string | null;
}

const initialState: AutoSetupState = {
  step: "idle",
  error: null,
  progress: {
    connected: false,
    playerId: null,
    teamId: null,
    blueprintId: null,
  },
};

/**
 * Hook that orchestrates automatic setup from CLI arguments
 */
export function useAutoSetup(options: UseAutoSetupOptions = {}): UseAutoSetupReturn {
  const { onConnect, onComplete, onError } = options;

  const [cliArgs, setCliArgs] = useState<CliArgs | null>(null);
  const [state, setState] = useState<AutoSetupState>(initialState);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const hasRun = useRef(false);
  const isRunning = useRef(false);

  // Get workflow store actions
  const { setPlayer, setTeam, setBlueprint } = useLobbyWorkflowStore();

  // Fetch CLI args on mount
  useEffect(() => {
    const fetchCliArgs = async () => {
      try {
        const args = await invoke<CliArgs>("get_cli_args");
        console.log("[useAutoSetup] CLI args:", args);
        setCliArgs(args);
      } catch (error) {
        console.error("[useAutoSetup] Failed to get CLI args:", error);
        // Not in Tauri environment, that's OK
        setCliArgs({
          connect: null,
          user: null,
          team: null,
          faction: null,
          ship: null,
          ship_class: null,
        });
      }
    };

    fetchCliArgs();
  }, []);

  const hasAutoSetup = cliArgs?.connect != null;

  /** Update state helper */
  const updateState = useCallback((updates: Partial<AutoSetupState>) => {
    setState((prev: AutoSetupState) => ({
      ...prev,
      ...updates,
      progress: {
        ...prev.progress,
        ...(updates.progress || {}),
      },
    }));
  }, []);

  /** Set error state */
  const setError = useCallback(
    (error: string) => {
      updateState({ step: "error", error });
      onError?.(error);
    },
    [updateState, onError]
  );

  /** Update step */
  const setStep = useCallback(
    (step: AutoSetupStep) => {
      updateState({ step, error: null });
    },
    [updateState]
  );

  /** Fetch with error handling */
  const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    return response.json();
  };

  /** Health check with retry */
  const checkHealth = async (url: string, maxRetries = 3): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${url}/health`, {
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
          const data = (await response.json()) as HealthResponse;
          // Server returns "ok" not "healthy"
          return data.status === "ok" || data.status === "healthy";
        }
      } catch {
        // Retry on failure
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    return false;
  };

  /** Find or create player */
  const findOrCreatePlayer = async (url: string, userName: string): Promise<string> => {
    // Try to find existing player
    setStep("selecting-player");
    const playersResponse = await fetchJson<PlayersResponse>(`${url}/v1/players`);
    const existingPlayer = playersResponse.players.find(
      (p) => p.name.toLowerCase() === userName.toLowerCase()
    );

    if (existingPlayer) {
      console.log("[useAutoSetup] Found existing player:", existingPlayer.id);
      return existingPlayer.id;
    }

    // Create new player
    setStep("creating-player");
    console.log("[useAutoSetup] Creating new player:", userName);
    const newPlayer = await fetchJson<Player>(`${url}/v1/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: userName }),
    });

    return newPlayer.id;
  };

  /** Find or create team */
  const findOrCreateTeam = async (
    url: string,
    teamName: string,
    factionId: string | null,
    playerId: string
  ): Promise<string> => {
    // Try to find existing team
    setStep("selecting-team");
    const teamsResponse = await fetchJson<TeamsResponse>(`${url}/v1/teams`);
    const existingTeam = teamsResponse.teams.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase()
    );

    if (existingTeam) {
      console.log("[useAutoSetup] Found existing team:", existingTeam.id);

      // Add player to team if not already a member
      if (!existingTeam.members.includes(playerId)) {
        console.log("[useAutoSetup] Adding player to team");
        await fetchJson(`${url}/v1/teams/${existingTeam.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player_id: playerId }),
        });
      }

      return existingTeam.id;
    }

    // Need faction to create new team
    if (!factionId) {
      throw new Error(`Team '${teamName}' not found. Use --faction to create it.`);
    }

    // Create new team
    setStep("creating-team");
    console.log("[useAutoSetup] Creating new team:", teamName);
    const newTeam = await fetchJson<Team>(`${url}/v1/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName, faction: factionId }),
    });

    // Add player to new team
    await fetchJson(`${url}/v1/teams/${newTeam.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: playerId }),
    });

    return newTeam.id;
  };

  /** Find or create ship/blueprint */
  const findOrCreateShip = async (
    url: string,
    shipName: string,
    shipClass: string | null,
    teamId: string
  ): Promise<string> => {
    // Try to find existing blueprint for this team
    setStep("selecting-ship");
    const blueprintsResponse = await fetchJson<BlueprintsResponse>(`${url}/v1/blueprints`);
    // Filter by team_id client-side (API doesn't support team_id filtering)
    const existingBlueprint = blueprintsResponse.blueprints.find(
      (b) => b.name.toLowerCase() === shipName.toLowerCase() && b.team_id === teamId
    );

    if (existingBlueprint) {
      console.log("[useAutoSetup] Found existing ship:", existingBlueprint.id);
      return existingBlueprint.id;
    }

    // Need ship class to create new ship
    if (!shipClass) {
      throw new Error(`Ship '${shipName}' not found. Use --ship-class to create it.`);
    }

    // Create new blueprint
    setStep("creating-ship");
    console.log("[useAutoSetup] Creating new ship:", shipName);
    const newBlueprint = await fetchJson<Blueprint>(`${url}/v1/blueprints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: shipName,
        ship_class: shipClass,
        team_id: teamId,
      }),
    });

    return newBlueprint.id;
  };

  /** Run the auto-setup process */
  const runAutoSetup = useCallback(async () => {
    // Prevent duplicate runs (React Strict Mode double-mount protection)
    if (!cliArgs?.connect || hasRun.current || isRunning.current) {
      return;
    }

    isRunning.current = true;
    hasRun.current = true;
    const url = cliArgs.connect;

    try {
      // Step 1: Connect to server
      setStep("connecting");
      console.log("[useAutoSetup] Connecting to:", url);

      const isHealthy = await checkHealth(url);
      if (!isHealthy) {
        throw new Error(`Cannot connect to server at ${url}`);
      }

      setServerUrl(url);
      updateState({
        progress: { connected: true, playerId: null, teamId: null, blueprintId: null },
      });
      onConnect?.(url);
      console.log("[useAutoSetup] Connected successfully");

      // Step 2: Find/create player (if --user provided)
      let playerId: string | null = null;
      if (cliArgs.user) {
        playerId = await findOrCreatePlayer(url, cliArgs.user);
        updateState({ progress: { connected: true, playerId, teamId: null, blueprintId: null } });
        setPlayer(playerId);
        console.log("[useAutoSetup] Player ready:", playerId);
      }

      // Step 3: Find/create team (if --team provided)
      let teamId: string | null = null;
      if (cliArgs.team && playerId) {
        teamId = await findOrCreateTeam(url, cliArgs.team, cliArgs.faction, playerId);
        updateState({ progress: { connected: true, playerId, teamId, blueprintId: null } });
        setTeam(teamId);
        console.log("[useAutoSetup] Team ready:", teamId);
      }

      // Step 4: Find/create ship (if --ship provided)
      let blueprintId: string | null = null;
      if (cliArgs.ship && teamId) {
        blueprintId = await findOrCreateShip(url, cliArgs.ship, cliArgs.ship_class, teamId);
        updateState({ progress: { connected: true, playerId, teamId, blueprintId } });
        setBlueprint(blueprintId);
        console.log("[useAutoSetup] Ship ready:", blueprintId);
      }

      // Complete
      setStep("complete");
      onComplete?.();
      console.log("[useAutoSetup] Auto-setup complete");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[useAutoSetup] Error:", errorMessage);
      setError(errorMessage);
    }
  }, [
    cliArgs,
    onConnect,
    onComplete,
    setPlayer,
    setTeam,
    setBlueprint,
    setError,
    setStep,
    updateState,
  ]);

  /** Continue manually after error */
  const continueManually = useCallback(() => {
    setStep("complete");
  }, [setStep]);

  // Auto-run when CLI args are loaded
  useEffect(() => {
    if (cliArgs?.connect && !hasRun.current) {
      runAutoSetup();
    }
  }, [cliArgs, runAutoSetup]);

  return {
    cliArgs,
    state,
    hasAutoSetup,
    runAutoSetup,
    continueManually,
    serverUrl,
  };
}
