import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { FileConfig } from "../adapters"
import { AdvisorService } from "../internal"
import { THINKING_LEVELS, type ThinkingLevel } from "../public"
import { serviceFor } from "./doubles"

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
  expect(serviceFor(storage).configuration.status()).toStrictEqual({
    kind: "success",
    config: { thinking: "low" },
  })
}

function defaultThinking(): void {
  const path = join(directory, "advisor.json")
  writeFileSync(path, JSON.stringify({ model: "provider/model" }))
  const storage = new FileConfig(path)
  expect(serviceFor(storage).configuration.status()).toStrictEqual({
    kind: "success",
    config: { model: "provider/model", thinking: "high" },
  })
}

function loadsLevel(level: ThinkingLevel): void {
  const path = join(directory, "advisor.json")
  writeFileSync(path, JSON.stringify({ thinking: level }))
  expect(new FileConfig(path).load()).toStrictEqual({ kind: "loaded", config: { thinking: level } })
}

function rejectsUnknownLevel(): void {
  const path = join(directory, "advisor.json")
  writeFileSync(path, JSON.stringify({ thinking: "banana" }))
  expect(new FileConfig(path).load()).toStrictEqual({
    kind: "invalid",
    message: "Configuração do advisor inválida; revise advisor.json.",
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
  expect(() => storage.save({ thinking: "high" })).toThrow(Error)
  expect(readFileSync(join(blockedPath, "keep"), "utf8")).toBe("original")
  expect(readdirSync(directory)).toStrictEqual(["blocked"])
}

function registerTests(): void {
  beforeEach(prepareDirectory)
  afterEach(cleanupDirectory)
  test("configuração ausente usa padrão", missingConfiguration)
  test("modelo vazio desliga advisor", disabledConfiguration)
  test("configuração sem nível usa padrão", defaultThinking)
  test.each(THINKING_LEVELS)("nível %s é lido do arquivo", loadsLevel)
  test("nível desconhecido no arquivo é recusado", rejectsUnknownLevel)
  test("gravação substitui arquivo", replacesFile)
  test("falha de substituição preserva destino e limpa temporário", rejectsDirectoryDestination)
}

describe("config file", registerTests)
