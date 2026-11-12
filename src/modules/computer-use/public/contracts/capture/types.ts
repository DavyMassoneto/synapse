import {
  type COMPUTER_BOUNDS_ABSENT,
  type COMPUTER_BOUNDS_KNOWN,
  type COMPUTER_CAPTURE_NOT_STORED,
  type COMPUTER_CAPTURE_STORED,
  type COMPUTER_IMAGE_ABSENT,
  type COMPUTER_IMAGE_PRESENT,
  type COMPUTER_JPEG_MIME,
  type COMPUTER_MODE_AX,
  type COMPUTER_MODE_SOM,
  type COMPUTER_MODE_VISION,
  type COMPUTER_PNG_MIME,
  type COMPUTER_TITLE_ABSENT,
  type COMPUTER_TITLE_PRESENT,
} from "./constants"

export interface ComputerRectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface ComputerKnownBounds {
  kind: typeof COMPUTER_BOUNDS_KNOWN
  rectangle: ComputerRectangle
}

export interface ComputerAbsentBounds {
  kind: typeof COMPUTER_BOUNDS_ABSENT
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
  label: string
  bounds: ComputerBounds
  app?: string
  token?: string
}

export interface ComputerPresentImage {
  kind: typeof COMPUTER_IMAGE_PRESENT
  data: string
  mime: ComputerImageMime
  width: number
  height: number
}

export interface ComputerAbsentImage {
  kind: typeof COMPUTER_IMAGE_ABSENT
}

export type ComputerImage = ComputerPresentImage | ComputerAbsentImage

export interface ComputerPresentTitle {
  kind: typeof COMPUTER_TITLE_PRESENT
  title: string
}

export interface ComputerAbsentTitle {
  kind: typeof COMPUTER_TITLE_ABSENT
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
  kind: typeof COMPUTER_CAPTURE_STORED
  reference: string
}

export interface ComputerNotStoredCapture {
  kind: typeof COMPUTER_CAPTURE_NOT_STORED
  message: string
}

export type ComputerCaptureStorageResult = ComputerStoredCapture | ComputerNotStoredCapture

export interface ComputerCaptureStoragePort {
  storeImage(image: ComputerPresentImage): ComputerCaptureStorageResult
  storeElements(capture: ComputerCapture): ComputerCaptureStorageResult
}

export type ComputerCaptureMode = typeof COMPUTER_MODE_SOM | typeof COMPUTER_MODE_VISION | typeof COMPUTER_MODE_AX

export type ComputerImageMime = typeof COMPUTER_PNG_MIME | typeof COMPUTER_JPEG_MIME
