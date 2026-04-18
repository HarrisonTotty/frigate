import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Point tests at the package's built entry so transitive imports like
      // @frigate/utils resolve through the normal package resolution paths.
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "src/stories/",
        "**/*.stories.tsx",
        "**/*.config.ts",
      ],
    },
  },
});
