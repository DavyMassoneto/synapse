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
import { TestRegistry } from "../fixtures"

let registry: TestRegistry
let adapter: AdvisorModel
let directory = ""
const signal = new AbortController().signal

function prepare(): void {
  registry = new TestRegistry()
  adapter = new AdvisorModel(registry)
  directory = mkdtempSync(join(tmpdir(), "advisor-model-"))
}
function cleanup(): void {
  rmSync(directory, { recursive: true, force: true })
}

async function resolved(reference: string, thinking: ThinkingLevel): Promise<ResolvedModel> {
  const resolution = await adapter.resolve(reference, thinking, signal)
  if (resolution.kind === "resolved") {
    return resolution.model
  }
  throw new Error("modelo não resolvido")
}

async function independentResolutions(): Promise<void> {
  const first = await resolved("provider/first", "high")
  const second = await resolved("provider/second", "low")
  const request: ModelRequest = { system: "review", prompt: "question", signal }
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
      signal,
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
  const response = await adapter.consult(first, { system: "review", prompt: "question", signal })
  expect(response.kind).toBe("failure")
  expect(registry.used).toBeUndefined()
}

async function missingModel(): Promise<void> {
  registry.missing = true
  expect(await adapter.resolve("provider/absent", "high", signal)).toStrictEqual({
    kind: "failure",
    message: "Modelo advisor não encontrado: provider/absent",
  })
}

async function missingCredentials(): Promise<void> {
  registry.authorized = false
  expect(await adapter.resolve("provider/first", "high", signal)).toStrictEqual({
    kind: "failure",
    message: "Credenciais ausentes para provider/first",
  })
}

async function invalidReference(): Promise<void> {
  const resolution = await adapter.resolve("sem-barra", "high", signal)
  expect(resolution.kind).toBe("failure")
  expect(registry.calls).toBe(0)
}

async function cancelledBeforeResolution(): Promise<void> {
  const controller = new AbortController()
  controller.abort()
  expect(await adapter.resolve("provider/first", "high", controller.signal)).toStrictEqual({ kind: "cancelled" })
  expect(registry.calls).toBe(0)
}

async function reasoningBudgets(): Promise<void> {
  expect((await resolved("provider/first", "off")).reasoningTokens).toBe(0)
  expect((await resolved("provider/first", "minimal")).reasoningTokens).toBe(PI_THINKING_BUDGETS.minimal)
  expect((await resolved("provider/first", "high")).reasoningTokens).toBe(PI_THINKING_BUDGETS.high)
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
  afterEach(cleanup)
  test("resoluções intercaladas preservam modelos", independentResolutions)
  test("consulta usa modelo configurado", serviceConsultation)
  test("mudança de capacidade é rejeitada", changedCapabilities)
  test("modelo ausente é rejeitado", missingModel)
  test("credenciais ausentes são rejeitadas", missingCredentials)
  test("referência sem provedor é rejeitada", invalidReference)
  test("sinal já cancelado não consulta o registry", cancelledBeforeResolution)
  test("nível de raciocínio define a reserva", reasoningBudgets)
  test("a tabela de reservas tem exatamente os níveis do contrato", budgetsCoverContractLevels)
  test.each(THINKING_LEVELS)(
    "a cópia da reserva de %s é igual à do pi-ai, que não expõe a tabela às extensões",
    budgetMatchesPiAi,
  )
}

describe("model resolution", registerTests)
