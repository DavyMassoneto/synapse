import { beforeEach, describe, expect, test } from "vitest"
import { type AdvisorService } from "../internal"
import { THINKING_LEVELS, type ThinkingLevel } from "../public"
import { serviceFor, serviceScenario, TestStorage } from "./doubles"

let storage: TestStorage
let advisor: AdvisorService

function prepare(): void {
  ;({ storage, advisor } = serviceScenario())
}

function invalidModelDoesNotSave(): void {
  expect(advisor.configuration.selectModel("invalid").kind).toBe("failure")
  expect(storage.saves).toBe(0)
}

function invalidThinkingDoesNotSave(): void {
  expect(advisor.configuration.setThinking("invalid").kind).toBe("failure")
  expect(storage.saves).toBe(0)
}

function acceptsLevel(level: ThinkingLevel): void {
  expect(advisor.configuration.setThinking(level)).toStrictEqual({
    kind: "success",
    config: { model: "provider/model", thinking: level },
  })
  expect(storage.saves).toBe(1)
}

function failedSavePreservesState(): void {
  const failingStorage = new TestStorage()
  failingStorage.model = "provider/original"
  failingStorage.failSave = true
  const failingAdvisor = serviceFor(failingStorage)
  expect(failingStorage.loads).toBe(1)
  expect(failingAdvisor.configuration.selectModel("provider/novo")).toStrictEqual({
    kind: "failure",
    message: "Não foi possível salvar a configuração do advisor. Causa: disco indisponível",
  })
  expect(failingAdvisor.configuration.status()).toStrictEqual({
    kind: "success",
    config: { model: "provider/original", thinking: "low" },
  })
}

function registerTests(): void {
  beforeEach(prepare)
  test("modelo inválido não é salvo", invalidModelDoesNotSave)
  test("nível inválido não é salvo", invalidThinkingDoesNotSave)
  test.each(THINKING_LEVELS)("nível %s é aceito e salvo", acceptsLevel)
  test("falha de persistência preserva a configuração anterior", failedSavePreservesState)
}

describe("configuração advisor", registerTests)
