import { defineConfig } from "vitest/config"

export default defineConfig({
  test: { include: [".github/pr-evaluator/**/*.test.ts"], environment: "node" },
})
