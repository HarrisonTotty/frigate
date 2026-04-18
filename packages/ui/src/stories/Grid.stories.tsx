import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Grid, Panel, type GridProps } from "../layout";

const meta: Meta<typeof Grid> = {
  title: "Layout/Grid",
  component: Grid,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Grid>;

export const TwoColumns: Story = {
  args: {
    cols: "1fr 1fr",
    gap: 4,
  },
  render: (args: GridProps) => (
    <Grid {...args}>
      <Panel title="Column 1">
        <p>First column content</p>
      </Panel>
      <Panel title="Column 2">
        <p>Second column content</p>
      </Panel>
    </Grid>
  ),
};

export const ThreeColumns: Story = {
  args: {
    cols: "repeat(3, 1fr)",
    gap: 4,
  },
  render: (args: GridProps) => (
    <Grid {...args}>
      <Panel title="Helm">
        <p>Helm controls</p>
      </Panel>
      <Panel title="Engineering">
        <p>Power management</p>
      </Panel>
      <Panel title="Weapons">
        <p>Weapon systems</p>
      </Panel>
    </Grid>
  ),
};

export const ResponsiveGrid: Story = {
  args: {
    cols: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 4,
    fullHeight: false,
  },
  render: (args: GridProps) => (
    <Grid {...args}>
      <Panel title="Station 1">Content</Panel>
      <Panel title="Station 2">Content</Panel>
      <Panel title="Station 3">Content</Panel>
      <Panel title="Station 4">Content</Panel>
    </Grid>
  ),
};

export const SidebarLayout: Story = {
  args: {
    cols: "250px 1fr",
    gap: 4,
    fullHeight: true,
  },
  render: (args: GridProps) => (
    <div style={{ height: "400px" }}>
      <Grid {...args}>
        <Panel title="Navigation" fullHeight scrollable>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>Helm</li>
            <li>Engineering</li>
            <li>Weapons</li>
            <li>Science</li>
            <li>Communications</li>
          </ul>
        </Panel>
        <Panel title="Main View" fullHeight>
          <p>Primary content area</p>
        </Panel>
      </Grid>
    </div>
  ),
};
