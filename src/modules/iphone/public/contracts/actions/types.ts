import { type IphoneDragSpec, type IphoneElement, type IphonePoint, type IphoneRectangle } from "../geometry"

export interface IphoneTreeAction {
  kind: "tree"
  max: number
}

export interface IphoneScreenshotAction {
  kind: "screenshot"
}

export interface IphoneTapAction {
  kind: "tap"
  point: IphonePoint
}

export interface IphoneDoubleTapAction {
  kind: "double_tap"
  point: IphonePoint
}

export interface IphoneLongPressAction {
  kind: "long_press"
  point: IphonePoint
  durationMs: number
}

export interface IphonePageDragAction {
  kind: "page_drag"
  drag: IphoneDragSpec
  edge: IphonePageDragEdge
  flips: number
  flipWaitMs: number
  releaseAtEdge?: boolean
}

export type IphonePageDragEdge = "left" | "right"

export interface IphoneDragAction {
  kind: "drag"
  drag: IphoneDragSpec
}

export interface IphoneTypeAction {
  kind: "type"
  text: string
  submit: boolean
  point?: IphonePoint
}

export interface IphoneClearAction {
  kind: "clear"
  point: IphonePoint
}

export type IphoneSwipeDirection = "up" | "down" | "left" | "right"

export interface IphoneSwipeAction {
  kind: IphoneSwipeKind
  direction: IphoneSwipeDirection
  point?: IphonePoint
}

export interface IphoneApplicationAction {
  kind: IphoneApplicationKind
  bundleId: string
}

export interface IphoneInstallAction {
  kind: "install"
  path: string
}

export interface IphoneHomeAction {
  kind: "home"
}

export interface IphonePressAction {
  kind: "press"
  button: string
}

export interface IphoneAlertAction {
  kind: "alert"
  action: IphoneAlertKind
  buttonLabel?: string
}

export interface IphoneUrlAction {
  kind: "url"
  url: string
  bundleId: string
}

export interface IphoneInfoAction {
  kind: "info"
}

export interface IphoneWaitAction {
  kind: "wait"
  seconds: number
}

export interface IphoneOrientationAction {
  kind: "orientation"
  orientation?: IphoneOrientationKind
}

export interface IphoneCloseAction {
  kind: "close"
}

export type IphoneDeviceAction =
  | IphoneTreeAction
  | IphoneScreenshotAction
  | IphoneDoubleTapAction
  | IphoneTapAction
  | IphoneLongPressAction
  | IphoneDragAction
  | IphonePageDragAction
  | IphoneTypeAction
  | IphoneClearAction
  | IphoneSwipeAction
  | IphoneApplicationAction
  | IphoneInstallAction
  | IphoneHomeAction
  | IphonePressAction
  | IphoneAlertAction
  | IphoneUrlAction
  | IphoneInfoAction
  | IphoneWaitAction
  | IphoneOrientationAction
  | IphoneCloseAction

export interface IphoneTextOutput {
  kind: "text"
  text: string
}

export interface IphoneTreeOutput {
  kind: "tree"
  text: string
  count: number
  viewport: IphoneRectangle
  elements: IphoneElement[]
}

export interface IphoneImageOutput {
  kind: "image"
  data: string
  mimeType: "image/png"
}

export interface IphoneMobileInfo {
  name?: string
  bundleId?: string
  model?: string
  osVersion?: string
}

export interface IphoneInfoOutput {
  kind: "info"
  device: IphoneMobileInfo
  activeApp: IphoneMobileInfo
  viewport: IphoneRectangle
}

export type IphoneDeviceActionOutput = IphoneTextOutput | IphoneTreeOutput | IphoneImageOutput | IphoneInfoOutput

export type IphoneSwipeKind = "swipe" | "scroll"

export type IphoneApplicationKind = "launch" | "terminate" | "activate"

export type IphoneAlertKind = "accept" | "dismiss"

export type IphoneOrientationKind = "PORTRAIT" | "LANDSCAPE"
