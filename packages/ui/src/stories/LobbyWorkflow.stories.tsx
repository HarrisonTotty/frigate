import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PlayerSelectionView } from "../lobby/PlayerSelectionView";
import { TeamSelectionView } from "../lobby/TeamSelectionView";
import { ShipSelectionView } from "../lobby/ShipSelectionView";
import { ShipDesignWorkspace } from "../lobby/ShipDesignWorkspace";
import { AlertProvider } from "../alerts";

/**
 * Lobby Workflow Components
 *
 * Sequential workflow for player onboarding:
 * Player Selection → Team Selection → Ship Selection → Ship Design
 */
const meta: Meta = {
  title: "Lobby/Workflow",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <AlertProvider>
        <Story />
      </AlertProvider>
    ),
  ],
};

export default meta;

// Mock API server
const MOCK_API_URL = "http://localhost:3000";

// Mock data
const mockPlayers = [
  {
    id: "p1",
    name: "Commander Sarah Chen",
    callsign: "PHEONIX",
    created_at: "2025-11-07T10:00:00Z",
    team_id: null,
  },
  {
    id: "p2",
    name: "Captain Marcus Blake",
    callsign: "VIPER",
    created_at: "2025-11-06T15:30:00Z",
    team_id: null,
  },
  {
    id: "p3",
    name: "Lieutenant Yuki Tanaka",
    callsign: "GHOST",
    created_at: "2025-11-05T08:45:00Z",
    team_id: null,
  },
];

const mockFactions = [
  { id: "terran", name: "Terran Federation", description: "United Earth government" },
  { id: "mars", name: "Mars Coalition", description: "Independent Martian colonies" },
  { id: "belters", name: "Belt Alliance", description: "Asteroid belt miners" },
  { id: "europa", name: "Europa Compact", description: "Jovian moon alliance" },
];

const mockTeams = [
  {
    id: "t1",
    name: "Crimson Raiders",
    faction: "Terran Federation",
    members: ["p1", "p5", "p8", "p12", "p15", "p18", "p22", "p28"],
    status: "recruiting" as const,
    credits: 500000,
  },
  {
    id: "t2",
    name: "Void Walkers",
    faction: "Belt Alliance",
    members: ["p2", "p9", "p14", "p19", "p25"],
    status: "active" as const,
    credits: 250000,
  },
  {
    id: "t3",
    name: "Iron Legion",
    faction: "Mars Coalition",
    members: ["p3", "p6", "p10", "p13", "p16", "p20", "p23", "p26", "p29", "p31", "p34", "p37"],
    status: "in-mission" as const,
    credits: 1000000,
  },
];

const mockBlueprints = [
  {
    id: "b1",
    name: "Thunderstrike",
    class: "destroyer" as const,
    team_id: "t1",
    crew_count: 3,
    max_crew: 8,
    build_points_used: 420,
    max_build_points: 600,
    is_validated: false,
    status: "designing" as const,
    created_at: "2025-11-07T14:00:00Z",
  },
  {
    id: "b2",
    name: "Swift Arrow",
    class: "frigate" as const,
    team_id: "t1",
    crew_count: 7,
    max_crew: 7,
    build_points_used: 500,
    max_build_points: 500,
    is_validated: true,
    status: "ready" as const,
    created_at: "2025-11-06T10:00:00Z",
  },
];

const mockModuleCatalog = [
  {
    id: "fusion-core-mk1",
    name: "Fusion Core Mk1",
    category: "power-cores" as const,
    build_points: 80,
    description: "Standard fusion reactor",
    specs: { power_output: "500MW", efficiency: "85%" },
  },
  {
    id: "fusion-core-mk2",
    name: "Fusion Core Mk2",
    category: "power-cores" as const,
    build_points: 120,
    description: "Advanced fusion reactor",
    specs: { power_output: "800MW", efficiency: "92%" },
  },
  {
    id: "impulse-drive-standard",
    name: "Standard Impulse Drive",
    category: "impulse-engines" as const,
    build_points: 60,
    description: "Basic sublight propulsion",
    specs: { max_thrust: "50kN", fuel_efficiency: "70%" },
  },
  {
    id: "railgun-mk1",
    name: "Railgun Mk1",
    category: "kinetic-weapons" as const,
    build_points: 100,
    description: "Electromagnetic projectile weapon",
    specs: { damage: "850", rate_of_fire: "2/sec", range: "15km" },
  },
];

/**
 * Player Selection View
 */
export const PlayerSelection: StoryObj = {
  render: () => {
    return (
      <div style={{ height: "100vh", backgroundColor: "var(--frigate-bg-primary)" }}>
        <PlayerSelectionView
          apiUrl={MOCK_API_URL}
          onDisconnect={() => console.log("Disconnect clicked")}
        />
      </div>
    );
  },
};

/**
 * Team Selection View
 */
export const TeamSelection: StoryObj = {
  render: () => {
    return (
      <div style={{ height: "100vh", backgroundColor: "var(--frigate-bg-primary)" }}>
        <TeamSelectionView
          apiUrl={MOCK_API_URL}
          player={mockPlayers[0]}
          onBack={() => console.log("Back clicked")}
          onDisconnect={() => console.log("Disconnect clicked")}
        />
      </div>
    );
  },
};

/**
 * Ship Selection View
 */
export const ShipSelection: StoryObj = {
  render: () => {
    return (
      <div style={{ height: "100vh", backgroundColor: "var(--frigate-bg-primary)" }}>
        <ShipSelectionView
          apiUrl={MOCK_API_URL}
          player={mockPlayers[0]}
          team={mockTeams[0]}
          onBack={() => console.log("Back clicked")}
          onDisconnect={() => console.log("Disconnect clicked")}
        />
      </div>
    );
  },
};

