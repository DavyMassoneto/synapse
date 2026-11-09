import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: { "#synapse": fileURLToPath(new URL(".github/pr-review", import.meta.url)) },
  },
  test: {
    include: [".github/pr-review/tests/**/*.test.ts"],
  },
})
