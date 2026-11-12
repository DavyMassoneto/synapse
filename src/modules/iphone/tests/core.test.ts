import { describe, expect, test } from "vitest"
import {
  buildIphoneCapabilities,
  buildIphoneDrag,
  buildIphonePageDrag,
  buildIphonePress,
  checkIphoneHostSupport,
  findIphoneElement,
  parseIphoneElementTree,
  readIphoneHomeLayout,
} from "#synapse/modules/iphone/internal"
import { type IphoneConfiguration, type IphoneElement } from "#synapse/modules/iphone/public/contracts"

function makeSut(): IphoneConfiguration {
  return {
    serverUrl: "http://localhost:4723",
    target: { kind: "device", udid: "abc", deviceName: "iPhone", platformVersion: "18", wdaInstalled: true },
    xcodeOrgId: "team",
  }
}

function supportsDevice(): void {
  expect(checkIphoneHostSupport("linux", makeSut().target).kind).toBe("accepted")
}

function rejectsSimulator(): void {
  expect(checkIphoneHostSupport("win32", { kind: "simulator", deviceName: "sim", wdaInstalled: false })).toMatchObject({
    kind: "refused",
    message: expect.stringContaining("macOS"),
  })
}

function rejectsLinuxSimulator(): void {
  expect(checkIphoneHostSupport("linux", { kind: "simulator", deviceName: "sim", wdaInstalled: false })).toMatchObject({
    kind: "refused",
    message: expect.stringContaining("macOS"),
  })
}

function rejectsMissingVersion(): void {
  expect(
    checkIphoneHostSupport("linux", { kind: "device", udid: "abc", deviceName: "phone", wdaInstalled: true }),
  ).toMatchObject({ kind: "refused", message: expect.stringContaining("platformVersion") })
}

function rejectsMissingWda(): void {
  expect(
    checkIphoneHostSupport("linux", {
      kind: "device",
      udid: "abc",
      deviceName: "phone",
      platformVersion: "18",
      wdaInstalled: false,
    }),
  ).toMatchObject({ kind: "refused", message: expect.stringContaining("WebDriverAgent") })
}

function rejectsDiscovery(): void {
  expect(
    checkIphoneHostSupport("linux", { kind: "device", udid: "", deviceName: "phone", wdaInstalled: true }),
  ).toMatchObject({
    kind: "refused",
    message: expect.stringContaining("udid"),
  })
}

function omitsSigning(): void {
  expect(buildIphoneCapabilities(makeSut(), "linux")).not.toHaveProperty("appium:xcodeOrgId")
}

function includesSigning(): void {
  expect(buildIphoneCapabilities(makeSut(), "darwin")).toHaveProperty("appium:xcodeOrgId", "team")
}

function parsesElement(): void {
  const result = parseIphoneElementTree('<XCUIElementTypeButton label="Olá" x="1" y="2" width="10" height="20"/>', 10)
  expect(result).toMatchObject({ kind: "accepted", tree: { elements: [{ label: "Olá" }] } })
}

function ignoresInvalidElement(): void {
  expect(parseIphoneElementTree('<XCUIElementTypeButton label="Olá"/>', 10)).toMatchObject({
    kind: "accepted",
    tree: { elements: [] },
  })
}

function ignoresMalformed(): void {
  expect(parseIphoneElementTree("<XCUIElementTypeButton", 10).kind).toBe("refused")
}

function rejectsMissingText(): void {
  expect(findIphoneElement([], "ausente").kind).toBe("missing")
}

function buildsDrag(): void {
  expect(
    buildIphoneDrag({
      from: { x: 1, y: 2 },
      destination: { x: 40, y: 40 },
      holdMs: 500,
      liftDistance: 14,
      liftMs: 250,
      moveMs: 30,
      hoverMs: 500,
    }).kind,
  ).toBe("accepted")
}

function buildsPageDrag(): void {
  const result = buildIphonePageDrag({
    drag: {
      from: { x: 100, y: 100 },
      destination: { x: 200, y: 200 },
      holdMs: 500,
      liftDistance: 14,
      liftMs: 250,
      moveMs: 30,
      hoverMs: 500,
    },
    edge: "right",
    viewportWidth: 440,
    flips: 1,
    flipWaitMs: 850,
  })
  expect(result.kind).toBe("accepted")
}

function rejectsDrag(): void {
  expect(
    buildIphoneDrag({
      from: { x: -1, y: 2 },
      destination: { x: 40, y: 40 },
      holdMs: 500,
      liftDistance: 14,
      liftMs: 250,
      moveMs: 30,
      hoverMs: 500,
    }).kind,
  ).toBe("refused")
}

function buildsPress(): void {
  expect(buildIphonePress({ x: 1, y: 2 }, 1000).kind).toBe("accepted")
}

function rejectsViewport(): void {
  expect(readIphoneHomeLayout({ viewport: { x: 1, y: 2 }, elements: [] }).kind).toBe("refused")
}

function coversWidget(): void {
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
  expect(result.kind).toBe("accepted")
  if (result.kind === "accepted") {
    expect(result.layout.vacantSlots).not.toContain(0)
  }
}

function suite(): void {
  test("aceita aparelho", supportsDevice)
  test("recusa simulador no Windows", rejectsSimulator)
  test("recusa simulador no Linux", rejectsLinuxSimulator)
  test("recusa versão ausente", rejectsMissingVersion)
  test("recusa WDA ausente", rejectsMissingWda)
  test("recusa descoberta fora do macOS", rejectsDiscovery)
  test("omite assinatura fora do macOS", omitsSigning)
  test("inclui assinatura no macOS", includesSigning)
  test("lê elemento", parsesElement)
  test("ignora elemento sem retângulo", ignoresInvalidElement)
  test("ignora XML malformado", ignoresMalformed)
  test("busca sem resultado", rejectsMissingText)
  test("monta arrasto", buildsDrag)
  test("monta virada de página", buildsPageDrag)
  test("recusa arrasto inválido", rejectsDrag)
  test("monta pressão", buildsPress)
  test("recusa viewport", rejectsViewport)
  test("reserva posições de widget", coversWidget)
}

describe("núcleo iPhone", suite)
