import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { advisorConfigPath } from "#synapse/integration"
import { CASES, type ConfigCase, DistributionEnvironment, runDistribution } from "../fixtures"

let environment: DistributionEnvironment

function prepare(): void {
  environment = new DistributionEnvironment()
}

async function verifyDistribution(example: ConfigCase): Promise<void> {
  const file = advisorConfigPath()
  if (example.content) {
    writeFileSync(file, example.content)
  }
  const result = await runDistribution(environment)
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

function restoresSetVariable(value: string): void {
  process.env.USERPROFILE = value
  const nested = new DistributionEnvironment()
  expect(process.env.USERPROFILE).not.toBe(value)
  nested.restore()
  expect(process.env.USERPROFILE).toBe(value)
}

function restoresUnsetVariable(): void {
  delete process.env.USERPROFILE
  const nested = new DistributionEnvironment()
  nested.restore()
  expect(process.env.USERPROFILE).toBeUndefined()
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(() => environment.restore())
  test.each(CASES)("distribuição: $name", verifyDistribution)
  test.each(["", "valor"])("ambiente restaura a variável definida como %j", restoresSetVariable)
  test("ambiente restaura a variável ausente", restoresUnsetVariable)
}

describe("distribution", registerTests)
