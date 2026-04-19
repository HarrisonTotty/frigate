/**
 * Storybook stories for TeamSelectionView component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { TeamSelectionView } from "../lobby/TeamSelectionView";
import { AlertProvider } from "../alerts";

const meta: Meta<typeof TeamSelectionView> = {
  title: "Lobby/TeamSelectionView",
  component: TeamSelectionView,
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
type Story = StoryObj<typeof TeamSelectionView>;

export const Default: Story = {
  args: {
    apiUrl: "http://localhost:8000",
    player: {
      id: "alice-7f3a-4b2c-8d1e-9f0a1b2c3d4e",
      name: "ALICE",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      team_id: null,
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
      team_id: null,
    },
    onBack: () => console.log("Back to player selection"),
    onDisconnect: () => console.log("Disconnect clicked"),
  },
};
