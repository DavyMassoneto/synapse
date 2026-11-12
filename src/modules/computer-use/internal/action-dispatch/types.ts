import {
  type COMPUTER_FAILED,
  type COMPUTER_REFUSED,
  type ComputerCaptureMode,
  type ComputerClickAction,
  type ComputerDoubleClickAction,
  type ComputerDragAction,
  type ComputerDriverArguments,
  type ComputerExecuteResult,
  type ComputerKeyAction,
  type ComputerListAppsAction,
  type ComputerListWindowsAction,
  type ComputerMiddleClickAction,
  type ComputerRightClickAction,
  type ComputerScrollAction,
  type ComputerSetValueAction,
  type ComputerTypeAction,
} from "#synapse/modules/computer-use/public/contracts"
import {
  type COMPUTER_FOCUS_UNNEEDED,
  type COMPUTER_PREPARED_TARGET_ABSENT,
  type COMPUTER_PREPARED_TARGET_COORDINATE,
  type COMPUTER_PREPARED_TARGET_ELEMENT,
} from "./constants"

export type ComputerInputAction =
  | ComputerClickAction
  | ComputerDoubleClickAction
  | ComputerRightClickAction
  | ComputerMiddleClickAction
  | ComputerDragAction
  | ComputerScrollAction
  | ComputerTypeAction
  | ComputerKeyAction
  | ComputerSetValueAction

export interface ComputerElementPreparedTarget {
  kind: typeof COMPUTER_PREPARED_TARGET_ELEMENT
  index: number
}

export interface ComputerCoordinatePreparedTarget {
  kind: typeof COMPUTER_PREPARED_TARGET_COORDINATE
  x: number
  y: number
}

export interface ComputerAbsentPreparedTarget {
  kind: typeof COMPUTER_PREPARED_TARGET_ABSENT
}

export type ComputerDispatchTarget =
  | ComputerElementPreparedTarget
  | ComputerCoordinatePreparedTarget
  | ComputerAbsentPreparedTarget

export interface ComputerDispatchPreparedInput {
  tool: string
  arguments: ComputerDriverArguments
  target: ComputerDispatchTarget
}

export type ComputerListAction = ComputerListAppsAction | ComputerListWindowsAction

export type ComputerClickInputAction =
  | ComputerClickAction
  | ComputerDoubleClickAction
  | ComputerRightClickAction
  | ComputerMiddleClickAction

export type ComputerDispatchFailureKind = typeof COMPUTER_FAILED | typeof COMPUTER_REFUSED

export interface ComputerPreparedCapture {
  tool: string
  arguments: ComputerDriverArguments
  mode: ComputerCaptureMode
  app: string
}

export type ComputerFocusDecision = ComputerExecuteResult | ComputerFocusUnneeded

export interface ComputerFocusUnneeded {
  kind: typeof COMPUTER_FOCUS_UNNEEDED
}

export type ComputerSnapshotTokens = Map<number, string>
