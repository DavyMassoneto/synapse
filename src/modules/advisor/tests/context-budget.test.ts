import { beforeEach, describe, expect, test } from "vitest"
import { type AdvisorService } from "../internal"
import { BudgetModel, emptyConsultation, serviceFor, TestStorage } from "./doubles"

let advisor: AdvisorService

function prepare(): void {
  const storage = new TestStorage()
  storage.thinking = "high"
  advisor = serviceFor(storage)
}

async function rejectInsufficientWindows(contextWindow: number): Promise<void> {
  const port = new BudgetModel({
    reference: "provider/model",
    contextWindow,
    maxOutputTokens: 32_000,
    reasoningTokens: 16_384,
    effectiveThinking: "high",
  })
  const result = await advisor.consult(emptyConsultation(new AbortController().signal), port)
  expect(result.kind).toBe("failure")
  expect(port.calls).toBe(1)
  expect(port.captured).toBeUndefined()
}

async function reserveFullOutput(): Promise<void> {
  const port = new BudgetModel({
    reference: "provider/model",
    contextWindow: 128_000,
    maxOutputTokens: 32_000,
    reasoningTokens: 16_384,
    effectiveThinking: "high",
  })
  const result = await advisor.consult(
    {
      system: "",
      messages: [{ kind: "user", blocks: [{ kind: "text", text: "x".repeat(300_000) }] }],
      signal: new AbortController().signal,
    },
    port,
  )
  expect(result.kind).toBe("success")
  const captured = port.requireCaptured()
  const estimatedInput = Math.ceil(captured.system.length / 3) + Math.ceil(captured.prompt.length / 3)
  expect(estimatedInput + 4_096 + 32_000).toBeLessThanOrEqual(128_000)
}

async function noReasoningFits(): Promise<void> {
  const port = new BudgetModel({
    reference: "provider/model",
    contextWindow: 16_000,
    maxOutputTokens: 2_048,
    reasoningTokens: 0,
    effectiveThinking: "off",
  })
  const result = await advisor.consult(emptyConsultation(new AbortController().signal), port)
  expect(result.kind).toBe("success")
}

function registerTests(): void {
  beforeEach(prepare)
  test.each([16_000, 32_000])("rejeita contexto %i incapaz de reservar saída", rejectInsufficientWindows)
  test("reserva o teto de saída do advisor", reserveFullOutput)
  test("modelo sem raciocínio usa capacidade disponível", noReasoningFits)
}

describe("orçamento de contexto", registerTests)
