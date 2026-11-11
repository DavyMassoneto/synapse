import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { compose } from "#synapse/composition"
import { AdvisorHostCollector, TestContext, toolText } from "../fixtures"

let directory = ""
let file = ""
let host: AdvisorHostCollector
let context: TestContext

function prepare(): void {
  directory = mkdtempSync(join(tmpdir(), "synapse-composition-"))
  file = join(directory, "advisor.json")
  host = new AdvisorHostCollector()
  context = new TestContext()
}

async function compositionLifecycle(): Promise<void> {
  writeFileSync(file, JSON.stringify({ model: "provider/model", thinking: "low" }))
  compose(host, file)
  await host.emitSessionStart(context)
  expect(host.active).toContain("advisor")
  expect(host.shutdowns).toHaveLength(1)
  const answered = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(toolText(answered)).toBe("conselho")
  const lifetime = context.modelRegistry.options?.signal
  expect(lifetime?.aborted).toBe(false)
  const calls = context.modelRegistry.calls
  await host.emitShutdown(context)
  await host.emitShutdown(context)
  expect(lifetime?.aborted).toBe(true)
  expect(lifetime?.reason).toBeInstanceOf(Error)
  const refused = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(toolText(refused)).toMatch(/cancelada/)
  expect(context.modelRegistry.calls).toBe(calls)
}

async function missingConfiguration(): Promise<void> {
  compose(host, file)
  await host.emitSessionStart(context)
  expect(host.active).not.toContain("advisor")
  const result = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(result.isError).toBe(true)
  expect(toolText(result)).toBe("Nenhum modelo advisor configurado.")
  expect(context.modelRegistry.calls).toBe(0)
}

async function invalidConfiguration(): Promise<void> {
  writeFileSync(file, "{broken")
  context.hasUI = true
  compose(host, file)
  await host.emitSessionStart(context)
  expect(context.ui.notices[0]).toMatch(/inválida/)
  expect(host.active).not.toContain("advisor")
  const result = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(result.isError).toBe(true)
  expect(toolText(result)).toMatch(/inválida/)
  expect(context.modelRegistry.calls).toBe(0)
  expect(readFileSync(file, "utf8")).toBe("{broken")
}

function cleanup(): void {
  rmSync(directory, { recursive: true, force: true })
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("composição registra o advisor e o encerramento cancela as consultas", compositionLifecycle)
  test("sem arquivo de configuração o advisor fica desligado", missingConfiguration)
  test("configuração inválida vira falha, deixa o advisor desligado e preserva o arquivo", invalidConfiguration)
}

describe("composition", registerTests)
