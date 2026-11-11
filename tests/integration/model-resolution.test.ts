import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { thinkingBudgetForLevel } from "@earendil-works/pi-ai/api/simple-options"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { AdvisorModel, PI_THINKING_BUDGETS } from "#synapse/integration"
import {
  createAdvisor,
  type ModelRequest,
  type ResolvedModel,
  THINKING_LEVELS,
  type ThinkingLevel,
} from "#synapse/modules"
import { IDLE_SIGNAL, TestRegistry } from "../fixtures"

let registry: TestRegistry
let adapter: AdvisorModel
let directory = ""

function prepare(): void {
  registry = new TestRegistry()
  adapter = new AdvisorModel(registry)
  directory = mkdtempSync(join(tmpdir(), "advisor-model-"))
}

async function resolved(reference: string, thinking: ThinkingLevel): Promise<ResolvedModel> {
  const resolution = await adapter.resolve(reference, thinking, IDLE_SIGNAL)
  if (resolution.kind === "resolved") {
    return resolution.model
  }
  throw new Error("modelo não resolvido")
}

async function independentResolutions(): Promise<void> {
  const first = await resolved("provider/first", "high")
  const second = await resolved("provider/second", "low")
  const request: ModelRequest = { system: "review", prompt: "question", signal: IDLE_SIGNAL }
  await adapter.consult(first, request)
  expect(registry.used?.id).toBe("first")
  expect(registry.options?.reasoning).toBe("high")
  await adapter.consult(second, request)
  expect(registry.used?.id).toBe("second")
  expect(registry.options?.reasoning).toBe("low")
}

async function serviceConsultation(): Promise<void> {
  const file = join(directory, "advisor.json")
  writeFileSync(file, JSON.stringify({ model: "provider/first", thinking: "high" }))
  const advisor = createAdvisor(file)
  const result = await advisor.consult(
    {
      system: "review",
      messages: [{ kind: "user", blocks: [{ kind: "text", text: "x".repeat(300_000) }] }],
      signal: IDLE_SIGNAL,
    },
    adapter,
  )
  expect(result.kind).toBe("success")
  expect(registry.used?.id).toBe("first")
  expect(registry.options?.reasoning).toBe("high")
  expect(registry.options?.maxTokens).toBeUndefined()
  expect(registry.context).toBeDefined()
}

async function changedCapabilities(): Promise<void> {
  const first = await resolved("provider/first", "high")
  registry.window = 64_000
  const response = await adapter.consult(first, { system: "review", prompt: "question", signal: IDLE_SIGNAL })
  expect(response.kind).toBe("failure")
  expect(registry.used).toBeUndefined()
}

async function missingModel(): Promise<void> {
  registry.missing = true
  expect(await adapter.resolve("provider/absent", "high", IDLE_SIGNAL)).toStrictEqual({
    kind: "failure",
    message: "Modelo advisor não encontrado: provider/absent",
  })
}

async function missingCredentials(): Promise<void> {
  registry.authorized = false
  expect(await adapter.resolve("provider/first", "high", IDLE_SIGNAL)).toStrictEqual({
    kind: "failure",
    message: "Credenciais ausentes para provider/first",
  })
}

async function invalidReference(): Promise<void> {
  const resolution = await adapter.resolve("sem-barra", "high", IDLE_SIGNAL)
  expect(resolution.kind).toBe("failure")
  expect(registry.calls).toBe(0)
}

async function cancelledBeforeResolution(): Promise<void> {
  const controller = new AbortController()
  controller.abort()
  expect(await adapter.resolve("provider/first", "high", controller.signal)).toStrictEqual({ kind: "cancelled" })
  expect(registry.calls).toBe(0)
}

async function reasoningBudget(level: ThinkingLevel): Promise<void> {
  expect((await resolved("provider/first", level)).reasoningTokens).toBe(PI_THINKING_BUDGETS[level])
}

function budgetsCoverContractLevels(): void {
  expect(Object.keys(PI_THINKING_BUDGETS)).toStrictEqual(THINKING_LEVELS)
}

function budgetMatchesPiAi(level: ThinkingLevel): void {
  if (level === "off") {
    expect(PI_THINKING_BUDGETS.off).toBe(0)
  } else {
    expect(PI_THINKING_BUDGETS[level]).toBe(thinkingBudgetForLevel(level))
  }
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(() => rmSync(directory, { recursive: true, force: true }))
  test("resoluções intercaladas preservam modelos", independentResolutions)
  test("consulta usa modelo configurado", serviceConsultation)
  test("mudança de capacidade é rejeitada", changedCapabilities)
  test("modelo ausente é rejeitado", missingModel)
  test("credenciais ausentes são rejeitadas", missingCredentials)
  test("referência sem provedor é rejeitada", invalidReference)
  test("sinal já cancelado não consulta o registry", cancelledBeforeResolution)
  test.each(THINKING_LEVELS)("nível %s define a reserva", reasoningBudget)
  test("a tabela de reservas tem exatamente os níveis do contrato", budgetsCoverContractLevels)
  test.each(THINKING_LEVELS)(
    "a cópia da reserva de %s é igual à do pi-ai, que não expõe a tabela às extensões",
    budgetMatchesPiAi,
  )
}

describe("model resolution", registerTests)
