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

function restoresAgentDirectorySet(value: string): void {
  process.env.PI_CODING_AGENT_DIR = value
  const nested = new DistributionEnvironment()
  expect(process.env.PI_CODING_AGENT_DIR).toBe(nested.agentDirectory)
  nested.restore()
  expect(process.env.PI_CODING_AGENT_DIR).toBe(value)
}

function restoresAgentDirectoryUnset(): void {
  delete process.env.PI_CODING_AGENT_DIR
  const nested = new DistributionEnvironment()
  nested.restore()
  expect(process.env.PI_CODING_AGENT_DIR).toBeUndefined()
}

function cleanup(): void {
  environment.restore()
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test.each(["", "valor"])("ambiente restaura a variável definida como %j", restoresSetVariable)
  test("ambiente restaura a variável ausente", restoresUnsetVariable)
  test.each(["", "valor"])("restaura diretório do agente definido como %j", restoresAgentDirectorySet)
  test("restaura diretório do agente ausente", restoresAgentDirectoryUnset)
}

describe("distribution", registerTests)
