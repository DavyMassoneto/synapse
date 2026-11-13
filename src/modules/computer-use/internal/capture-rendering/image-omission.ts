import {
  COMPUTER_IMAGE_PRESENT,
  COMPUTER_MODE_AX,
  type ComputerCapture,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_RENDER_AX_ONLY, COMPUTER_RENDER_IMAGE_TOO_SMALL, COMPUTER_RENDER_NO_IMAGE } from "./constants"

export function computerImageOmissionReason(capture: ComputerCapture): string {
  if (capture.image.kind !== COMPUTER_IMAGE_PRESENT) {
    return COMPUTER_RENDER_NO_IMAGE
  }
  if (capture.mode === COMPUTER_MODE_AX) {
    return COMPUTER_RENDER_AX_ONLY
  }
  return COMPUTER_RENDER_IMAGE_TOO_SMALL
}
