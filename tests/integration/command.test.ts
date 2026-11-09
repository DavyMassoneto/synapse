import { type AutocompleteItem } from "@earendil-works/pi-tui"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { prepareHostDirectory, TestContext, TypedAdvisorHost } from "../fixtures"

let host: TypedAdvisorHost
let context: TestContext

function prepare(): void {
  host = new TypedAdvisorHost(prepareHostDirectory())
  context = new TestContext()
}
function cleanup(): void {
  host.cleanup()
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
  const status = host.advisor.configuration.status()
  expect(status.kind).toBe("success")
  if (status.kind !== "success") {
    throw new Error("status inválido")
  }
  expect(status.config.model).toBe("provider/thinkingx")
}

async function exactModel(): Promise<void> {
  await host.requireCommand().handler("provider/model", context)
  const status = host.advisor.configuration.status()
  expect(status.kind).toBe("success")
  if (status.kind !== "success") {
    throw new Error("status inválido")
  }
  expect(status.config.model).toBe("provider/model")
}

async function ambiguousModel(): Promise<void> {
  await host.requireCommand().handler("provider", context)
  expect(context.ui.notices.at(-1)).toMatch(/Mais de um modelo/)
  const status = host.advisor.configuration.status()
  expect(status.kind).toBe("success")
  if (status.kind !== "success") {
    throw new Error("status inválido")
  }
  expect(status.config.model).toBe("provider/model")
}

async function scopedSuggestions(): Promise<void> {
  context.scopedModels = [{ model: { ...context.modelRegistry.model, id: "scoped" } }]
  for (const handler of host.starts) {
    await handler({ type: "session_start", reason: "startup" }, context)
  }
  const suggestions = await host.requireCompletions()("")
  expect(suggestions?.map(suggestionValue)).toStrictEqual(["off", "thinking", "provider/scoped"])
}

function suggestionValue(item: AutocompleteItem): string {
  return item.value
}

async function completionLimit(): Promise<void> {
  context.scopedModels = Array.from({ length: 50 }, (_, index) => ({
    model: { ...context.modelRegistry.model, id: `model-${index}` },
  }))
  for (const handler of host.starts) {
    await handler({ type: "session_start", reason: "startup" }, context)
  }
  const suggestions = await host.requireCompletions()("")
  expect(suggestions).toHaveLength(40)
}

async function scopedSearch(): Promise<void> {
  context.scopedModels = [
    { model: { ...context.modelRegistry.model, id: "model" } },
    { model: { ...context.modelRegistry.model, id: "model-extra" } },
  ]
  await host.requireCommand().handler("PROVIDER/MODEL", context)
  const status = host.advisor.configuration.status()
  if (status.kind !== "success") {
    throw new Error("status inválido")
  }
  expect(status.config.model).toBe("provider/model")
  await host.requireCommand().handler("model extra", context)
  const next = host.advisor.configuration.status()
  if (next.kind !== "success") {
    throw new Error("status inválido")
  }
  expect(next.config.model).toBe("provider/model-extra")
  await host.requireCommand().handler("thinkingx", context)
  expect(context.ui.notices.at(-1)).toMatch(/Nenhum modelo encontrado/)
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
  test("busca respeita escopo e correspondência exata", scopedSearch)
}

describe("command", registerTests)
