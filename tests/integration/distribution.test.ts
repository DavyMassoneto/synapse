import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { DistributionEnvironment } from "../fixtures"

let environment: DistributionEnvironment

function prepare(): void {
  environment = new DistributionEnvironment()
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

function cleanup(): void {
  environment.restore()
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test.each(["", "valor"])("ambiente restaura a variável definida como %j", restoresSetVariable)
  test("ambiente restaura a variável ausente", restoresUnsetVariable)
}

describe("distribution", registerTests)
