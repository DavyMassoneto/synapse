import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { prepareHostDirectory, TestContext, TypedAdvisorHost } from "../fixtures"

let host: TypedAdvisorHost
let context: TestContext

function prepare(): void {
  host = new TypedAdvisorHost(prepareHostDirectory())
  context = new TestContext()
  context.hasUI = true
}
function cleanup(): void {
  host.cleanup()
}

async function chooseModel(): Promise<void> {
  if (!host.command) {
    throw new Error("comando ausente")
  }
  context.ui.selection = "provider/other"
  await host.command.handler("", context)
  const status = host.advisor.configuration.status()
  expect(status.kind).toBe("success")
  if (status.kind !== "success") {
    throw new Error("status inválido")
  }
  expect(status.config.model).toBe("provider/other")
}

async function cancelSelection(): Promise<void> {
  if (!host.command) {
    throw new Error("comando ausente")
  }
  host.advisor.configuration.selectModel("provider/other")
  delete context.ui.selection
  await host.command.handler("", context)
  const status = host.advisor.configuration.status()
  expect(status.kind).toBe("success")
  if (status.kind !== "success") {
    throw new Error("status inválido")
  }
  expect(status.config.model).toBe("provider/other")
}

async function disableAdvisor(): Promise<void> {
  if (!host.command) {
    throw new Error("comando ausente")
  }
  context.ui.selection = "(sem advisor)"
  await host.command.handler("", context)
  const status = host.advisor.configuration.status()
  expect(status.kind).toBe("success")
  if (status.kind !== "success") {
    throw new Error("status inválido")
  }
  expect(status.config.model).toBeUndefined()
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("seleciona modelo", chooseModel)
  test("cancelamento preserva modelo", cancelSelection)
  test("desliga advisor", disableAdvisor)
}

describe("selection", registerTests)
