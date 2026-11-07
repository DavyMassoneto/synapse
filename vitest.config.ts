import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^#synapse\/(.*)\.js$/,
        replacement: fileURLToPath(new URL("./src/$1.ts", import.meta.url)),
      },
    ],
  },
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
  },
});
