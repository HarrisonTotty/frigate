/**
 * Storybook stories for ShipSelectionView component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { ShipSelectionView } from "../lobby/ShipSelectionView";
import { AlertProvider } from "../alerts";

const meta: Meta<typeof ShipSelectionView> = {
  title: "Lobby/ShipSelectionView",
  component: ShipSelectionView,
  decorators: [
    (Story) => (
      <AlertProvider>
        <div
          style={{
            height: "100vh",
            backgroundColor: "#0d0d0d",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Story />
        </div>
      </AlertProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ShipSelectionView>;

export const Default: Story = {
  args: {
    apiUrl: "http://localhost:8000",
    player: {
      id: "alice-7f3a-4b2c-8d1e-9f0a1b2c3d4e",
      name: "ALICE",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      team_id: "team-001",
    },
    team: {
      id: "team-001",
      name: "ALPHA SQUADRON",
      faction: "Federation",
      members: ["alice-7f3a-4b2c-8d1e-9f0a1b2c3d4e"],
      status: "active",
      credits: 0,
    },
  },
};

export const WithCallbacks: Story = {
  args: {
    apiUrl: "http://localhost:8000",
    player: {
      id: "bob-8e4b-5c3d-9e2f-0a1b2c3d4e5f",
      name: "BOB",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_active_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      team_id: "team-002",
    },
    team: {
      id: "team-002",
      name: "BETA FLEET",
      faction: "Klingon Empire",
      members: ["bob-8e4b-5c3d-9e2f-0a1b2c3d4e5f", "charlie-9f5c-6d4e-0f1a-2b3c4d5e6f7g"],
      status: "recruiting",
      credits: 0,
    },
    onBack: () => console.log("Back to team selection"),
    onDisconnect: () => console.log("Disconnect clicked"),
  },
};
