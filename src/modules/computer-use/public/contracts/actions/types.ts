import { type ComputerCaptureMode } from "../capture"
import {
  type COMPUTER_BACKGROUND,
  type COMPUTER_CAPTURE,
  type COMPUTER_CLICK,
  type COMPUTER_DARWIN,
  type COMPUTER_DOUBLE_CLICK,
  type COMPUTER_DRAG,
  type COMPUTER_FOCUS_APP,
  type COMPUTER_FOREGROUND,
  type COMPUTER_KEY,
  type COMPUTER_LINUX,
  type COMPUTER_LIST_APPS,
  type COMPUTER_LIST_WINDOWS,
  type COMPUTER_MIDDLE_CLICK,
  type COMPUTER_RIGHT_CLICK,
  type COMPUTER_SCROLL,
  type COMPUTER_SET_VALUE,
  type COMPUTER_TYPE,
  type COMPUTER_WAIT,
  type COMPUTER_WIN32,
} from "./constants"

export type ComputerPlatform = typeof COMPUTER_DARWIN | typeof COMPUTER_LINUX | typeof COMPUTER_WIN32

export type ComputerDeliveryMode = typeof COMPUTER_BACKGROUND | typeof COMPUTER_FOREGROUND

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
  action: typeof COMPUTER_CAPTURE
  mode?: ComputerCaptureMode
  app?: string
  pid?: number
  windowId?: number
}

export interface ComputerClickAction extends ComputerPointerOptions {
  action: typeof COMPUTER_CLICK
}

export interface ComputerDoubleClickAction extends ComputerPointerOptions {
  action: typeof COMPUTER_DOUBLE_CLICK
}

export interface ComputerRightClickAction extends ComputerPointerOptions {
  action: typeof COMPUTER_RIGHT_CLICK
}

export interface ComputerMiddleClickAction extends ComputerPointerOptions {
  action: typeof COMPUTER_MIDDLE_CLICK
}

export interface ComputerDragAction extends ComputerInputOptions {
  action: typeof COMPUTER_DRAG
  fromElement?: number
  toElement?: number
  fromCoordinate?: ComputerCoordinate
  toCoordinate?: ComputerCoordinate
  button?: ComputerMouseButton
  modifiers?: string[]
}

export interface ComputerScrollAction extends ComputerInputOptions {
  action: typeof COMPUTER_SCROLL
  element?: number
  coordinate?: ComputerCoordinate
  direction?: ComputerScrollDirection
  amount?: number
}

export interface ComputerTypeAction extends ComputerInputOptions {
  action: typeof COMPUTER_TYPE
  text: string
  scope?: ComputerInputScope
}

export interface ComputerKeyAction extends ComputerInputOptions {
  action: typeof COMPUTER_KEY
  keys: string
  scope?: ComputerInputScope
}

export interface ComputerSetValueAction {
  action: typeof COMPUTER_SET_VALUE
  element: number
  value: string
  app?: string
  captureAfter?: boolean
}

export interface ComputerWaitAction {
  action: typeof COMPUTER_WAIT
  seconds?: number
}

export interface ComputerListAppsAction {
  action: typeof COMPUTER_LIST_APPS
}

export interface ComputerListWindowsAction {
  action: typeof COMPUTER_LIST_WINDOWS
}

export interface ComputerFocusAppAction {
  action: typeof COMPUTER_FOCUS_APP
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