/**
 * Ship Design Workspace
 */
export const ShipDesign: StoryObj = {
  render: () => {
    return (
      <div style={{ height: "100vh", backgroundColor: "var(--frigate-bg-primary)" }}>
        <ShipDesignWorkspace
          apiUrl={MOCK_API_URL}
          player={mockPlayers[0]}
          team={mockTeams[0]}
          blueprintId="b1"
          onBack={() => console.log("Back clicked")}
          onDisconnect={() => console.log("Disconnect clicked")}
        />
      </div>
    );
  },
};

/**
 * Complete Workflow Simulation
 */
export const FullWorkflow: StoryObj = {
  render: () => {
    const Demo = () => {
      const [step, setStep] = useState<"player" | "team" | "ship" | "design">("player");
      const [selectedPlayer, setSelectedPlayer] = useState<unknown>(null);
      const [selectedTeam, setSelectedTeam] = useState<unknown>(null);

      return (
        <div style={{ height: "100vh", backgroundColor: "var(--frigate-bg-primary)" }}>
          {step === "player" && (
            <div>
              <div
                style={{
                  padding: "2rem",
                  fontFamily: "var(--frigate-font-mono)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                <p>Step 1/4: Select or create a player</p>
              </div>
              <div style={{ padding: "2rem" }}>
                {mockPlayers.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => {
                      setSelectedPlayer(player);
                      setStep("team");
                    }}
                    style={{
                      padding: "1rem",
                      marginBottom: "1rem",
                      border: "1px solid var(--frigate-border-light)",
                      cursor: "pointer",
                      fontFamily: "var(--frigate-font-mono)",
                      color: "var(--frigate-text-primary)",
                    }}
                  >
                    {player.name} [{player.callsign}]
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "team" && Boolean(selectedPlayer) && (
            <div>
              <div
                style={{
                  padding: "2rem",
                  fontFamily: "var(--frigate-font-mono)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                <p>Step 2/4: Select or create a team</p>
                <button onClick={() => setStep("player")}>← Back</button>
              </div>
              <div style={{ padding: "2rem" }}>
                {mockTeams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => {
                      setSelectedTeam(team);
                      setStep("ship");
                    }}
                    style={{
                      padding: "1rem",
                      marginBottom: "1rem",
                      border: "1px solid var(--frigate-border-light)",
                      cursor: "pointer",
                      fontFamily: "var(--frigate-font-mono)",
                      color: "var(--frigate-text-primary)",
                    }}
                  >
                    {team.name} - {team.faction}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "ship" && Boolean(selectedPlayer) && Boolean(selectedTeam) && (
            <div>
              <div
                style={{
                  padding: "2rem",
                  fontFamily: "var(--frigate-font-mono)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                <p>Step 3/4: Select or create a ship blueprint</p>
                <button onClick={() => setStep("team")}>← Back</button>
              </div>
              <div style={{ padding: "2rem" }}>
                {mockBlueprints.map((blueprint) => (
                  <div
                    key={blueprint.id}
                    onClick={() => setStep("design")}
                    style={{
                      padding: "1rem",
                      marginBottom: "1rem",
                      border: "1px solid var(--frigate-border-light)",
                      cursor: "pointer",
                      fontFamily: "var(--frigate-font-mono)",
                      color: "var(--frigate-text-primary)",
                    }}
                  >
                    {blueprint.name} - {blueprint.class.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "design" && (
            <div>
              <div
                style={{
                  padding: "2rem",
                  fontFamily: "var(--frigate-font-mono)",
                  color: "var(--frigate-text-secondary)",
                }}
              >
                <p>Step 4/4: Design your ship</p>
                <button onClick={() => setStep("ship")}>← Back</button>
              </div>
              <ShipDesignWorkspace
                apiUrl={MOCK_API_URL}
                player={selectedPlayer}
                team={selectedTeam as { credits?: number } & Record<string, unknown>}
                blueprintId="b1"
                onBack={() => setStep("ship")}
                onDisconnect={() => setStep("player")}
              />
            </div>
          )}
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * With Mock API Integration
 */
export const WithMockAPI: StoryObj = {
  render: () => {
    // Set up mock API responses
    if (typeof window !== "undefined") {
      // @ts-expect-error - Mock fetch for story
      window.fetch = async (url: string, options?: unknown) => {
        console.log("Mock API call:", url, options);

        if (url.includes("/v1/players")) {
          return {
            ok: true,
            json: async () => ({ players: mockPlayers }),
          };
        }

        if (url.includes("/v1/teams")) {
          return {
            ok: true,
            json: async () => ({ teams: mockTeams }),
          };
        }

        if (url.includes("/v1/factions")) {
          return {
            ok: true,
            json: async () => ({ factions: mockFactions }),
          };
        }

        if (url.includes("/v1/blueprints") && !url.includes("/modules")) {
          return {
            ok: true,
            json: async () => ({ blueprints: mockBlueprints }),
          };
        }

        if (url.includes("/v1/modules")) {
          return {
            ok: true,
            json: async () => ({ modules: mockModuleCatalog }),
          };
        }

        return {
          ok: false,
          json: async () => ({ error: "Not found" }),
        };
      };
    }

    return (
      <div style={{ height: "100vh", backgroundColor: "var(--frigate-bg-primary)" }}>
        <PlayerSelectionView
          apiUrl={MOCK_API_URL}
          onDisconnect={() => console.log("Disconnect clicked")}
        />
      </div>
    );
  },
};
