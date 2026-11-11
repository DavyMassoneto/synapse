import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { BlockedConfigHost, prepareHostDirectory, TestContext } from "../fixtures"

let host: BlockedConfigHost
let context: TestContext

function prepare(): void {
  host = new BlockedConfigHost(prepareHostDirectory())
  host.blockConfiguration()
  context = new TestContext()
}

async function reportsFailure(): Promise<void> {
  await host.requireCommand().handler("thinking high", context)
  expect(context.ui.notices).toHaveLength(1)
  expect(context.ui.notices[0]).toMatch(/salvar/)
  expect(context.ui.notices[0]).toContain("Causa: ")
  expect(context.ui.notices[0]).toContain("advisor.json")
  expect(context.ui.notices[0]).not.toMatch(/Advisor thinking: high/)
}

async function preservesState(): Promise<void> {
  await host.requireCommand().handler("thinking high", context)
  const status = host.requireConfig()
  expect(status.thinking).toBe("low")
  expect(host.advisor.activeModel().kind).toBe("active")
}

function cleanup(): void {
  host.cleanup()
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("falha ao salvar é informada", reportsFailure)
  test("falha ao salvar preserva estado", preservesState)
}

describe("config write failure", registerTests)
