import { describe, expect, test } from "vitest"
import {
  COMPUTER_RENDER_DEDUP_MAX_STREAK,
  COMPUTER_RENDER_MAX_ELEMENTS,
  COMPUTER_RENDER_MAX_LABEL_CHARS,
  ComputerCaptureRenderer,
} from "../internal"
import {
  COMPUTER_IMAGE_RENDER_OPTIONS,
  COMPUTER_OTHER_SESSION_OPTIONS,
  COMPUTER_TEXT_RENDER_OPTIONS,
  makeComputerRepeatedElement,
} from "./capture-rendering-support"
import { ComputerTestCaptureStorage } from "./doubles"
import { computerTestCapture } from "./support"

function makeSut(): ComputerCaptureRenderer {
  return new ComputerCaptureRenderer(new ComputerTestCaptureStorage())
}

function image(): void {
  expect(makeSut().render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS).image.kind).toBe("image-included")
}

function repeated(): void {
  const sut = makeSut()
  sut.render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS)
  expect(sut.render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS).image.kind).toBe("image-omitted")
}

function streakLimit(): void {
  const sut = makeSut()
  for (let index = 0; index <= COMPUTER_RENDER_DEDUP_MAX_STREAK; index++) {
    sut.render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS)
  }
  expect(sut.render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS).image.kind).toBe("image-included")
}

function reset(): void {
  const sut = makeSut()
  sut.render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS)
  sut.reset()
  expect(sut.render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS).image.kind).toBe("image-included")
}

function separateSessions(): void {
  const sut = makeSut()
  sut.render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS)
  expect(sut.render(computerTestCapture(), COMPUTER_OTHER_SESSION_OPTIONS).image.kind).toBe("image-included")
}

function changedTarget(): void {
  const sut = makeSut()
  sut.render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS)
  const capture = computerTestCapture()
  capture.app = "Browser"
  expect(sut.render(capture, COMPUTER_IMAGE_RENDER_OPTIONS).image.kind).toBe("image-included")
}

function scale(): void {
  expect(makeSut().render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS).scale).toMatchObject({
    kind: "scale-present",
    factor: 2,
  })
}

function truncate(): void {
  const capture = computerTestCapture()
  const element = capture.elements[0]
  if (element) {
    element.label = "a".repeat(COMPUTER_RENDER_MAX_LABEL_CHARS + 1)
    capture.elements = Array.from({ length: COMPUTER_RENDER_MAX_ELEMENTS + 1 }, makeComputerRepeatedElement)
    capture.elements[0] = element
  }
  const rendered = makeSut().render(capture, COMPUTER_IMAGE_RENDER_OPTIONS)
  expect(rendered.elements).toHaveLength(COMPUTER_RENDER_MAX_ELEMENTS)
  expect(rendered.elements[0]?.label).toHaveLength(COMPUTER_RENDER_MAX_LABEL_CHARS)
  expect(rendered.elementsStorage.kind).toBe("capture-stored")
  expect(rendered.summary).toContain(`${COMPUTER_RENDER_MAX_ELEMENTS} de ${COMPUTER_RENDER_MAX_ELEMENTS + 1}`)
}

function absentLabels(): void {
  const capture = computerTestCapture()
  capture.elements = [{ index: 0, role: "AXWindow", bounds: { kind: "bounds-absent" } }]
  const rendered = makeSut().render(capture, COMPUTER_IMAGE_RENDER_OPTIONS)
  expect(rendered.elements[0]).not.toHaveProperty("label")
  expect(rendered.summary).toContain("#0 AXWindow @ ")
  expect(rendered.summary).not.toContain("undefined")
}

function emptyLabel(): void {
  const capture = computerTestCapture()
  capture.elements = [{ index: 0, role: "AXButton", label: "", bounds: { kind: "bounds-absent" } }]
  const rendered = makeSut().render(capture, COMPUTER_IMAGE_RENDER_OPTIONS)
  expect(rendered.elements[0]?.label).toBe("")
  expect(rendered.summary).toContain("#0 AXButton @ ")
}

function textOnly(): void {
  expect(makeSut().render(computerTestCapture(), COMPUTER_TEXT_RENDER_OPTIONS).image.kind).toBe("image-omitted")
}

function textToVision(): void {
  const sut = makeSut()
  sut.render(computerTestCapture(), COMPUTER_TEXT_RENDER_OPTIONS)
  expect(sut.render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS).image.kind).toBe("image-included")
}

function textDoesNotCountAsDelivery(): void {
  const sut = makeSut()
  sut.render(computerTestCapture(), COMPUTER_IMAGE_RENDER_OPTIONS)
  const changed = computerTestCapture()
  if (changed.image.kind === "image-present") {
    changed.image.data = "different pixels"
  }
  sut.render(changed, COMPUTER_TEXT_RENDER_OPTIONS)
  expect(sut.render(changed, COMPUTER_IMAGE_RENDER_OPTIONS).image.kind).toBe("image-included")
}

function tiny(): void {
  const capture = computerTestCapture()
  if (capture.image.kind === "image-present") {
    capture.image.width = 1
  }
  const rendered = makeSut().render(capture, COMPUTER_IMAGE_RENDER_OPTIONS)
  expect(rendered.image.kind).toBe("image-omitted")
  expect(rendered.screenshotStorage.kind).toBe("capture-not-stored")
}

function accessibilityOnly(): void {
  const capture = computerTestCapture()
  capture.mode = "ax"
  expect(makeSut().render(capture, COMPUTER_IMAGE_RENDER_OPTIONS).image.kind).toBe("image-omitted")
}

function register(): void {
  test("inclui imagem", image)
  test("omite imagem repetida", repeated)
  test("reenvia após duas omissões", streakLimit)
  test("reset reenvia pixels", reset)
  test("isola sessões", separateSessions)
  test("alvo diferente recebe imagem", changedTarget)
  test("anota escala nativa", scale)
  test("trunca lista e rótulos salvando originais", truncate)
  test("renderiza elemento zero sem inventar rótulo ausente", absentLabels)
  test("preserva rótulo vazio", emptyLabel)
  test("omite imagem para modelo textual", textOnly)
  test("primeira imagem visual não foi entregue ao modelo textual", textToVision)
  test("captura textual diferente não conta como imagem entregue", textDoesNotCountAsDelivery)
  test("recusa imagem minúscula", tiny)
  test("omite imagem no modo AX", accessibilityOnly)
}

describe("renderização de captura", register)
