import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { PiIphoneCommand } from "#synapse/integration"
import {
  cleanupIphoneScenario,
  IphoneFixtureUI,
  type IphoneIntegrationSut,
  iphoneIntegrationScenario,
} from "../fixtures"

async function resetsSession(): Promise<void> {
  await sut.iphone.execute({ kind: "tree", max: 200 }, new AbortController().signal)
  const ui = new IphoneFixtureUI()
  await new PiIphoneCommand(sut.iphone).handle("reset", { ui })
  expect(sut.server.paths.filter((path) => path === "/session/fake")).toHaveLength(1)
  expect(ui.messages).toEqual(["Sessão encerrada."])
}

async function showsConfiguration(): Promise<void> {
  const ui = new IphoneFixtureUI()
  await new PiIphoneCommand(sut.iphone).handle("config", { ui })
  expect(ui.messages).toEqual([expect.stringContaining('"serverUrl"')])
  expect(sut.server.paths).toEqual([])
}

async function rejectsUnknownCommand(): Promise<void> {
  const ui = new IphoneFixtureUI()
  await new PiIphoneCommand(sut.iphone).handle("invalid", { ui })
  expect(ui.messages).toEqual([expect.stringContaining("Use /iphone")])
  expect(sut.server.paths).toEqual([])
}

async function writesConfiguration(): Promise<void> {
  const ui = new IphoneFixtureUI()
  await new PiIphoneCommand(sut.iphone).handle("config deviceName=Updated", { ui })
  expect(sut.iphone.configuration().deviceName).toBe("Updated")
  expect(ui.messages).toEqual(["Configuração atualizada."])
}

async function refusesConfigurationKey(): Promise<void> {
  const ui = new IphoneFixtureUI()
  await expect(new PiIphoneCommand(sut.iphone).handle("config invalid=value", { ui })).rejects.toThrow()
  expect(ui.messages).toEqual([])
}

function suite(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("config grava mudança pelo núcleo", writesConfiguration)
  test("config recusa chave desconhecida", refusesConfigurationKey)
  test("reset encerra somente a sessão", resetsSession)
  test("config consulta o núcleo", showsConfiguration)
  test("comando desconhecido não acessa servidor", rejectsUnknownCommand)
}

describe("comando iPhone", suite)

let sut: IphoneIntegrationSut

async function prepare(): Promise<void> {
  sut = await iphoneIntegrationScenario()
}

async function cleanup(): Promise<void> {
  await cleanupIphoneScenario(sut)
}
