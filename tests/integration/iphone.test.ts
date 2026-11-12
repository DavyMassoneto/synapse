import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { PI_IPHONE_PARAMETERS, PiIphoneCommand, PiIphoneTool, registerIphone } from "#synapse/integration"
import {
  cleanupIphoneScenario,
  fixtureModel,
  IphoneFixtureHost,
  IphoneFixtureUI,
  type IphoneIntegrationSut,
  iphoneIntegrationScenario,
} from "../fixtures"

async function readsTree(): Promise<void> {
  const tool = new PiIphoneTool(sut.iphone)
  const result = await tool.execute("id", { action: "tree" }, new AbortController().signal, undefined, {
    model: undefined,
  })
  expect(result.content).toMatchObject([{ type: "text", text: expect.stringContaining("Teste") }])
}

async function refusesImage(): Promise<void> {
  const result = await new PiIphoneTool(sut.iphone).execute(
    "id",
    { action: "screenshot" },
    new AbortController().signal,
    undefined,
    { model: undefined },
  )
  expect(result.isError).toBe(true)
  expect(sut.server.paths).toEqual([])
}

async function rejectsArguments(): Promise<void> {
  await expect(
    new PiIphoneTool(sut.iphone).execute("id", { action: "tap" }, new AbortController().signal, undefined, {
      model: undefined,
    }),
  ).rejects.toThrow("Argumentos inválidos")
  expect(sut.server.paths).toEqual([])
}

async function cancels(): Promise<void> {
  await expect(
    new PiIphoneTool(sut.iphone).execute("id", { action: "tree" }, AbortSignal.abort(), undefined, {
      model: undefined,
    }),
  ).rejects.toMatchObject({ name: "AbortError" })
  expect(sut.server.paths).toEqual([])
}

async function closesOnce(): Promise<void> {
  await sut.iphone.execute({ kind: "tree", max: 200 }, new AbortController().signal)
  await sut.iphone.shutdown()
  await sut.iphone.shutdown()
  expect(sut.server.paths.filter((path) => path === "/session/fake")).toHaveLength(1)
}

async function diagnoses(): Promise<void> {
  const ui = new IphoneFixtureUI()
  await new PiIphoneCommand(sut.iphone).handle("doctor", { ui })
  expect(ui.messages).toEqual([expect.stringContaining('"server":{"kind":"ok"}')])
}

async function refusesMissingUdid(): Promise<void> {
  writeFileSync(
    join(sut.directory, "iphone.json"),
    JSON.stringify({
      serverUrl: "http://127.0.0.1:1",
      target: "device",
      deviceName: "Fake",
      platformVersion: "26.0",
      wdaInstalled: true,
    }),
  )
  await expect(sut.iphone.execute({ kind: "tree", max: 200 }, new AbortController().signal)).rejects.toThrow(/udid/)
  expect(sut.server.paths).toEqual([])
}

async function refusesSimulatorHost(): Promise<void> {
  writeFileSync(
    join(sut.directory, "iphone.json"),
    JSON.stringify({
      serverUrl: "http://127.0.0.1:1",
      target: "simulator",
      deviceName: "Fake",
      wdaInstalled: true,
    }),
  )
  await expect(sut.iphone.execute({ kind: "tree", max: 200 }, new AbortController().signal)).rejects.toThrow()
  expect(sut.server.paths).toEqual([])
}

async function treeIncludesImage(): Promise<void> {
  const model = fixtureModel("fake", "image-model", 100000)
  model.input = ["text", "image"]
  const result = await new PiIphoneTool(sut.iphone).execute(
    "id",
    { action: "tree" },
    new AbortController().signal,
    undefined,
    { model },
  )
  expect(result.content).toMatchObject([{ type: "text" }, { type: "image", data: "base64" }])
}

async function tapsElement(): Promise<void> {
  const tool = new PiIphoneTool(sut.iphone)
  await tool.execute("id", { action: "tree" }, new AbortController().signal, undefined, { model: undefined })
  const result = await tool.execute("id", { action: "tap", element: 1 }, new AbortController().signal, undefined, {
    model: undefined,
  })
  expect(result.isError).toBe(false)
  expect(sut.server.paths).toContain("/session/fake/actions")
}

async function registersHost(): Promise<void> {
  const host = new IphoneFixtureHost()
  registerIphone(host, sut.iphone)
  expect(host.requireTool().name).toBe("iphone")
  expect(host.requireTool().parameters).toBe(PI_IPHONE_PARAMETERS)
  expect(host.shutdownHandler).toBeDefined()
  expect(host.command).toBeDefined()
}

function schema(): void {
  expect(PI_IPHONE_PARAMETERS.properties.action.anyOf).toContainEqual(expect.objectContaining({ const: "tree" }))
  expect(PI_IPHONE_PARAMETERS.properties.tree_after).toBeDefined()
}

function suite(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("árvore inclui captura quando modelo aceita imagem", treeIncludesImage)
  test("resolve índice da última árvore no núcleo", tapsElement)
  test("registra ferramenta, comando e shutdown", registersHost)
  test("árvore retorna texto pelo WebDriver falso", readsTree)
  test("modelo sem imagem recusa captura sem acesso ao servidor", refusesImage)
  test("argumentos inválidos não acessam servidor", rejectsArguments)
  test("cancelamento propaga sem acesso ao servidor", cancels)
  test("shutdown encerra sessão uma única vez", closesOnce)
  test("diagnóstico verifica servidor falso", diagnoses)
  test("recusa aparelho sem UDID explícito", refusesMissingUdid)
  test("recusa simulador fora do macOS", refusesSimulatorHost)
  test("esquema contém campos da ferramenta original", schema)
}

describe("integração iPhone", suite)

let sut: IphoneIntegrationSut

async function prepare(): Promise<void> {
  sut = await iphoneIntegrationScenario()
}

async function cleanup(): Promise<void> {
  await cleanupIphoneScenario(sut)
}
