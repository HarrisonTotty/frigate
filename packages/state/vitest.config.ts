import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

const config = {
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: [
      { find: "@frigate/utils", replacement: path.resolve(packageRoot, "../utils/src/index.ts") },
      {
        find: "@frigate/api-client",
        replacement: path.resolve(packageRoot, "../api-client/src/index.ts"),
      },
    ],
  },
} as const;

export default defineConfig(config as unknown as any);
