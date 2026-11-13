import { Value } from "typebox/value"
import { describe, expect, test } from "vitest"
import {
  iphoneConfigurationChanges,
  PI_IPHONE_PARAMETERS,
  type PiIphoneInput,
  PiIphoneTool,
} from "#synapse/integration"
import { fixtureModel, IphoneToolModule } from "../fixtures"

async function rejectsUnknownAlert(): Promise<void> {
  const iphone = new IphoneToolModule()
  const input: PiIphoneInput = { action: "alert", alert_action: "dismis" }
  expect(Value.Check(PI_IPHONE_PARAMETERS, input)).toBe(false)
  await expect(
    new PiIphoneTool(iphone).execute("id", input, new AbortController().signal, undefined, { model: undefined }),
  ).rejects.toThrow()
  expect(iphone.actions).toEqual([])
}

async function acceptsDismiss(): Promise<void> {
  const iphone = new IphoneToolModule()
  await new PiIphoneTool(iphone).execute(
    "id",
    { action: "alert", alert_action: "dismiss" },
    new AbortController().signal,
    undefined,
    { model: undefined },
  )
  expect(iphone.actions).toEqual([{ kind: "alert", action: "dismiss" }])
}

async function rejectsInvalidTreeAfter(): Promise<void> {
  const iphone = new IphoneToolModule()
  await expect(
    new PiIphoneTool(iphone).execute(
      "id",
      { action: "tap", x: 10, y: 20, tree_after: true, max: 0 },
      new AbortController().signal,
      undefined,
      { model: undefined },
    ),
  ).rejects.toThrow()
  expect(iphone.actions).toEqual([])
}

async function preservesVisualIndices(): Promise<void> {
  const iphone = new IphoneToolModule()
  const tool = new PiIphoneTool(iphone)
  const model = fixtureModel("fake", "image", 100000)
  model.input = ["text", "image"]
  const result = await tool.execute("id", { action: "tree" }, new AbortController().signal, undefined, { model })
  expect(result.content).toMatchObject([{ type: "text" }, { type: "image" }])
  await tool.execute("id", { action: "tap", element: 1 }, new AbortController().signal, undefined, { model })
  expect(iphone.actions.map(actionKind)).toEqual(["screenshot", "tree"])
  expect(iphone.targets).toHaveLength(1)
}

async function preservesVisualTextSelection(): Promise<void> {
  const iphone = new IphoneToolModule()
  const tool = new PiIphoneTool(iphone)
  const model = fixtureModel("fake", "image", 100000)
  model.input = ["text", "image"]
  await tool.execute("id", { action: "tree" }, new AbortController().signal, undefined, { model })
  await tool.execute("id", { action: "tap", text: "Teste" }, new AbortController().signal, undefined, { model })
  expect(iphone.targets).toHaveLength(1)
}

async function preservesTreeAfterIndices(): Promise<void> {
  const iphone = new IphoneToolModule()
  const tool = new PiIphoneTool(iphone)
  const model = fixtureModel("fake", "image", 100000)
  model.input = ["text", "image"]
  await tool.execute("id", { action: "tap", x: 10, y: 20, tree_after: true }, new AbortController().signal, undefined, {
    model,
  })
  await tool.execute("id", { action: "tap", element: 1 }, new AbortController().signal, undefined, { model })
  expect(iphone.actions.map(actionKind)).toEqual(["tap", "screenshot", "tree"])
  expect(iphone.targets).toHaveLength(1)
}

async function toleratesOptionalCaptureFailure(): Promise<void> {
  const iphone = new IphoneToolModule()
  iphone.failScreenshot = true
  const tool = new PiIphoneTool(iphone)
  const model = fixtureModel("fake", "image", 100000)
  model.input = ["text", "image"]
  const result = await tool.execute("id", { action: "tree" }, new AbortController().signal, undefined, { model })
  expect(result.isError).toBe(false)
  await tool.execute("id", { action: "tap", element: 1 }, new AbortController().signal, undefined, { model })
  expect(iphone.targets).toHaveLength(1)
}

function acceptsEscapedConfiguration(): void {
  expect(iphoneConfigurationChanges('config deviceName="iPhone \\"Pro\\""')).toEqual([
    { key: "deviceName", value: 'iPhone "Pro"' },
  ])
}

function rejectsUnquotedSpaces(): void {
  expect(iphoneConfigurationChanges.bind(undefined, "config deviceName=iPhone Pro")).toThrow()
}

function actionKind(action: Parameters<IphoneToolModule["execute"]>[0]): string {
  return action.kind
}

