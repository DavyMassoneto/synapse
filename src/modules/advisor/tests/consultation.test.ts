import { beforeEach, describe, expect, test } from "vitest"
import { type AdvisorService } from "../internal"
import { emptyConsultation, FailingModel, serviceFor, TestModel, TestStorage, WaitingModel } from "./doubles"

let storage: TestStorage
let advisor: AdvisorService

function prepare(): void {
  storage = new TestStorage()
  advisor = serviceFor(storage)
}

async function snapshotIsStable() {
  const firstStorage = new TestStorage()
  firstStorage.model = "provider/first"
  const firstAdvisor = serviceFor(firstStorage)
  const gate = Promise.withResolvers<void>()
  const port = new WaitingModel(gate.promise)
  const pending = firstAdvisor.consult(emptyConsultation(new AbortController().signal), port)
  firstAdvisor.configuration.selectModel("provider/second")
  firstAdvisor.configuration.setThinking("high")
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
  expect(await advisor.consult(emptyConsultation(controller.signal), port)).toStrictEqual({
    kind: "cancelled",
  })
  expect(port.calls).toBe(0)
}

async function providerFailure() {
  const port = new FailingModel()
  expect(await advisor.consult(emptyConsultation(new AbortController().signal), port)).toStrictEqual({
    kind: "failure",
    message: "provider error",
  })
}

function registerTests(): void {
  beforeEach(prepare)
  test("a consulta preserva o snapshot durante alterações de configuração", snapshotIsStable)
  test("cancelamento prévio impede resolução", cancellationBeforeResolution)
  test("falha do provedor é comunicada", providerFailure)
}

describe("consulta advisor", registerTests)
