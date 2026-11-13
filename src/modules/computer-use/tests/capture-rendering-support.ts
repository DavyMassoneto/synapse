import { type ComputerCaptureRenderOptions } from "../internal"
import { type ComputerElement } from "../public"

export const COMPUTER_IMAGE_RENDER_OPTIONS: ComputerCaptureRenderOptions = {
  sessionId: "sessao",
  modelSupportsImages: true,
}

export const COMPUTER_TEXT_RENDER_OPTIONS: ComputerCaptureRenderOptions = {
  sessionId: "sessao",
  modelSupportsImages: false,
}

export const COMPUTER_OTHER_SESSION_OPTIONS: ComputerCaptureRenderOptions = {
  sessionId: "outra",
  modelSupportsImages: true,
}

export function makeComputerRepeatedElement(): ComputerElement {
  return { index: 1, role: "AXButton", label: "Nome", app: "Editor", bounds: { kind: "bounds-absent" } }
}
