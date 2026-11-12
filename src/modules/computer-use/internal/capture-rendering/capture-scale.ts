import {
  COMPUTER_BOUNDS_KNOWN,
  COMPUTER_IMAGE_PRESENT,
  COMPUTER_PUBLIC_SCALE_ABSENT,
  COMPUTER_PUBLIC_SCALE_PRESENT,
  type ComputerElement,
  type ComputerImage,
  type ComputerScreenshotScale,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_RENDER_SCALE_PRECISION, COMPUTER_RENDER_SCALE_TOLERANCE } from "./constants"

export function computerCaptureScale(elements: ComputerElement[], image: ComputerImage): ComputerScreenshotScale {
  let maxX = 0
  let maxY = 0
  if (image.kind === COMPUTER_IMAGE_PRESENT) {
    const width = image.width
    const height = image.height
    for (const element of elements) {
      if (element.bounds.kind === COMPUTER_BOUNDS_KNOWN) {
        const bounds = element.bounds.rectangle
        maxX = Math.max(maxX, bounds.x + bounds.width)
        maxY = Math.max(maxY, bounds.y + bounds.height)
      }
    }
    if (maxX > width * COMPUTER_RENDER_SCALE_TOLERANCE || maxY > height * COMPUTER_RENDER_SCALE_TOLERANCE) {
      return {
        kind: COMPUTER_PUBLIC_SCALE_PRESENT,
        factor:
          Math.round(Math.max(maxX / width, maxY / height) * COMPUTER_RENDER_SCALE_PRECISION) /
          COMPUTER_RENDER_SCALE_PRECISION,
        maxX,
        maxY,
      }
    }
  }
  return { kind: COMPUTER_PUBLIC_SCALE_ABSENT }
}
