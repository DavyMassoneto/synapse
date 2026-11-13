import {
  type ComputerCaptureMode,
  type ComputerClickAction,
  type ComputerDoubleClickAction,
  type ComputerDragAction,
  type ComputerDriverArguments,
  type ComputerExecutedAction,
  type ComputerKeyAction,
  type ComputerListAppsAction,
  type ComputerListWindowsAction,
  type ComputerMiddleClickAction,
  type ComputerRightClickAction,
  type ComputerScrollAction,
  type ComputerSetValueAction,
  type ComputerTypeAction,
} from "#synapse/modules/computer-use/public/contracts"

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
  kind: "prepared-target-element"
  index: number
}

export interface ComputerCoordinatePreparedTarget {
  kind: "prepared-target-coordinate"
  x: number
  y: number
}

export interface ComputerAbsentPreparedTarget {
  kind: "prepared-target-absent"
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

export type ComputerDispatchFailureKind = "cancelled" | "failed" | "refused"

export interface ComputerPreparedCapture {
  tool: string
  arguments: ComputerDriverArguments
  mode: ComputerCaptureMode
  app: string
}

export type ComputerFocusDecision = ComputerExecutedAction | ComputerFocusUnneeded

export interface ComputerFocusUnneeded {
  kind: "focus-unneeded"
}

export type ComputerSnapshotTokens = Map<number, string>
