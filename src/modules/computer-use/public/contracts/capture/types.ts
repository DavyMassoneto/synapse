export interface ComputerRectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface ComputerKnownBounds {
  kind: "bounds-known"
  rectangle: ComputerRectangle
}

export interface ComputerAbsentBounds {
  kind: "bounds-absent"
}

export type ComputerBounds = ComputerKnownBounds | ComputerAbsentBounds

export interface ComputerWindow {
  app: string
  pid: number
  windowId: number
  onScreen: boolean
  title: string
  zIndex: number
  bounds: ComputerBounds
}

export interface ComputerApplication {
  name: string
  pid: number
  aliases: string[]
  running: boolean
}

export interface ComputerElement {
  index: number
  role: string
  label?: string
  bounds: ComputerBounds
  app?: string
  token?: string
}

export interface ComputerPresentImage {
  kind: "image-present"
  data: string
  mime: ComputerImageMime
  width: number
  height: number
}

export interface ComputerAbsentImage {
  kind: "image-absent"
}

export type ComputerImage = ComputerPresentImage | ComputerAbsentImage

export interface ComputerPresentTitle {
  kind: "title-present"
  title: string
}

export interface ComputerAbsentTitle {
  kind: "title-absent"
}

export type ComputerWindowTitle = ComputerPresentTitle | ComputerAbsentTitle

export interface ComputerCapture {
  mode: ComputerCaptureMode
  image: ComputerImage
  elements: ComputerElement[]
  app: string
  windowTitle: ComputerWindowTitle
  note: string
  axMaxElements: number
}

export interface ComputerStoredCapture {
  kind: "capture-stored"
  reference: string
}

export interface ComputerNotStoredCapture {
  kind: "capture-not-stored"
  message: string
}

export type ComputerCaptureStorageResult = ComputerStoredCapture | ComputerNotStoredCapture

export interface ComputerCaptureStoragePort {
  storeImage(image: ComputerPresentImage): ComputerCaptureStorageResult
  storeElements(capture: ComputerCapture): ComputerCaptureStorageResult
}

export type ComputerCaptureMode = "som" | "vision" | "ax"

export type ComputerImageMime = "image/png" | "image/jpeg"
