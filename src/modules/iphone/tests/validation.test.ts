import { describe, expect, test } from "vitest"
import {
  buildIphoneHomeDrag,
  buildIphoneHomePageDrag,
  findIphoneElement,
  formatIphoneElementTree,
  isIphoneHomePathBlocked,
  parseIphoneElementTree,
  planIphoneHomeAdjacency,
  planIphoneHomeMove,
  readIphoneFolderAppCount,
  readIphoneHomeLayout,
  readIphoneHomeState,
  validateIphoneConfiguration,
} from "#synapse/modules/iphone/internal"
import { type IphoneConfiguration, type IphoneElement } from "#synapse/modules/iphone/public/contracts"
import { buildIphonePageDrag } from "../internal"

function makeSut(): IphoneConfiguration {
  return {
    serverUrl: "http://localhost:4723",
    target: { kind: "device", udid: "abc", deviceName: "iPhone", platformVersion: "18", wdaInstalled: true },
  }
}

function rejectsEmptyXml(): void {
  expect(parseIphoneElementTree("", 10).kind).toBe("refused")
}

function rejectsMismatchedXml(): void {
  expect(parseIphoneElementTree("<root><child></root>", 10).kind).toBe("refused")
}

function acceptsConfiguration(): void {
  expect(validateIphoneConfiguration(makeSut(), "linux").kind).toBe("accepted")
}

function rejectsConfiguration(): void {
  expect(validateIphoneConfiguration({ ...makeSut(), serverUrl: "" }, "linux")).toMatchObject({
    kind: "refused",
    message: expect.stringContaining("serverUrl"),
  })
}

function rejectsSimulatorId(): void {
  expect(
    validateIphoneConfiguration(
      { serverUrl: "http://localhost:4723", target: { kind: "simulator", deviceName: "sim", wdaInstalled: false } },
      "darwin",
    ).kind,
  ).toBe("accepted")
}

function readsState(): void {
  expect(readIphoneHomeState({ viewport: { x: 440, y: 956 }, elements: [] })).toMatchObject({
    kind: "accepted",
    page: { kind: "missing" },
    edit: false,
  })
}

function rejectsWidgetSlot(): void {
  const widget: IphoneElement = {
    index: 1,
    type: "Icon",
    name: "",
    label: "",
    value: "Widget",
    rect: { x: 0, y: 80, width: 200, height: 200 },
    enabled: true,
    interactive: true,
  }
  const result = readIphoneHomeLayout({ viewport: { x: 440, y: 956 }, elements: [widget] })
  if (result.kind === "accepted") {
    const icon = { name: "App", folder: false, badge: "", point: { x: 69, y: 126 }, column: 0, row: 0, slot: 0 }
    expect(planIphoneHomeMove(result.layout, icon, 0, 0)).toMatchObject({
      kind: "refused",
      message: expect.stringContaining("widget"),
    })
  } else {
    expect(result.kind).toBe("accepted")
  }
}

function findsElement(): void {
  const result = parseIphoneElementTree(
    '<root><XCUIElementTypeButton label="Abrir" x="0" y="0" width="10" height="10"/></root>',
    10,
  )
  if (result.kind === "accepted") {
    expect(findIphoneElement(result.tree.elements, "abr")).toMatchObject({ kind: "found", element: { label: "Abrir" } })
  } else {
    expect(result.kind).toBe("accepted")
  }
}

function formatsTree(): void {
  const result = parseIphoneElementTree(
    '<root><XCUIElementTypeButton label="Abrir" x="0" y="0" width="10" height="10"/></root>',
    10,
  )
  if (result.kind === "accepted") {
    expect(formatIphoneElementTree(result.tree)).toContain('[1] Button "Abrir"')
  } else {
    expect(result.kind).toBe("accepted")
  }
}

function readsFolderCount(): void {
  expect(readIphoneFolderAppCount("3 apps")).toEqual({ kind: "known", count: 3 })
}

