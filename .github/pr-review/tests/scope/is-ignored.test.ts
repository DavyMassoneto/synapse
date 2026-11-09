import { expect, test } from "vitest"
import { isIgnored } from "#synapse/scope"

test("excludes lock files from review scope", () => {
  expect(isIgnored("package-lock.json")).toBe(true)
})

test("includes source files in review scope", () => {
  expect(isIgnored("src/a.ts")).toBe(false)
})
