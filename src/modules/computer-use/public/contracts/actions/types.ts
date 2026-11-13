import { type ComputerCaptureMode } from "../capture"

export type ComputerPlatform = "darwin" | "linux" | "win32"

export type ComputerDeliveryMode = "background" | "foreground"

export interface ComputerCoordinate {
  x: number
  y: number
}

export type ComputerMouseButton = "left" | "right" | "middle"

export type ComputerScrollDirection = "up" | "down" | "left" | "right"

export interface ComputerInputOptions {
  app?: string
  deliveryMode?: ComputerDeliveryMode
  bringToFront?: boolean
  captureAfter?: boolean
}

export interface ComputerPointerOptions extends ComputerInputOptions {
  element?: number
  coordinate?: ComputerCoordinate
  button?: ComputerMouseButton
  modifiers?: string[]
}

export interface ComputerCaptureAction {
  action: "capture"
  mode?: ComputerCaptureMode
  app?: string
  pid?: number
  windowId?: number
}

export interface ComputerClickAction extends ComputerPointerOptions {
  action: "click"
}

export interface ComputerDoubleClickAction extends ComputerPointerOptions {
  action: "double_click"
}

export interface ComputerRightClickAction extends ComputerPointerOptions {
  action: "right_click"
}

export interface ComputerMiddleClickAction extends ComputerPointerOptions {
  action: "middle_click"
}

export interface ComputerDragAction extends ComputerInputOptions {
  action: "drag"
  fromElement?: number
  toElement?: number
  fromCoordinate?: ComputerCoordinate
  toCoordinate?: ComputerCoordinate
  button?: ComputerMouseButton
  modifiers?: string[]
}

export interface ComputerScrollAction extends ComputerInputOptions {
  action: "scroll"
  element?: number
  coordinate?: ComputerCoordinate
  direction?: ComputerScrollDirection
  amount?: number
}

export interface ComputerTypeAction extends ComputerInputOptions {
  action: "type"
  text: string
  scope?: ComputerInputScope
}

export interface ComputerKeyAction extends ComputerInputOptions {
  action: "key"
  keys: string
  scope?: ComputerInputScope
}

export interface ComputerSetValueAction {
  action: "set_value"
  element: number
  value: string
  app?: string
  captureAfter?: boolean
}

export interface ComputerWaitAction {
  action: "wait"
  seconds?: number
}

export interface ComputerListAppsAction {
  action: "list_apps"
}

export interface ComputerListWindowsAction {
  action: "list_windows"
}

export interface ComputerFocusAppAction {
  action: "focus_app"
  app: string
  raiseWindow?: boolean
}

export type ComputerAction =
  | ComputerCaptureAction
  | ComputerClickAction
  | ComputerDoubleClickAction
  | ComputerRightClickAction
  | ComputerMiddleClickAction
  | ComputerDragAction
  | ComputerScrollAction
  | ComputerTypeAction
  | ComputerKeyAction
  | ComputerSetValueAction
  | ComputerWaitAction
  | ComputerListAppsAction
  | ComputerListWindowsAction
  | ComputerFocusAppAction

export type ComputerInputScope = "window" | "desktop"
