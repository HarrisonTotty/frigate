import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { InstalledModulesList } from "./InstalledModulesList";
import { ShipStatsPanel } from "./ShipStatsPanel";

const meta: Meta = {
  title: "Lobby/ShipDesignWorkspace",
};

export default meta;

export const EmptyInstalled: StoryObj = {
  render: () => <InstalledModulesList instances={[]} />,
};

export const ShipStatsExample: StoryObj = {
  render: () => (
    <ShipStatsPanel
      stats={{
        cost: 200,
        creditCost: 150000,
        creditBudget: 1000000,
        shipClassCost: 50000,
        weight: 500,
        weightMax: 800,
        hp: 1000,
        power: 1200,
        powerMax: 1000,
        heat: 50,
        heatMax: 400,
        buildPointsUsed: 20,
        buildPointsMax: 100,
        warnings: ["Overweight"],
      }}
    />
  ),
};
