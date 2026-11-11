import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { prepareHostDirectory, TestContext, TypedAdvisorHost } from "../fixtures"

let host: TypedAdvisorHost
let context: TestContext

function prepare(): void {
  host = new TypedAdvisorHost(prepareHostDirectory())
  context = new TestContext()
}

async function missingThinking(): Promise<void> {
  await host.requireCommand().handler("thinking", context)
  expect(context.ui.notices.at(-1)).toMatch(/inválido/)
}

async function invalidThinking(): Promise<void> {
  await host.requireCommand().handler("thinking banana", context)
  expect(context.ui.notices.at(-1)).toMatch(/inválido/)
}

async function thinkingModel(): Promise<void> {
  await host.requireCommand().handler("thinkingx", context)
  const status = host.requireConfig()
  expect(status.model).toBe("provider/thinkingx")
}

async function exactModel(): Promise<void> {
  await host.requireCommand().handler("provider/model", context)
  const status = host.requireConfig()
  expect(status.model).toBe("provider/model")
}

async function ambiguousModel(): Promise<void> {
  await host.requireCommand().handler("provider", context)
  expect(context.ui.notices.at(-1)).toMatch(/Mais de um modelo/)
  const status = host.requireConfig()
  expect(status.model).toBe("provider/model")
}

async function scopedSuggestions(): Promise<void> {
  context.scopedModels = [{ model: { ...context.modelRegistry.model, id: "scoped" } }]
  await host.emitSessionStart(context)
  const suggestions = await host.requireCompletions()("")
  expect(suggestions?.map((item) => item.value)).toStrictEqual(["off", "thinking", "provider/scoped"])
}

async function suggestionsBeforeSession(): Promise<void> {
  const suggestions = await host.requireCompletions()("")
  expect(suggestions?.map((item) => item.value)).toStrictEqual(["off", "thinking"])
}

async function unmatchedPrefix(): Promise<void> {
  await host.emitSessionStart(context)
  expect(await host.requireCompletions()("zzz")).toStrictEqual([])
}

async function caseInsensitivePrefix(): Promise<void> {
  await host.emitSessionStart(context)
  expect((await host.requireCompletions()("TH"))?.map((item) => item.value)).toStrictEqual(["thinking"])
}

async function completionLimit(): Promise<void> {
  context.scopedModels = Array.from({ length: 50 }, (_, index) => ({
    model: { ...context.modelRegistry.model, id: `model-${index}` },
  }))
  await host.emitSessionStart(context)
  const suggestions = await host.requireCompletions()("")
  expect(suggestions).toHaveLength(40)
}

function scopeTwoModels(): void {
  context.scopedModels = [
    { model: { ...context.modelRegistry.model, id: "model" } },
    { model: { ...context.modelRegistry.model, id: "model-extra" } },
  ]
}

async function scopedExactSearch(): Promise<void> {
  scopeTwoModels()
  await host.requireCommand().handler("PROVIDER/MODEL", context)
  expect(host.requireConfig().model).toBe("provider/model")
}

async function scopedFuzzySearch(): Promise<void> {
  scopeTwoModels()
  await host.requireCommand().handler("model extra", context)
  expect(host.requireConfig().model).toBe("provider/model-extra")
}

async function searchOutsideScope(): Promise<void> {
  scopeTwoModels()
  await host.requireCommand().handler("thinkingx", context)
  expect(context.ui.notices.at(-1)).toMatch(/Nenhum modelo encontrado/)
  expect(host.advisor.activeModel()).toStrictEqual({ kind: "active", model: "provider/model" })
}

function cleanup(): void {
  host.cleanup()
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("thinking sem nível", missingThinking)
  test("thinking inválido", invalidThinking)
  test("thinkingx é modelo", thinkingModel)
  test("referência exata", exactModel)
  test("referência ambígua", ambiguousModel)
  test("autocomplete respeita escopo", scopedSuggestions)
  test("autocomplete limita sugestões", completionLimit)
  test("autocomplete antes da sessão só tem os subcomandos", suggestionsBeforeSession)
  test("autocomplete ignora prefixo sem correspondência", unmatchedPrefix)
  test("autocomplete ignora maiúsculas no prefixo", caseInsensitivePrefix)
  test("busca exata no escopo ignora maiúsculas", scopedExactSearch)
  test("busca aproximada no escopo escolhe o modelo", scopedFuzzySearch)
  test("modelo fora do escopo é recusado e preserva o atual", searchOutsideScope)
}

describe("command", registerTests)
