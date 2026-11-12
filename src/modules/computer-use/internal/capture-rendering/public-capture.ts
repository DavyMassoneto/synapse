import {
  COMPUTER_IMAGE_ABSENT,
  COMPUTER_PUBLIC_IMAGE_INCLUDED,
  COMPUTER_PUBLIC_IMAGE_OMITTED,
  type ComputerRenderedScreenshot,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_RENDER_IMAGE_OMITTED } from "./constants"
import { type ComputerRenderedCapture } from "./types"

export function computerPublicCapture(rendered: ComputerRenderedCapture): ComputerRenderedScreenshot {
  const image = rendered.image
  return {
    summary: rendered.summary,
    elements: rendered.elements,
    totalElements: rendered.totalElements,
    truncatedElements: rendered.truncatedElements,
    image: image.kind === COMPUTER_RENDER_IMAGE_OMITTED ? { kind: COMPUTER_IMAGE_ABSENT } : image.image,
    omission:
      image.kind === COMPUTER_RENDER_IMAGE_OMITTED
        ? { kind: COMPUTER_PUBLIC_IMAGE_OMITTED, reason: image.reason }
        : { kind: COMPUTER_PUBLIC_IMAGE_INCLUDED },
    scale: rendered.scale,
    screenshotStorage: rendered.screenshotStorage,
    elementsStorage: rendered.elementsStorage,
  }
}