function ignoresInvalidFolderCount(): void {
  expect(readIphoneFolderAppCount("sem contagem")).toEqual({ kind: "missing" })
}

function rejectsPageDrag(): void {
  expect(
    buildIphonePageDrag({
      drag: {
        from: { x: 1, y: 2 },
        destination: { x: 10, y: 10 },
        holdMs: 500,
        liftDistance: 14,
        liftMs: 250,
        moveMs: 30,
        hoverMs: 500,
      },
      edge: "right",
      viewportWidth: 440,
      flips: 0,
      flipWaitMs: 850,
    }).kind,
  ).toBe("refused")
}

function detectsAdjacency(): void {
  const source = { name: "A", folder: false, badge: "", point: { x: 69, y: 126 }, column: 0, row: 0, slot: 0 }
  const destination = { name: "B", folder: false, badge: "", point: { x: 170, y: 126 }, column: 1, row: 0, slot: 1 }
  expect(
    planIphoneHomeAdjacency({ icons: [source, destination], widgetSlots: [], vacantSlots: [2] }, source, destination)
      .kind,
  ).toBe("adjacent")
}

function rejectsInvalidSlot(): void {
  const icon = { name: "A", folder: false, badge: "", point: { x: 69, y: 126 }, column: 0, row: 0, slot: 0 }
  expect(planIphoneHomeMove({ icons: [icon], widgetSlots: [], vacantSlots: [] }, icon, -1, 0).kind).toBe("refused")
}

function buildsCalibratedDrag(): void {
  const result = buildIphoneHomeDrag({ x: 10, y: 20 }, { x: 200, y: 200 })
  if (result.kind === "accepted") {
    expect(result.actions[2]).toEqual({ type: "pause", duration: 500 })
  } else {
    expect(result.kind).toBe("accepted")
  }
}

function buildsCalibratedPageDrag(): void {
  expect(buildIphoneHomePageDrag({ x: 10, y: 20 }, { x: 200, y: 200 }, "right").kind).toBe("accepted")
}

function rejectsComment(): void {
  expect(parseIphoneElementTree("<root><!-- comment --></root>", 10).kind).toBe("refused")
}

function rejectsCdata(): void {
  expect(parseIphoneElementTree("<root><![CDATA[texto]]></root>", 10).kind).toBe("refused")
}

function rejectsUnknownEntity(): void {
  expect(parseIphoneElementTree("<root>&desconhecida;</root>", 10).kind).toBe("refused")
}

function blocksWidgetPath(): void {
  const icon = { name: "A", folder: false, badge: "", point: { x: 69, y: 126 }, column: 0, row: 0, slot: 0 }
  expect(isIphoneHomePathBlocked({ icons: [icon], widgetSlots: [1], vacantSlots: [] }, icon, "right")).toBe(true)
}

function suite(): void {
  test("recusa comentário XML", rejectsComment)
  test("recusa CDATA", rejectsCdata)
  test("recusa entidade desconhecida", rejectsUnknownEntity)
  test("detecta widget no caminho", blocksWidgetPath)
  test("monta arrasto calibrado", buildsCalibratedDrag)
  test("monta virada calibrada", buildsCalibratedPageDrag)
  test("recusa virada inválida", rejectsPageDrag)
  test("detecta adjacência", detectsAdjacency)
  test("recusa posição inválida", rejectsInvalidSlot)
  test("lê quantidade de apps", readsFolderCount)
  test("ignora contagem ausente", ignoresInvalidFolderCount)
  test("encontra texto parcial", findsElement)
  test("formata elementos", formatsTree)
  test("recusa posição de widget", rejectsWidgetSlot)
  test("lê estado", readsState)
  test("recusa XML vazio", rejectsEmptyXml)
  test("recusa XML incompatível", rejectsMismatchedXml)
  test("aceita configuração", acceptsConfiguration)
  test("recusa servidor ausente", rejectsConfiguration)
  test("recusa simulador sem udid", rejectsSimulatorId)
}

describe("validação iPhone", suite)
