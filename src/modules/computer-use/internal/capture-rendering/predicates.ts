import {
  COMPUTER_IMAGE_PRESENT,
  COMPUTER_MODE_AX,
  type ComputerCapture,
  type ComputerElement,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_RENDER_MAX_LABEL_CHARS, COMPUTER_RENDER_MIN_IMAGE_SIDE } from "./constants"

export function hasComputerRenderableImage(capture: ComputerCapture): boolean {
  if (capture.image.kind !== COMPUTER_IMAGE_PRESENT) {
    return false
  }
  const side = Math.min(capture.image.width, capture.image.height)
  return capture.mode !== COMPUTER_MODE_AX && side >= COMPUTER_RENDER_MIN_IMAGE_SIDE
}

export function hasComputerLostDetail(capture: ComputerCapture, visible: ComputerElement[]): boolean {
  const omitted = capture.elements.length > visible.length
  const truncatedLabel = capture.elements.some((element) => element.label.length > COMPUTER_RENDER_MAX_LABEL_CHARS)
  return omitted || truncatedLabel
}
