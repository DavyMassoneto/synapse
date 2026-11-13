import {
  COMPUTER_BOUNDS_KNOWN,
  COMPUTER_CAPTURE_STORED,
  COMPUTER_IMAGE_PRESENT,
  COMPUTER_PUBLIC_SCALE_PRESENT,
  COMPUTER_TITLE_PRESENT,
  type ComputerElement,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_RENDER_APP_CLOSE,
  COMPUTER_RENDER_APP_OPEN,
  COMPUTER_RENDER_APP_TEXT,
  COMPUTER_RENDER_AX_CAP_TEXT,
  COMPUTER_RENDER_COORDINATE_SEPARATOR,
  COMPUTER_RENDER_COUNT_TEXT,
  COMPUTER_RENDER_DIMENSION_SEPARATOR,
  COMPUTER_RENDER_ELEMENT_PREFIX,
  COMPUTER_RENDER_ELEMENTS_SUFFIX_TEXT,
  COMPUTER_RENDER_ELEMENTS_TEXT,
  COMPUTER_RENDER_EMPTY,
  COMPUTER_RENDER_HEADER_TEXT,
  COMPUTER_RENDER_LABEL_BOUNDS,
  COMPUTER_RENDER_LABEL_OPEN,
  COMPUTER_RENDER_LINE_BREAKS,
  COMPUTER_RENDER_LINE_LABEL_CHARS,
  COMPUTER_RENDER_LINE_SEPARATOR,
  COMPUTER_RENDER_MAX_LINES,
  COMPUTER_RENDER_NARROW_TEXT,
  COMPUTER_RENDER_OF_TEXT,
  COMPUTER_RENDER_REMAINING_PREFIX,
  COMPUTER_RENDER_RESPONSE_CAP_TEXT,
  COMPUTER_RENDER_SCALE_FACTOR,
  COMPUTER_RENDER_SCALE_HINT_TEXT,
  COMPUTER_RENDER_SCALE_OPEN,
  COMPUTER_RENDER_SCALE_SUFFIX,
  COMPUTER_RENDER_SCALE_TEXT,
  COMPUTER_RENDER_SCREENSHOT_TEXT,
  COMPUTER_RENDER_SPACE,
  COMPUTER_RENDER_UNKNOWN_BOUNDS,
  COMPUTER_RENDER_WINDOW_TEXT,
} from "./constants"
import { type ComputerFormatInput } from "./types"

function computerFormatElement(element: ComputerElement): string {
  let bounds = COMPUTER_RENDER_UNKNOWN_BOUNDS
  if (element.bounds.kind === COMPUTER_BOUNDS_KNOWN) {
    const rectangle = element.bounds.rectangle
    bounds = `${rectangle.x}${COMPUTER_RENDER_COORDINATE_SEPARATOR}${rectangle.y}${COMPUTER_RENDER_COORDINATE_SEPARATOR}${rectangle.width}${COMPUTER_RENDER_COORDINATE_SEPARATOR}${rectangle.height}`
  }
  const label = element.label
    .replace(COMPUTER_RENDER_LINE_BREAKS, COMPUTER_RENDER_SPACE)
    .slice(0, COMPUTER_RENDER_LINE_LABEL_CHARS)
  let app = COMPUTER_RENDER_EMPTY
  if (element.app) {
    app = `${COMPUTER_RENDER_APP_OPEN}${element.app}${COMPUTER_RENDER_APP_CLOSE}`
  }
  return `${COMPUTER_RENDER_ELEMENT_PREFIX}${element.index}${COMPUTER_RENDER_SPACE}${element.role}${COMPUTER_RENDER_LABEL_OPEN}${label}${COMPUTER_RENDER_LABEL_BOUNDS}${bounds}${app}`
}

function computerFormatHeader(input: ComputerFormatInput): string[] {
  const lines = [
    `${COMPUTER_RENDER_HEADER_TEXT}${input.capture.mode}${COMPUTER_RENDER_APP_TEXT}${input.capture.app}`,
    `${input.capture.elements.length}${COMPUTER_RENDER_COUNT_TEXT}`,
  ]
  if (input.capture.image.kind === COMPUTER_IMAGE_PRESENT) {
    lines.push(`${input.capture.image.width}${COMPUTER_RENDER_DIMENSION_SEPARATOR}${input.capture.image.height}`)
  }
  if (input.capture.windowTitle.kind === COMPUTER_TITLE_PRESENT) {
    lines.push(`${COMPUTER_RENDER_WINDOW_TEXT}${input.capture.windowTitle.title}`)
  }
  if (input.scale.kind === COMPUTER_PUBLIC_SCALE_PRESENT) {
    lines.push(
      `${COMPUTER_RENDER_SCALE_TEXT}${COMPUTER_RENDER_SCALE_OPEN}${input.scale.maxX}${COMPUTER_RENDER_DIMENSION_SEPARATOR}${input.scale.maxY}${COMPUTER_RENDER_SCALE_FACTOR}${input.scale.factor}${COMPUTER_RENDER_SCALE_SUFFIX}${COMPUTER_RENDER_SCALE_HINT_TEXT}`,
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
    const remaining = input.visible.length - COMPUTER_RENDER_MAX_LINES
    lines.push(`${COMPUTER_RENDER_REMAINING_PREFIX}${remaining}${COMPUTER_RENDER_NARROW_TEXT}`)
  }
  if (input.capture.elements.length > input.visible.length) {
    lines.push(
      `${COMPUTER_RENDER_RESPONSE_CAP_TEXT}${input.visible.length}${COMPUTER_RENDER_OF_TEXT}${input.capture.elements.length}${COMPUTER_RENDER_ELEMENTS_SUFFIX_TEXT}`,
    )
  }
  return lines.join(COMPUTER_RENDER_LINE_SEPARATOR)
}
