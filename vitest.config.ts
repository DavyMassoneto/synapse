import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^#synapse\/(.*)$/,
        replacement: fileURLToPath(new URL("./src/$1/index.ts", import.meta.url)),
      },
      {
        find: "#synapse-entry",
        replacement: fileURLToPath(new URL("./src/entry.ts", import.meta.url)),
      },
    ],
  },
  test: { include: ["src/**/*.test.ts", "tests/**/*.test.ts"], environment: "node" },
});
