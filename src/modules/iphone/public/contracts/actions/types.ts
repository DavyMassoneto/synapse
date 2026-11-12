import {
  type IPHONE_IMAGE_PNG,
  type IPHONE_RESULT_IMAGE,
  type IPHONE_RESULT_INFO,
  type IPHONE_RESULT_TEXT,
  type IPHONE_RESULT_TREE,
} from "../constants"
import { type IphoneDragSpec, type IphoneElement, type IphonePoint, type IphoneRectangle } from "../geometry"
import {
  type IPHONE_ACTION_ACTIVATE,
  type IPHONE_ACTION_ALERT,
  type IPHONE_ACTION_CLEAR,
  type IPHONE_ACTION_CLOSE,
  type IPHONE_ACTION_DOUBLE_TAP,
  type IPHONE_ACTION_DRAG,
  type IPHONE_ACTION_HOME,
  type IPHONE_ACTION_INFO,
  type IPHONE_ACTION_INSTALL,
  type IPHONE_ACTION_LAUNCH,
  type IPHONE_ACTION_LONG_PRESS,
  type IPHONE_ACTION_ORIENTATION,
  type IPHONE_ACTION_PAGE_DRAG,
  type IPHONE_ACTION_PRESS,
  type IPHONE_ACTION_SCREENSHOT,
  type IPHONE_ACTION_SCROLL,
  type IPHONE_ACTION_SWIPE,
  type IPHONE_ACTION_TAP,
  type IPHONE_ACTION_TERMINATE,
  type IPHONE_ACTION_TREE,
  type IPHONE_ACTION_TYPE,
  type IPHONE_ACTION_URL,
  type IPHONE_ACTION_WAIT,
} from "./constants"

export interface IphoneTreeAction {
  kind: typeof IPHONE_ACTION_TREE
  max: number
}

export interface IphoneScreenshotAction {
  kind: typeof IPHONE_ACTION_SCREENSHOT
}

export interface IphoneTapAction {
  kind: typeof IPHONE_ACTION_TAP
  point: IphonePoint
}

export interface IphoneDoubleTapAction {
  kind: typeof IPHONE_ACTION_DOUBLE_TAP
  point: IphonePoint
}

export interface IphoneLongPressAction {
  kind: typeof IPHONE_ACTION_LONG_PRESS
  point: IphonePoint
  durationMs: number
}

export interface IphonePageDragAction {
  kind: typeof IPHONE_ACTION_PAGE_DRAG
  drag: IphoneDragSpec
  edge: IphonePageDragEdge
  flips: number
  flipWaitMs: number
  releaseAtEdge?: boolean
}

export type IphonePageDragEdge = "left" | "right"

export interface IphoneDragAction {
  kind: typeof IPHONE_ACTION_DRAG
  drag: IphoneDragSpec
}

export interface IphoneTypeAction {
  kind: typeof IPHONE_ACTION_TYPE
  text: string
  submit: boolean
  point?: IphonePoint
}

export interface IphoneClearAction {
  kind: typeof IPHONE_ACTION_CLEAR
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
  kind: typeof IPHONE_ACTION_INSTALL
  path: string
}

export interface IphoneHomeAction {
  kind: typeof IPHONE_ACTION_HOME
}

export interface IphonePressAction {
  kind: typeof IPHONE_ACTION_PRESS
  button: string
}

export interface IphoneAlertAction {
  kind: typeof IPHONE_ACTION_ALERT
  action: IphoneAlertKind
  buttonLabel?: string
}

export interface IphoneUrlAction {
  kind: typeof IPHONE_ACTION_URL
  url: string
  bundleId: string
}

export interface IphoneInfoAction {
  kind: typeof IPHONE_ACTION_INFO
}

export interface IphoneWaitAction {
  kind: typeof IPHONE_ACTION_WAIT
  seconds: number
}

export interface IphoneOrientationAction {
  kind: typeof IPHONE_ACTION_ORIENTATION
  orientation?: IphoneOrientationKind
}

export interface IphoneCloseAction {
  kind: typeof IPHONE_ACTION_CLOSE
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
  kind: typeof IPHONE_RESULT_TEXT
  text: string
}

export interface IphoneTreeOutput {
  kind: typeof IPHONE_RESULT_TREE
  text: string
  count: number
  viewport: IphoneRectangle
  elements: IphoneElement[]
}

export interface IphoneImageOutput {
  kind: typeof IPHONE_RESULT_IMAGE
  data: string
  mimeType: typeof IPHONE_IMAGE_PNG
}

export interface IphoneMobileInfo {
  name?: string
  bundleId?: string
  model?: string
  osVersion?: string
}

export interface IphoneInfoOutput {
  kind: typeof IPHONE_RESULT_INFO
  device: IphoneMobileInfo
  activeApp: IphoneMobileInfo
  viewport: IphoneRectangle
}

export type IphoneDeviceActionOutput = IphoneTextOutput | IphoneTreeOutput | IphoneImageOutput | IphoneInfoOutput

export type IphoneSwipeKind = typeof IPHONE_ACTION_SWIPE | typeof IPHONE_ACTION_SCROLL

export type IphoneApplicationKind =
  | typeof IPHONE_ACTION_LAUNCH
  | typeof IPHONE_ACTION_TERMINATE
  | typeof IPHONE_ACTION_ACTIVATE

export type IphoneAlertKind = "accept" | "dismiss"

export type IphoneOrientationKind = "PORTRAIT" | "LANDSCAPE"
