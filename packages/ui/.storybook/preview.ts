import type { Preview } from "@storybook/react";
import "../src/theme.css";
import "../src/animations.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "frigate-dark",
      values: [
        {
          name: "frigate-dark",
          value: "#0d0d0d",
        },
        {
          name: "frigate-surface",
          value: "#1a1a1a",
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: {
        base: "dark",
        colorPrimary: "#356b8f",
        colorSecondary: "#4d7ba8",

        // UI
        appBg: "#0d0d0d",
        appContentBg: "#1a1a1a",
        appBorderColor: "#2a2a2a",

        // Text
        textColor: "#d0d0d0",
        textInverseColor: "#0d0d0d",

        // Toolbar
        barTextColor: "#d0d0d0",
        barSelectedColor: "#356b8f",
        barBg: "#1a1a1a",

        // Form
        inputBg: "#0d0d0d",
        inputBorder: "#2a2a2a",
        inputTextColor: "#d0d0d0",

        // Fonts
        fontBase: '"Roboto Mono", "Courier New", monospace',
        fontCode: '"Roboto Mono", "Courier New", monospace',
      },
    },
  },
};

export default preview;
