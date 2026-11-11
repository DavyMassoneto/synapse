import { beforeEach, describe, expect, test } from "vitest"
import { type AdvisorService } from "../internal"
import {
  CancelledModel,
  CancelOnConsultModel,
  CancelOnResolveModel,
  emptyConsultation,
  serviceScenario,
} from "./doubles"

let advisor: AdvisorService

function prepare(): void {
  advisor = serviceScenario().advisor
}

async function cancellationDuringResolution(): Promise<void> {
  const controller = new AbortController()
  const port = new CancelOnResolveModel(controller)
  const result = await advisor.consult(emptyConsultation(controller.signal), port)
  expect(result.kind).toBe("cancelled")
  expect(port.captured).toBeUndefined()
}

async function cancellationDuringExecution(): Promise<void> {
  const controller = new AbortController()
  const port = new CancelOnConsultModel(controller)
  const result = await advisor.consult(emptyConsultation(controller.signal), port)
  expect(result.kind).toBe("cancelled")
}

async function cancellationFromProvider(): Promise<void> {
  const result = await advisor.consult(emptyConsultation(new AbortController().signal), new CancelledModel())
  expect(result.kind).toBe("cancelled")
}

function registerTests(): void {
  beforeEach(prepare)
  test("cancelamento durante resolução impede execução", cancellationDuringResolution)
  test("cancelamento durante execução é distinguido de falha", cancellationDuringExecution)
  test("porta cancelada sem sinal externo é cancelamento", cancellationFromProvider)
}

describe("consulta advisor", registerTests)
