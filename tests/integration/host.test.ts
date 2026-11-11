import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { hostScenario, TEST_USAGE, type TestContext, type TypedAdvisorHost, toolText } from "../fixtures"

let host: TypedAdvisorHost
let context: TestContext

function prepare(): void {
  ;({ host, context } = hostScenario())
}

async function successfulConsultation(): Promise<void> {
  const result = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(toolText(result)).toBeTruthy()
  expect(result.usage).toStrictEqual(TEST_USAGE)
  expect(result.details?.model).toBe("provider/model")
}

async function abortedProvider(): Promise<void> {
  context.modelRegistry.stopReason = "aborted"
  const result = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(toolText(result)).toMatch(/cancelada/)
}

async function providerError(): Promise<void> {
  context.modelRegistry.stopReason = "error"
  const result = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(result.isError).toBe(true)
  expect(toolText(result)).toBe("O provedor do advisor falhou sem informar o erro.")
}

async function projectionFailure(): Promise<void> {
  context.sessionManager.projectionError = true
  const result = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(toolText(result)).toMatch(/projection failed/)
  expect(context.modelRegistry.calls).toBe(0)
}

function cleanup(): void {
  host.cleanup()
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("consulta registrada preserva uso e modelo", successfulConsultation)
  test("provedor abortado devolve cancelamento", abortedProvider)
  test("erro do provedor devolve falha, não cancelamento", providerError)
  test("falha de projeção não consulta provedor", projectionFailure)
}

describe("host", registerTests)
