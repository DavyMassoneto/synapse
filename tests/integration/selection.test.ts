import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { prepareHostDirectory, TestContext, TypedAdvisorHost } from "../fixtures"

let host: TypedAdvisorHost
let context: TestContext

function prepare(): void {
  host = new TypedAdvisorHost(prepareHostDirectory())
  context = new TestContext()
  context.hasUI = true
}

async function chooseModel(): Promise<void> {
  context.ui.selection = "provider/other"
  await host.requireCommand().handler("", context)
  const status = host.requireConfig()
  expect(status.model).toBe("provider/other")
  expect(status.thinking).toBe("low")
}

async function cancelSelection(): Promise<void> {
  host.advisor.configuration.selectModel("provider/other")
  delete context.ui.selection
  await host.requireCommand().handler("", context)
  const status = host.requireConfig()
  expect(status.model).toBe("provider/other")
}

async function disableAdvisor(): Promise<void> {
  context.ui.selection = "(sem advisor)"
  await host.requireCommand().handler("", context)
  const status = host.requireConfig()
  expect(status.model).toBeUndefined()
  expect(status.thinking).toBe("low")
  expect(host.advisor.activeModel()).toStrictEqual({ kind: "inactive" })
}

function cleanup(): void {
  host.cleanup()
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("seleciona modelo", chooseModel)
  test("cancelamento preserva modelo", cancelSelection)
  test("desliga advisor", disableAdvisor)
}

describe("selection", registerTests)
