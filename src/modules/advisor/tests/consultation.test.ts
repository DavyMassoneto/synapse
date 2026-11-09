import { beforeEach, describe, expect, test } from "vitest"
import { AdvisorService } from "../internal"
import { FailingModel, TestModel, TestStorage, WaitingModel } from "./doubles"

let storage: TestStorage
let advisor: AdvisorService

function prepare(): void {
  storage = new TestStorage()
  advisor = new AdvisorService(storage, storage.load())
}

async function snapshotIsStable() {
  const storage = new TestStorage()
  storage.model = "provider/first"
  const advisor = new AdvisorService(storage, storage.load())
  const gate = Promise.withResolvers<void>()
  const port = new WaitingModel(gate.promise)
  const pending = advisor.consult({ system: "", messages: [], signal: new AbortController().signal }, port)
  advisor.configuration.selectModel("provider/second")
  advisor.configuration.setThinking("high")
  gate.resolve()
  const result = await pending
  expect(result.kind).toBe("success")
  if (result.kind !== "success") {
    throw new Error("consulta não concluída")
  }
  expect(result.model).toBe("provider/first")
  expect(port.resolvedReference).toBe("provider/first")
  expect(port.resolved?.reference).toBe("provider/first")
  expect(port.resolved?.effectiveThinking).toBe("low")
}

async function cancellationBeforeResolution() {
  const controller = new AbortController()
  controller.abort()
  const port = new TestModel()
  expect(await advisor.consult({ system: "", messages: [], signal: controller.signal }, port)).toStrictEqual({
    kind: "cancelled",
  })
  expect(port.calls).toBe(0)
}

async function providerFailure() {
  const port = new FailingModel()
  expect(await advisor.consult({ system: "", messages: [], signal: new AbortController().signal }, port)).toStrictEqual(
    {
      kind: "failure",
      message: "provider error",
    },
  )
}

function registerTests(): void {
  beforeEach(prepare)
  test("a consulta preserva o snapshot durante alterações de configuração", snapshotIsStable)
  test("cancelamento prévio impede resolução", cancellationBeforeResolution)
  test("falha do provedor é comunicada", providerFailure)
}

describe("consulta advisor", registerTests)
