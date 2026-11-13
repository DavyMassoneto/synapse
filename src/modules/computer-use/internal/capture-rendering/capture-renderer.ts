import {
  COMPUTER_CAPTURE_NOT_STORED,
  COMPUTER_IMAGE_PRESENT,
  COMPUTER_PUBLIC_IMAGE_INCLUDED,
  type ComputerCapture,
  type ComputerCaptureStoragePort,
  type ComputerCaptureStorageResult,
  type ComputerElement,
  type ComputerPresentImage,
} from "#synapse/modules/computer-use/public/contracts"
import { computerCaptureScale } from "./capture-scale"
import {
  COMPUTER_RENDER_IMAGE_OMITTED,
  COMPUTER_RENDER_LINE_SEPARATOR,
  COMPUTER_RENDER_MAX_ELEMENTS,
  COMPUTER_RENDER_NO_DETAIL_LOSS,
  COMPUTER_RENDER_NO_IMAGE,
  COMPUTER_RENDER_UNCHANGED,
  COMPUTER_RENDER_VISION_UNAVAILABLE,
} from "./constants"
import { ComputerCaptureDedup } from "./dedup"
import { computerFormatCapture } from "./format-capture"
import { computerImageOmissionReason } from "./image-omission"
import { hasComputerLostDetail, hasComputerRenderableImage } from "./predicates"
import { computerTruncateElement } from "./truncate-element"
import {
  type ComputerCaptureRenderOptions,
  type ComputerFormatInput,
  type ComputerRenderedCapture,
  type ComputerRenderedImage,
} from "./types"

export class ComputerCaptureRenderer {
  private readonly storage: ComputerCaptureStoragePort

  private readonly dedup = new ComputerCaptureDedup()

  constructor(storage: ComputerCaptureStoragePort) {
    this.storage = storage
  }

  render(capture: ComputerCapture, options: ComputerCaptureRenderOptions): ComputerRenderedCapture {
    const visible = this.visibleElements(capture)
    const scale = computerCaptureScale(visible, capture.image)
    const input: ComputerFormatInput = {
      capture,
      visible,
      scale,
      screenshot: this.storeScreenshot(capture),
      elements: this.storeElements(capture, visible),
    }
    const image = this.renderImage(capture, options)
    return {
      summary: this.summary(input, image),
      elements: visible,
      totalElements: capture.elements.length,
      truncatedElements: capture.elements.length - visible.length,
      scale,
      image,
      screenshotStorage: input.screenshot,
      elementsStorage: input.elements,
    }
  }

  reset(): void {
    this.dedup.reset()
  }

  private visibleElements(capture: ComputerCapture): ComputerElement[] {
    const visible: ComputerElement[] = []
    for (const element of capture.elements) {
      if (visible.length >= COMPUTER_RENDER_MAX_ELEMENTS) {
        break
      }
      visible.push(computerTruncateElement(element))
    }
    return visible
  }

  private storeScreenshot(capture: ComputerCapture): ComputerCaptureStorageResult {
    const image = capture.image
    if (image.kind === COMPUTER_IMAGE_PRESENT && hasComputerRenderableImage(capture)) {
      return this.storage.storeImage(image)
    }
    return { kind: COMPUTER_CAPTURE_NOT_STORED, message: COMPUTER_RENDER_NO_IMAGE }
  }

  private storeElements(capture: ComputerCapture, visible: ComputerElement[]): ComputerCaptureStorageResult {
    if (hasComputerLostDetail(capture, visible)) {
      return this.storage.storeElements(capture)
    }
    return { kind: COMPUTER_CAPTURE_NOT_STORED, message: COMPUTER_RENDER_NO_DETAIL_LOSS }
  }

  private renderImage(capture: ComputerCapture, options: ComputerCaptureRenderOptions): ComputerRenderedImage {
    const image = capture.image
    if (image.kind === COMPUTER_IMAGE_PRESENT && hasComputerRenderableImage(capture)) {
      return this.renderPresentImage(capture, image, options)
    }
    return { kind: COMPUTER_RENDER_IMAGE_OMITTED, reason: computerImageOmissionReason(capture) }
  }

  private renderPresentImage(
    capture: ComputerCapture,
    image: ComputerPresentImage,
    options: ComputerCaptureRenderOptions,
  ): ComputerRenderedImage {
    if (!options.modelSupportsImages) {
      return { kind: COMPUTER_RENDER_IMAGE_OMITTED, reason: COMPUTER_RENDER_VISION_UNAVAILABLE }
    }
    if (this.dedup.isRepeated(options.sessionId, capture, image)) {
      return { kind: COMPUTER_RENDER_IMAGE_OMITTED, reason: COMPUTER_RENDER_UNCHANGED }
    }
    return { kind: COMPUTER_PUBLIC_IMAGE_INCLUDED, image: { ...image } }
  }

  private summary(input: ComputerFormatInput, image: ComputerRenderedImage): string {
    const summary = computerFormatCapture(input)
    if (image.kind === COMPUTER_RENDER_IMAGE_OMITTED) {
      return `${summary}${COMPUTER_RENDER_LINE_SEPARATOR}${image.reason}`
    }
    return summary
  }
}
