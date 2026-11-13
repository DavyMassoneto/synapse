import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { readMemberExtensions } from "#synapse/integration"
import { createTeamExtensionsDirectory, RESPONSE_RULES_TEST_BOM, removeTeamExtensionsDirectory } from "../fixtures"

let directory: string

function prepare(): void {
  directory = createTeamExtensionsDirectory()
}

function cleanup(): void {
  removeTeamExtensionsDirectory(directory)
}

function missingConfig(): void {
  expect(readMemberExtensions(directory)).toStrictEqual([])
}

function validConfig(): void {
  const absolute = join(directory, "externa")
  writeFileSync(join(directory, "agent-team.json"), JSON.stringify({ memberExtensions: ["minha-extensao", absolute] }))
  expect(readMemberExtensions(directory)).toStrictEqual([join(directory, "extensions", "minha-extensao"), absolute])
}

function invalidConfig(): void {
  writeFileSync(join(directory, "agent-team.json"), JSON.stringify({ memberExtensions: [42] }))
  expect(readMemberExtensions.bind(null, directory)).toThrow("Configuração de extensões de membros inválida")
}

function acceptsBomInConfig(): void {
  writeFileSync(
    join(directory, "agent-team.json"),
    `${RESPONSE_RULES_TEST_BOM}${JSON.stringify({ memberExtensions: ["minha-extensao"] })}`,
  )
  expect(readMemberExtensions(directory)).toStrictEqual([join(directory, "extensions", "minha-extensao")])
}

function rejectsInvalidJsonAfterBom(): void {
  writeFileSync(join(directory, "agent-team.json"), `${RESPONSE_RULES_TEST_BOM}{invalido`)
  expect(readMemberExtensions.bind(null, directory)).toThrow("Configuração de extensões de membros inválida")
}

function rejectsParentTraversal(): void {
  writeFileSync(join(directory, "agent-team.json"), JSON.stringify({ memberExtensions: [join("..", "externa")] }))
  expect(readMemberExtensions.bind(null, directory)).toThrow("Configuração de extensões de membros inválida")
}

function rejectsExtensionsDirectory(): void {
  writeFileSync(join(directory, "agent-team.json"), JSON.stringify({ memberExtensions: ["."] }))
  expect(readMemberExtensions.bind(null, directory)).toThrow("Configuração de extensões de membros inválida")
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("configuração ausente não carrega extensões", missingConfig)
  test("resolve nomes e preserva caminhos absolutos", validConfig)
  test("recusa configuração inválida", invalidConfig)
  test("aceita configuração com marca UTF-8", acceptsBomInConfig)
  test("recusa JSON inválido após marca UTF-8", rejectsInvalidJsonAfterBom)
  test("recusa extensão fora do diretório", rejectsParentTraversal)
  test("recusa o próprio diretório de extensões", rejectsExtensionsDirectory)
}

describe("extensões de membros", registerTests)
