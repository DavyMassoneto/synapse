import {
  type ComputerCapture,
  type ComputerCaptureStorageResult,
  type ComputerElement,
  type ComputerPresentImage,
  type ComputerScreenshotScale,
} from "#synapse/modules/computer-use/public/contracts"

export interface ComputerFormatInput {
  capture: ComputerCapture
  visible: ComputerElement[]
  scale: ComputerScreenshotScale
  screenshot: ComputerCaptureStorageResult
  elements: ComputerCaptureStorageResult
}

export interface ComputerCaptureRenderOptions {
  sessionId: string
  modelSupportsImages: boolean
}

export interface ComputerCaptureDedupState {
  image: string
  mime: string
  target: string
  streak: number
}

export interface ComputerRenderIncludedImage {
  kind: "image-included"
  image: ComputerPresentImage
}

export interface ComputerRenderOmittedImage {
  kind: "image-omitted"
  reason: string
}

export type ComputerRenderedImage = ComputerRenderIncludedImage | ComputerRenderOmittedImage

export interface ComputerRenderedCapture {
  summary: string
  elements: ComputerElement[]
  totalElements: number
  truncatedElements: number
  scale: ComputerScreenshotScale
  image: ComputerRenderedImage
  screenshotStorage: ComputerCaptureStorageResult
  elementsStorage: ComputerCaptureStorageResult
}
