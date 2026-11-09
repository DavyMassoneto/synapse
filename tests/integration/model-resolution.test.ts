import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { AdvisorModel } from "#synapse/integration"
import { createAdvisor, type ModelRequest } from "#synapse/modules"
import { RegistryFixture } from "../fixtures"

let registry: RegistryFixture
let adapter: AdvisorModel
let directory = ""
const signal = new AbortController().signal

function prepare(): void {
  registry = new RegistryFixture()
  adapter = new AdvisorModel(registry)
  directory = mkdtempSync(join(tmpdir(), "advisor-model-"))
}
function cleanup(): void {
  rmSync(directory, { recursive: true, force: true })
}

async function independentResolutions(): Promise<void> {
  const first = await adapter.resolve("provider/first", "high", signal)
  const second = await adapter.resolve("provider/second", "low", signal)
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
  const first = await adapter.resolve("provider/first", "high", signal)
  registry.window = 64_000
  await expect(adapter.consult(first, { system: "review", prompt: "question", signal })).rejects.toThrow(/capacidades/)
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("resoluções intercaladas preservam modelos", independentResolutions)
  test("consulta usa modelo configurado", serviceConsultation)
  test("mudança de capacidade é rejeitada", changedCapabilities)
}

describe("model resolution", registerTests)
