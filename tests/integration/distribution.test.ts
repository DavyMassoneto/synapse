import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { advisorConfigPath } from "#synapse/integration"
import {
  DistributionEnvironment,
  INVALID_CASES,
  type InvalidConfigCase,
  runDistribution,
  VALID_CONFIG,
} from "../fixtures"

let environment: DistributionEnvironment

function prepare(): void {
  environment = new DistributionEnvironment()
}

async function missingConfiguration(): Promise<void> {
  const result = await runDistribution(environment)
  expect(result.notices.join("\n")).toMatch(/Advisor: desligado, thinking high/)
  expect(existsSync(advisorConfigPath())).toBe(false)
}

async function validConfiguration(): Promise<void> {
  writeFileSync(advisorConfigPath(), VALID_CONFIG)
  const result = await runDistribution(environment)
  expect(result.notices.join("\n")).toMatch(/Advisor: openai\/gpt-x, thinking low/)
  expect(readFileSync(advisorConfigPath(), "utf8")).toBe(VALID_CONFIG)
}

async function invalidConfiguration(example: InvalidConfigCase): Promise<void> {
  writeFileSync(advisorConfigPath(), example.content)
  const result = await runDistribution(environment)
  expect(result.notices.join("\n")).toMatch(/Configuração do advisor inválida/)
  expect(readFileSync(advisorConfigPath(), "utf8")).toBe(example.content)
  expect(result.lookups).toBe(0)
  expect(result.isError).toBe(true)
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
  test("distribuição sem configuração deixa o advisor desligado", missingConfiguration)
  test("distribuição lê a configuração válida e não a altera", validConfiguration)
  test.each(INVALID_CASES)("distribuição recusa configuração com $name e não consulta o modelo", invalidConfiguration)
  test.each(["", "valor"])("ambiente restaura a variável definida como %j", restoresSetVariable)
  test("ambiente restaura a variável ausente", restoresUnsetVariable)
}

describe("distribution", registerTests)
