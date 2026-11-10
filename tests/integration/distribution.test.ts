import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { advisorConfigPath } from "#synapse/composition"
import { CASES, type ConfigCase, DistributionEnvironment, runDistribution } from "../fixtures"

let environment: DistributionEnvironment

function prepare(): void {
  environment = new DistributionEnvironment()
}

function cleanup(): void {
  environment.restore()
}

async function verifyDistribution(example: ConfigCase): Promise<void> {
  const file = advisorConfigPath()
  if (example.content) {
    writeFileSync(file, example.content)
  }
  const result = await runDistribution(environment.home)
  expect(result.notices.join("\n")).toMatch(example.expected)
  if (example.content) {
    expect(readFileSync(file, "utf8")).toBe(example.content)
  } else {
    expect(existsSync(file)).toBe(false)
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
