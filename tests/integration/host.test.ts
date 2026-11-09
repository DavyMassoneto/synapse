import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { prepareHostDirectory, TEST_USAGE, TestContext, TypedAdvisorHost, toolText } from "../fixtures"

let host: TypedAdvisorHost
let context: TestContext

function prepare(): void {
  host = new TypedAdvisorHost(prepareHostDirectory())
  context = new TestContext()
}
function cleanup(): void {
  host.cleanup()
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

async function projectionFailure(): Promise<void> {
  context.sessionManager.projectionError = true
  const result = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(toolText(result)).toMatch(/projection failed/)
  expect(context.modelRegistry.calls).toBe(0)
}

async function registeredShutdown(): Promise<void> {
  for (const handler of host.shutdowns) {
    await handler({ type: "session_shutdown", reason: "quit" }, context)
  }
  const result = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(toolText(result)).toMatch(/cancelada/)
  expect(context.modelRegistry.calls).toBe(0)
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)

  test("consulta registrada preserva uso e modelo", successfulConsultation)
  test("provedor abortado devolve cancelamento", abortedProvider)
  test("falha de projeção não consulta provedor", projectionFailure)
  test("shutdown registrado impede consulta", registeredShutdown)
}

describe("host", registerTests)
