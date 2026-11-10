import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { compose } from "#synapse/composition"
import { AdvisorHostCollector, TestContext } from "../fixtures"

let directory = ""

function prepare(): void {
  directory = mkdtempSync(join(tmpdir(), "synapse-composition-"))
}

function cleanup(): void {
  rmSync(directory, { recursive: true, force: true })
}

async function compositionLifecycle(): Promise<void> {
  const host = new AdvisorHostCollector()
  const composition = compose(host, join(directory, "advisor.json"))
  expect(composition.signal.aborted).toBe(false)
  expect(host.shutdowns).toHaveLength(1)
  for (const handler of host.shutdowns) {
    await handler({ type: "session_shutdown", reason: "quit" }, new TestContext())
  }
  expect(composition.signal.aborted).toBe(true)
  const reason = composition.signal.reason
  for (const handler of host.shutdowns) {
    await handler({ type: "session_shutdown", reason: "quit" }, new TestContext())
  }
  expect(composition.signal.reason).toBe(reason)
}

function missingConfiguration(): void {
  const composition = compose(new AdvisorHostCollector(), join(directory, "advisor.json"))
  expect(composition.advisor.activeModel()).toStrictEqual({ kind: "inactive" })
}

function invalidConfiguration(): void {
  const file = join(directory, "advisor.json")
  writeFileSync(file, "{broken")
  const composition = compose(new AdvisorHostCollector(), file)
  expect(composition.advisor.configuration.status().kind).toBe("failure")
  expect(composition.advisor.activeModel()).toStrictEqual({ kind: "inactive" })
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("composição registra o advisor e coordena o encerramento", compositionLifecycle)
  test("sem arquivo de configuração o advisor fica desligado", missingConfiguration)
  test("configuração inválida vira falha e deixa o advisor desligado", invalidConfiguration)
}

describe("composition", registerTests)
