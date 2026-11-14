import {
  COMPUTER_BOUNDS_ABSENT,
  COMPUTER_BOUNDS_KNOWN,
  COMPUTER_IMAGE_ABSENT,
  COMPUTER_IMAGE_PRESENT,
  COMPUTER_PNG_MIME,
  type ComputerApplication,
  type ComputerElement,
  type ComputerImage,
  type ComputerImageMime,
  type ComputerWindow,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_DIMENSIONS_FOUND, computerReadImageDimensions } from "../image-dimensions"
import { COMPUTER_RESPONSE_BASE64_ENCODING, COMPUTER_RESPONSE_LABEL_PROPERTY } from "./constants"
import { type ComputerRawApp, type ComputerRawElement, type ComputerRawState, type ComputerRawWindow } from "./types"

export function computerConvertDriverWindow(window: ComputerRawWindow): ComputerWindow {
  return {
    app: window.app_name,
    pid: window.pid,
    windowId: window.window_id,
    onScreen: window.is_on_screen,
    title: window.title,
    zIndex: window.z_index,
    bounds: window.bounds
      ? { kind: COMPUTER_BOUNDS_KNOWN, rectangle: window.bounds }
      : { kind: COMPUTER_BOUNDS_ABSENT },
  }
}

export function computerConvertDriverApp(app: ComputerRawApp): ComputerApplication {
  const aliases: string[] = []
  if (app.bundle_id) {
    aliases.push(app.bundle_id)
  }
  return { name: app.name, pid: app.pid, running: app.running, aliases }
}

export function computerConvertDriverElement(element: ComputerRawElement): ComputerElement {
  const result: ComputerElement = {
    index: element.element_index,
    role: element.role,
    bounds: { kind: COMPUTER_BOUNDS_ABSENT },
  }
  if (COMPUTER_RESPONSE_LABEL_PROPERTY in element) {
    result.label = element.label
  }
  if (element.frame) {
    result.bounds = {
      kind: COMPUTER_BOUNDS_KNOWN,
      rectangle: { x: element.frame.x, y: element.frame.y, width: element.frame.w, height: element.frame.h },
    }
  }
  if (element.element_token) {
    result.token = element.element_token
  }
  return result
}

export function computerConvertDriverImage(data: string, mime: ComputerImageMime): ComputerImage {
  const dimensions = computerReadImageDimensions(Buffer.from(data, COMPUTER_RESPONSE_BASE64_ENCODING))
  if (dimensions.kind === COMPUTER_DIMENSIONS_FOUND) {
    return {
      kind: COMPUTER_IMAGE_PRESENT,
      data,
      mime,
      width: dimensions.width,
      height: dimensions.height,
    }
  }
  return { kind: COMPUTER_IMAGE_ABSENT }
}

export function computerImageFromDriverState(state: ComputerRawState): ComputerImage {
  if (state.screenshot_png_b64) {
    let mime: ComputerImageMime = COMPUTER_PNG_MIME
    if (state.screenshot_mime_type) {
      mime = state.screenshot_mime_type
    }
    return computerConvertDriverImage(state.screenshot_png_b64, mime)
  }
  return { kind: COMPUTER_IMAGE_ABSENT }
}
