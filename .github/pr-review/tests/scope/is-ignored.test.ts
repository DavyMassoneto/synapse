import { expect, test } from "vitest"
import { isIgnored } from "#synapse/scope"

test("excludes lock files from review scope", () => {
  expect(isIgnored("package-lock.json")).toBe(true)
  expect(isIgnored("src/a.ts")).toBe(false)
})
