import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Modal } from "../layout";

const meta: Meta<typeof Modal> = {
  title: "Layout/Modal",
  component: Modal,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    visible: true,
    title: "Confirmation Required",
    children: <p>Are you sure you want to perform this action?</p>,
  },
};

export const Small: Story = {
  args: {
    visible: true,
    title: "Alert",
    size: "sm",
    children: <p>This is a small modal.</p>,
  },
};

export const Medium: Story = {
  args: {
    visible: true,
    title: "Medium Modal",
    size: "md",
    children: (
      <div>
        <p>This is the default medium size.</p>
        <p>It can contain more content.</p>
      </div>
    ),
  },
};

export const Large: Story = {
  args: {
    visible: true,
    title: "Large Modal",
    size: "lg",
    children: (
      <div>
        <p>This is a large modal for complex forms or data displays.</p>
        <form>
          <div style={{ marginBottom: "var(--frigate-space-4)" }}>
            <label
              htmlFor="input1"
              style={{ display: "block", marginBottom: "var(--frigate-space-2)" }}
            >
              Input Field 1
            </label>
            <input
              id="input1"
              type="text"
              style={{
                width: "100%",
                padding: "var(--frigate-space-2)",
                backgroundColor: "var(--frigate-bg-base)",
                border: "1px solid var(--frigate-border-base)",
                borderRadius: "var(--frigate-radius-sm)",
                color: "var(--frigate-text-primary)",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="input2"
              style={{ display: "block", marginBottom: "var(--frigate-space-2)" }}
            >
              Input Field 2
            </label>
            <textarea
              id="input2"
              rows={4}
              style={{
                width: "100%",
                padding: "var(--frigate-space-2)",
                backgroundColor: "var(--frigate-bg-base)",
                border: "1px solid var(--frigate-border-base)",
                borderRadius: "var(--frigate-radius-sm)",
                color: "var(--frigate-text-primary)",
                fontFamily: "inherit",
              }}
            />
          </div>
        </form>
      </div>
    ),
  },
};

export const WithCloseHandler: Story = {
  render: () => {
    const Demo = () => {
      const [visible, setVisible] = React.useState(true);
      return (
        <div>
          <button
            onClick={() => setVisible(true)}
            style={{
              padding: "var(--frigate-space-3) var(--frigate-space-4)",
              backgroundColor: "var(--frigate-primary)",
              color: "var(--frigate-text-primary)",
              border: "none",
              borderRadius: "var(--frigate-radius-md)",
              cursor: "pointer",
            }}
          >
            Open Modal
          </button>
          <Modal visible={visible} title="Interactive Modal" onClose={() => setVisible(false)}>
            <p>This modal can be closed by clicking the X button or the overlay.</p>
          </Modal>
        </div>
      );
    };
    return <Demo />;
  },
};
