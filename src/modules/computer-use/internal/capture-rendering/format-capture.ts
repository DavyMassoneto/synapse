import {
  COMPUTER_BOUNDS_KNOWN,
  COMPUTER_CAPTURE_STORED,
  COMPUTER_IMAGE_PRESENT,
  COMPUTER_PUBLIC_SCALE_PRESENT,
  COMPUTER_TITLE_PRESENT,
  type ComputerElement,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_RENDER_APP_TEXT,
  COMPUTER_RENDER_AX_CAP_TEXT,
  COMPUTER_RENDER_COUNT_TEXT,
  COMPUTER_RENDER_ELEMENTS_SUFFIX_TEXT,
  COMPUTER_RENDER_ELEMENTS_TEXT,
  COMPUTER_RENDER_HEADER_TEXT,
  COMPUTER_RENDER_LINE_BREAKS,
  COMPUTER_RENDER_LINE_LABEL_CHARS,
  COMPUTER_RENDER_LINE_SEPARATOR,
  COMPUTER_RENDER_MAX_LINES,
  COMPUTER_RENDER_NARROW_TEXT,
  COMPUTER_RENDER_OF_TEXT,
  COMPUTER_RENDER_RESPONSE_CAP_TEXT,
  COMPUTER_RENDER_SCALE_HINT_TEXT,
  COMPUTER_RENDER_SCALE_TEXT,
  COMPUTER_RENDER_SCREENSHOT_TEXT,
  COMPUTER_RENDER_UNKNOWN_BOUNDS,
  COMPUTER_RENDER_WINDOW_TEXT,
} from "./constants"
import { type ComputerFormatInput } from "./types"

function computerFormatElement(element: ComputerElement): string {
  let bounds = COMPUTER_RENDER_UNKNOWN_BOUNDS
  if (element.bounds.kind === COMPUTER_BOUNDS_KNOWN) {
    const rectangle = element.bounds.rectangle
    bounds = `${rectangle.x}, ${rectangle.y}, ${rectangle.width}, ${rectangle.height}`
  }
  return `  #${element.index} ${element.role} '${element.label.replace(COMPUTER_RENDER_LINE_BREAKS, " ").slice(0, COMPUTER_RENDER_LINE_LABEL_CHARS)}' @ ${bounds}${element.app ? ` [${element.app}]` : ""}`
}

function computerFormatHeader(input: ComputerFormatInput): string[] {
  const lines = [
    `${COMPUTER_RENDER_HEADER_TEXT}${input.capture.mode}${COMPUTER_RENDER_APP_TEXT}${input.capture.app}`,
    `${input.capture.elements.length}${COMPUTER_RENDER_COUNT_TEXT}`,
  ]
  if (input.capture.image.kind === COMPUTER_IMAGE_PRESENT) {
    lines.push(`${input.capture.image.width}x${input.capture.image.height}`)
  }
  if (input.capture.windowTitle.kind === COMPUTER_TITLE_PRESENT) {
    lines.push(`${COMPUTER_RENDER_WINDOW_TEXT}${input.capture.windowTitle.title}`)
  }
  if (input.scale.kind === COMPUTER_PUBLIC_SCALE_PRESENT) {
    lines.push(
      `${COMPUTER_RENDER_SCALE_TEXT} (~${input.scale.maxX}x${input.scale.maxY}), ~${input.scale.factor}x; ${COMPUTER_RENDER_SCALE_HINT_TEXT}`,
    )
  }
  if (input.screenshot.kind === COMPUTER_CAPTURE_STORED) {
    lines.push(`${COMPUTER_RENDER_SCREENSHOT_TEXT}${input.screenshot.reference}`)
  }
  if (input.elements.kind === COMPUTER_CAPTURE_STORED) {
    lines.push(`${COMPUTER_RENDER_ELEMENTS_TEXT}${input.elements.reference}`)
  }
  if (input.capture.note) {
    lines.push(input.capture.note)
  }
  if (input.capture.axMaxElements > 0 && input.capture.elements.length >= input.capture.axMaxElements) {
    lines.push(`${COMPUTER_RENDER_AX_CAP_TEXT}${input.capture.axMaxElements}${COMPUTER_RENDER_NARROW_TEXT}`)
  }
  return lines
}

export function computerFormatCapture(input: ComputerFormatInput): string {
  const lines = computerFormatHeader(input)
  const lastLine = Math.min(input.visible.length, COMPUTER_RENDER_MAX_LINES)
  for (let index = 0; index < lastLine; index++) {
    const element = input.visible[index]
    if (element) {
      lines.push(computerFormatElement(element))
    }
  }
  if (input.visible.length > COMPUTER_RENDER_MAX_LINES) {
    lines.push(`  ... +${input.visible.length - COMPUTER_RENDER_MAX_LINES}${COMPUTER_RENDER_NARROW_TEXT}`)
  }
  if (input.capture.elements.length > input.visible.length) {
    lines.push(
      `${COMPUTER_RENDER_RESPONSE_CAP_TEXT}${input.visible.length}${COMPUTER_RENDER_OF_TEXT}${input.capture.elements.length}${COMPUTER_RENDER_ELEMENTS_SUFFIX_TEXT}`,
    )
  }
  return lines.join(COMPUTER_RENDER_LINE_SEPARATOR)
}
