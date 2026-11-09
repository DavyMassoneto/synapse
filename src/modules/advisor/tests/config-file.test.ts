import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { FileConfig } from "../adapters"
import { AdvisorService } from "../internal"

let directory = ""

function prepareDirectory(): void {
  directory = mkdtempSync(join(tmpdir(), "advisor-config-"))
}
function cleanupDirectory(): void {
  rmSync(directory, { recursive: true, force: true })
}

function missingConfiguration(): void {
  const storage = new FileConfig(join(directory, "advisor.json"))
  const missing = storage.load()
  expect(missing.kind).toBe("missing")
  expect(new AdvisorService(storage, missing).configuration.status()).toStrictEqual({
    kind: "success",
    config: { thinking: "high" },
  })
}

function disabledConfiguration(): void {
  const path = join(directory, "advisor.json")
  writeFileSync(path, JSON.stringify({ model: "", thinking: "low" }))
  const storage = new FileConfig(path)
  expect(new AdvisorService(storage, storage.load()).configuration.status()).toStrictEqual({
    kind: "success",
    config: { thinking: "low" },
  })
}

function defaultThinking(): void {
  const path = join(directory, "advisor.json")
  writeFileSync(path, JSON.stringify({ model: "provider/model" }))
  const storage = new FileConfig(path)
  expect(new AdvisorService(storage, storage.load()).configuration.status()).toStrictEqual({
    kind: "success",
    config: { model: "provider/model", thinking: "high" },
  })
}

function replacesFile(): void {
  const path = join(directory, "advisor.json")
  const storage = new FileConfig(path)
  writeFileSync(path, "old")
  storage.save({ model: "provider/new", thinking: "low" })
  expect(readFileSync(path, "utf8")).toMatch(/provider\/new/)
  expect(readdirSync(directory)).toStrictEqual(["advisor.json"])
}

function rejectsDirectoryDestination(): void {
  const blockedPath = join(directory, "blocked")
  mkdirSync(blockedPath)
  writeFileSync(join(blockedPath, "keep"), "original")
  const storage = new FileConfig(blockedPath)
  let failed = false
  try {
    storage.save({ thinking: "high" })
  } catch (error) {
    expect(error).toBeInstanceOf(Error)
    failed = true
  }
  expect(failed).toBe(true)
  expect(readFileSync(join(blockedPath, "keep"), "utf8")).toBe("original")
  expect(readdirSync(directory)).toStrictEqual(["blocked"])
}

function registerTests(): void {
  beforeEach(prepareDirectory)
  afterEach(cleanupDirectory)
  test("configuração ausente usa padrão", missingConfiguration)
  test("modelo vazio desliga advisor", disabledConfiguration)
  test("configuração sem nível usa padrão", defaultThinking)
  test("gravação substitui arquivo", replacesFile)
  test("falha de substituição preserva destino e limpa temporário", rejectsDirectoryDestination)
}

describe("config file", registerTests)
