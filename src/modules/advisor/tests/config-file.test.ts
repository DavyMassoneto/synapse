import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { FileConfig } from "../adapters"
import { AdvisorService } from "../internal"
import { THINKING_LEVELS, type ThinkingLevel } from "../public"
import { INVALID_FILE } from "./constants"
import { serviceFor } from "./doubles"

let directory = ""
let file = ""

function prepareDirectory(): void {
  directory = mkdtempSync(join(tmpdir(), "advisor-config-"))
  file = join(directory, "advisor.json")
}

function missingConfiguration(): void {
  const storage = new FileConfig(file)
  const missing = storage.load()
  expect(missing.kind).toBe("missing")
  expect(new AdvisorService(storage, missing).configuration.status()).toStrictEqual({
    kind: "success",
    config: { thinking: "high" },
  })
}

function disabledConfiguration(): void {
  writeFileSync(file, JSON.stringify({ model: "", thinking: "low" }))
  const storage = new FileConfig(file)
  expect(serviceFor(storage).configuration.status()).toStrictEqual({
    kind: "success",
    config: { thinking: "low" },
  })
}

function defaultThinking(): void {
  writeFileSync(file, JSON.stringify({ model: "provider/model" }))
  const storage = new FileConfig(file)
  expect(serviceFor(storage).configuration.status()).toStrictEqual({
    kind: "success",
    config: { model: "provider/model", thinking: "high" },
  })
}

function loadsLevel(level: ThinkingLevel): void {
  writeFileSync(file, JSON.stringify({ thinking: level }))
  expect(new FileConfig(file).load()).toStrictEqual({ kind: "loaded", config: { thinking: level } })
}

function rejectsUnknownLevel(): void {
  writeFileSync(file, JSON.stringify({ thinking: "banana" }))
  expect(new FileConfig(file).load()).toStrictEqual(INVALID_FILE)
}

function rejectsMalformedModel(model: string): void {
  writeFileSync(file, JSON.stringify({ model, thinking: "low" }))
  expect(new FileConfig(file).load()).toStrictEqual(INVALID_FILE)
}

function replacesFile(): void {
  const storage = new FileConfig(file)
  writeFileSync(file, "old")
  storage.save({ model: "provider/new", thinking: "low" })
  expect(readFileSync(file, "utf8")).toMatch(/provider\/new/)
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
  afterEach(() => rmSync(directory, { recursive: true, force: true }))
  test("configuração ausente usa padrão", missingConfiguration)
  test("modelo vazio desliga advisor", disabledConfiguration)
  test("configuração sem nível usa padrão", defaultThinking)
  test.each(THINKING_LEVELS)("nível %s é lido do arquivo", loadsLevel)
  test("nível desconhecido no arquivo é recusado", rejectsUnknownLevel)
  test.each(["lixo", "provedor/", "/id"])("modelo %s fora do formato provedor/id é recusado", rejectsMalformedModel)
  test("gravação substitui arquivo", replacesFile)
  test("falha de substituição preserva destino e limpa temporário", rejectsDirectoryDestination)
}

describe("config file", registerTests)
