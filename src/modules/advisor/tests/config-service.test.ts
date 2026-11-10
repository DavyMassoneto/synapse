import { beforeEach, describe, expect, test } from "vitest"
import { type AdvisorService } from "../internal"
import { serviceFor, TestStorage } from "./doubles"

let storage: TestStorage
let advisor: AdvisorService

function prepare(): void {
  storage = new TestStorage()
  advisor = serviceFor(storage)
}

function invalidModelDoesNotSave(): void {
  expect(advisor.configuration.selectModel("invalid").kind).toBe("failure")
  expect(storage.saves).toBe(0)
}

function invalidThinkingDoesNotSave(): void {
  expect(advisor.configuration.setThinking("invalid").kind).toBe("failure")
  expect(storage.saves).toBe(0)
}

function failedSavePreservesState(): void {
  const failingStorage = new TestStorage()
  failingStorage.model = "provider/original"
  failingStorage.failSave = true
  const failingAdvisor = serviceFor(failingStorage)
  expect(failingStorage.loads).toBe(1)
  expect(failingAdvisor.configuration.selectModel("provider/novo").kind).toBe("failure")
  expect(failingAdvisor.configuration.status()).toStrictEqual({
    kind: "success",
    config: { model: "provider/original", thinking: "low" },
  })
}

function registerTests(): void {
  beforeEach(prepare)
  test("modelo inválido não é salvo", invalidModelDoesNotSave)
  test("nível inválido não é salvo", invalidThinkingDoesNotSave)
  test("falha de persistência preserva a configuração anterior", failedSavePreservesState)
}

describe("configuração advisor", registerTests)
