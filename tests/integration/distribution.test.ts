import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { CASES, type ConfigCase, type OptionalText, runDistribution } from "../fixtures"

let home: OptionalText
let previousHome: OptionalText
let previousProfile: OptionalText

function prepare(): void {
  previousHome = process.env.HOME
  previousProfile = process.env.USERPROFILE
  home = mkdtempSync(join(tmpdir(), "synapse-config-"))
  mkdirSync(join(home, ".pi", "agent"), { recursive: true })
  process.env.HOME = home
  process.env.USERPROFILE = home
}

function cleanup(): void {
  try {
    if (previousHome === undefined) {
      delete process.env.HOME
    } else {
      process.env.HOME = previousHome
    }
    if (previousProfile === undefined) {
      delete process.env.USERPROFILE
    } else {
      process.env.USERPROFILE = previousProfile
    }
  } finally {
    if (home !== undefined) {
      rmSync(home, { recursive: true, force: true })
      home = undefined
    }
  }
}

async function verifyDistribution(example: ConfigCase): Promise<void> {
  if (home === undefined) {
    throw new Error("diretório de teste ausente")
  }
  const file = join(home, ".pi", "agent", "advisor.json")
  if (example.content !== undefined) {
    writeFileSync(file, example.content)
  }
  const result = await runDistribution(home)
  expect(result.notices.join("\n")).toMatch(example.expected)
  if (example.content === undefined) {
    expect(existsSync(file)).toBe(false)
  } else {
    expect(readFileSync(file, "utf8")).toBe(example.content)
  }
  if (example.invalid) {
    expect(result.lookups).toBe(0)
    expect(result.isError).toBe(true)
  }
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test.each(CASES)("distribuição: $name", verifyDistribution)
}

describe("distribution", registerTests)
