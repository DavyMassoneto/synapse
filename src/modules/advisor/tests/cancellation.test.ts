import { beforeEach, describe, expect, test } from "vitest"
import { AdvisorService } from "../internal"
import { CancelOnConsultModel } from "./cancel-on-consult-model"
import { CancelOnResolveModel } from "./cancel-on-resolve-model"
import { CancelledModel } from "./cancelled-model"
import { TestStorage } from "./test-storage"

let storage: TestStorage
let advisor: AdvisorService

function prepare(): void {
  storage = new TestStorage()
  advisor = new AdvisorService(storage, storage.load())
}

async function cancellationDuringResolution() {
  const controller = new AbortController()
  const port = new CancelOnResolveModel(controller)
  const result = await advisor.consult({ system: "", messages: [], signal: controller.signal }, port)
  expect(result.kind).toBe("cancelled")
  expect(port.captured).toBeUndefined()
}

async function cancellationDuringExecution() {
  const controller = new AbortController()
  const port = new CancelOnConsultModel(controller)
  const result = await advisor.consult({ system: "", messages: [], signal: controller.signal }, port)
  expect(result.kind).toBe("cancelled")
}

async function cancellationFromProvider() {
  const result = await advisor.consult(
    { system: "", messages: [], signal: new AbortController().signal },
    new CancelledModel(),
  )
  expect(result.kind).toBe("cancelled")
}

function registerTests(): void {
  beforeEach(prepare)
  test("cancelamento durante resolução impede execução", cancellationDuringResolution)
  test("cancelamento durante execução é distinguido de falha", cancellationDuringExecution)
  test("porta cancelada sem sinal externo é cancelamento", cancellationFromProvider)
}

describe("consulta advisor", registerTests)
