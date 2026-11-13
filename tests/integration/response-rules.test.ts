import { writeFileSync } from "node:fs"
import { type ContextEvent } from "@earendil-works/pi-coding-agent"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { registerResponseRules } from "#synapse/integration"
import {
  cleanupResponseRulesScenario,
  expectedResponseRulesResult,
  makeResponseRulesScenario,
  RESPONSE_INTEGRATION_REMINDER,
  RESPONSE_RULES_TEST_BOM,
  type ResponseRulesIntegrationSut,
  ResponseRulesTestHost,
  responseRulesContextEvent,
} from "../fixtures"

let sut: ResponseRulesIntegrationSut

function prepare(): void {
  sut = makeResponseRulesScenario()
}

function cleanup(): void {
  cleanupResponseRulesScenario(sut)
}

function extractsSectionInMiddle(): void {
  writeFileSync(sut.path, "# Instruções\n## Respostas\n  Seja conciso.  \n## Outra\nNão incluir")
  expect(sut.host.emit(responseRulesContextEvent())).toStrictEqual(expectedResponseRulesResult())
}

function extractsFirstSectionAfterBom(): void {
  writeFileSync(sut.path, `${RESPONSE_RULES_TEST_BOM}## Respostas\nSeja conciso.`)
  expect(sut.host.emit(responseRulesContextEvent())).toStrictEqual(expectedResponseRulesResult())
}

function extractsSectionAtEnd(): void {
  writeFileSync(sut.path, "## Respostas\nSeja conciso.")
  expect(sut.host.emit(responseRulesContextEvent())).toStrictEqual(expectedResponseRulesResult())
}

function extractsSectionWithWindowsLineEndings(): void {
  writeFileSync(sut.path, "# Instruções\r\n## Respostas\r\nSeja conciso.\r\n## Outra\r\nNão incluir")
  expect(sut.host.emit(responseRulesContextEvent())).toMatchObject({
    messages: [{ content: [{ text: "Olá" }, { text: RESPONSE_INTEGRATION_REMINDER }] }],
  })
}

function ignoresAbsentSection(): void {
  writeFileSync(sut.path, "## Outra\nSeja conciso.")
  expect(sut.host.emit(responseRulesContextEvent())).toBeUndefined()
}

function ignoresEmptySection(): void {
  writeFileSync(sut.path, "## Respostas\n  \n## Outra\ntexto")
  expect(sut.host.emit(responseRulesContextEvent())).toBeUndefined()
}

function ignoresMissingFile(): void {
  expect(sut.host.emit(responseRulesContextEvent())).toBeUndefined()
}

function propagatesDirectoryReadFailure(): void {
  const host = new ResponseRulesTestHost()
  registerResponseRules(host, sut.directory)
  expect(host.emit.bind(host, responseRulesContextEvent())).toThrow()
}

function appendsToListContent(): void {
  writeFileSync(sut.path, "## Respostas\nSeja conciso.")
  const event: ContextEvent = {
    type: "context",
    messages: [{ role: "user", content: [{ type: "text", text: "Olá" }], timestamp: 0 }],
  }
  expect(sut.host.emit(event)).toStrictEqual(expectedResponseRulesResult())
}

function ignoresContextWithoutUser(): void {
  writeFileSync(sut.path, "## Respostas\nSeja conciso.")
  const event: ContextEvent = { type: "context", messages: [] }
  expect(sut.host.emit(event)).toBeUndefined()
  expect(event.messages).toStrictEqual([])
}

function updatesOnlyLastUserMessage(): void {
  writeFileSync(sut.path, "## Respostas\nSeja conciso.")
  const event: ContextEvent = {
    type: "context",
    messages: [
      { role: "user", content: "Primeira", timestamp: 0 },
      { role: "user", content: "Última", timestamp: 1 },
    ],
  }
  expect(sut.host.emit(event)).toStrictEqual({
    messages: [
      { role: "user", content: "Primeira", timestamp: 0 },
      {
        role: "user",
        timestamp: 1,
        content: [
          { type: "text", text: "Última" },
          { type: "text", text: RESPONSE_INTEGRATION_REMINDER },
        ],
      },
    ],
  })
}

function preservesOriginalEvent(): void {
  writeFileSync(sut.path, "## Respostas\nSeja conciso.")
  const event = responseRulesContextEvent()
  expect(sut.host.emit(event)).toBeDefined()
  expect(event).toStrictEqual({ type: "context", messages: [{ role: "user", content: "Olá", timestamp: 0 }] })
}

function readsFileAgain(): void {
  expect(sut.host.emit(responseRulesContextEvent())).toBeUndefined()
  writeFileSync(sut.path, "## Respostas\nSeja conciso.")
  expect(sut.host.emit(responseRulesContextEvent())).toStrictEqual(expectedResponseRulesResult())
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("extrai seção no meio e acrescenta a conteúdo textual", extractsSectionInMiddle)
  test("extrai primeira seção após marca UTF-8", extractsFirstSectionAfterBom)
  test("extrai seção no fim", extractsSectionAtEnd)
  test("extrai a seção de arquivo com fim de linha do Windows", extractsSectionWithWindowsLineEndings)
  test("ignora seção ausente", ignoresAbsentSection)
  test("ignora seção vazia", ignoresEmptySection)
  test("ignora arquivo ausente", ignoresMissingFile)
  test("propaga falha ao ler diretório", propagatesDirectoryReadFailure)
  test("acrescenta a lista de conteúdo", appendsToListContent)
  test("ignora contexto sem usuário", ignoresContextWithoutUser)
  test("altera apenas a última mensagem de usuário", updatesOnlyLastUserMessage)
  test("preserva o evento original", preservesOriginalEvent)
  test("relê arquivo a cada chamada", readsFileAgain)
}

describe("integração de regras de resposta", registerTests)