async function reportsCompletedAction(): Promise<void> {
  const iphone = new IphoneToolModule()
  iphone.failTree = true
  const result = await new PiIphoneTool(iphone).execute(
    "id",
    { action: "tap", x: 10, y: 20, tree_after: true },
    new AbortController().signal,
    undefined,
    { model: undefined },
  )
  expect(result.details.completed).toEqual({ kind: "text", text: "done" })
  expect(result.content).toMatchObject([{ type: "text", text: expect.stringContaining("A ação foi concluída") }])
  expect(result.isError).toBe(true)
  expect(iphone.actions.map(actionKind)).toEqual(["tap", "tree"])
}

async function propagatesCaptureCancellation(): Promise<void> {
  const iphone = new IphoneToolModule()
  iphone.cancelScreenshot = true
  const model = fixtureModel("fake", "image", 100000)
  model.input = ["text", "image"]
  await expect(
    new PiIphoneTool(iphone).execute("id", { action: "tree" }, new AbortController().signal, undefined, { model }),
  ).rejects.toMatchObject({ name: "AbortError" })
  expect(iphone.actions.map(actionKind)).toEqual(["screenshot"])
}

async function preservesActionAfterCaptureCancellation(): Promise<void> {
  const iphone = new IphoneToolModule()
  iphone.cancelScreenshot = true
  const model = fixtureModel("fake", "image", 100000)
  model.input = ["text", "image"]
  const result = await new PiIphoneTool(iphone).execute(
    "id",
    { action: "tap", x: 10, y: 20, tree_after: true },
    new AbortController().signal,
    undefined,
    { model },
  )
  expect(result.details.completed).toEqual({ kind: "text", text: "done" })
  expect(result.content).toMatchObject([{ type: "text", text: expect.stringContaining("Não repita a ação") }])
  expect(iphone.actions.map(actionKind)).toEqual(["tap", "screenshot"])
}

async function preservesActionAfterTreeCancellation(): Promise<void> {
  const iphone = new IphoneToolModule()
  iphone.cancelTree = true
  const result = await new PiIphoneTool(iphone).execute(
    "id",
    { action: "tap", x: 10, y: 20, tree_after: true },
    new AbortController().signal,
    undefined,
    { model: undefined },
  )
  expect(result.details.completed).toEqual({ kind: "text", text: "done" })
  expect(result.content).toMatchObject([{ type: "text", text: expect.stringContaining("Não repita a ação") }])
  expect(iphone.actions.map(actionKind)).toEqual(["tap", "tree"])
}

async function abortBeforeActionHasNoEffect(): Promise<void> {
  const iphone = new IphoneToolModule()
  await expect(
    new PiIphoneTool(iphone).execute(
      "id",
      { action: "tap", x: 10, y: 20, tree_after: true },
      AbortSignal.abort(),
      undefined,
      { model: undefined },
    ),
  ).rejects.toMatchObject({ name: "AbortError" })
  expect(iphone.actions).toEqual([])
}

function acceptsQuotedConfiguration(): void {
  expect(
    iphoneConfigurationChanges(
      'config deviceName="iPhone 16 Pro" xcodeSigningId="iPhone Developer" appiumHome="/Volumes/SSD Externo/tools"',
    ),
  ).toEqual([
    { key: "deviceName", value: "iPhone 16 Pro" },
    { key: "xcodeSigningId", value: "iPhone Developer" },
    { key: "appiumHome", value: "/Volumes/SSD Externo/tools" },
  ])
}

function rejectsUnclosedConfiguration(): void {
  expect(iphoneConfigurationChanges.bind(undefined, 'config deviceName="iPhone 16 Pro')).toThrow()
}

function suite(): void {
  test("recusa alert_action desconhecido antes de agir", rejectsUnknownAlert)
  test("aceita dismiss explícito", acceptsDismiss)
  test("recusa max inválido antes da ação tree_after", rejectsInvalidTreeAfter)
  test("árvore visual preserva seleção por índice", preservesVisualIndices)
  test("árvore visual preserva seleção por texto", preservesVisualTextSelection)
  test("tree_after visual preserva índices novos", preservesTreeAfterIndices)
  test("falha de captura opcional ainda preserva índices", toleratesOptionalCaptureFailure)
  test("config aceita escape JSON", acceptsEscapedConfiguration)
  test("config recusa espaços sem aspas", rejectsUnquotedSpaces)
  test("falha de leitura mantém evidência da ação concluída", reportsCompletedAction)
  test("cancelamento da captura não inicia árvore", propagatesCaptureCancellation)
  test("ação confirmada preservada se captura cancela", preservesActionAfterCaptureCancellation)
  test("ação confirmada preservada se árvore cancela", preservesActionAfterTreeCancellation)
  test("abort antes da ação não tem efeito", abortBeforeActionHasNoEffect)
  test("config aceita espaços com strings JSON", acceptsQuotedConfiguration)
  test("config recusa aspas sem fechamento", rejectsUnclosedConfiguration)
}

describe("validação antecipada iPhone sem servidor", suite)
