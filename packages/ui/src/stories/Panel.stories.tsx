import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Panel } from "../layout";

const meta: Meta<typeof Panel> = {
  title: "Layout/Panel",
  component: Panel,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  args: {
    children: <p>Panel content goes here.</p>,
  },
};

export const WithTitle: Story = {
  args: {
    title: "Helm Controls",
    children: (
      <div>
        <p>Speed: 0.5c</p>
        <p>Course: 045°</p>
        <p>Altitude: 1000m</p>
      </div>
    ),
  },
};

export const Raised: Story = {
  args: {
    title: "Engineering",
    variant: "raised",
    children: <p>Raised panel variant with elevated background</p>,
  },
};

export const Muted: Story = {
  args: {
    title: "Status",
    variant: "muted",
    children: <p>Muted panel variant blends with background</p>,
  },
};

export const Scrollable: Story = {
  args: {
    title: "Long List",
    scrollable: true,
    children: (
      <div>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>Item {i + 1}</p>
        ))}
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ height: "300px" }}>
        <Story />
      </div>
    ),
  ],
};

export const FullHeight: Story = {
  args: {
    title: "Full Height Panel",
    fullHeight: true,
    children: <p>This panel stretches to fill its container height</p>,
  },
  decorators: [
    (Story) => (
      <div style={{ height: "400px" }}>
        <Story />
      </div>
    ),
  ],
};
