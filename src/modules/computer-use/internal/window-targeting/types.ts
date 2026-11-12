import { type ComputerWindow } from "#synapse/modules/computer-use/public/contracts"
import {
  type COMPUTER_EXACT_TARGET_SELECTED,
  type COMPUTER_TARGET_ABSENT,
  type COMPUTER_TARGET_APP,
  type COMPUTER_TARGET_EXACT,
  type COMPUTER_TARGET_IMPLICIT,
  type COMPUTER_TARGET_REJECTED,
  type COMPUTER_TARGET_SCREEN,
  type COMPUTER_TARGET_SELECTED,
} from "./outcomes"

export interface ComputerImplicitTargetRequest {
  kind: typeof COMPUTER_TARGET_IMPLICIT
}

export interface ComputerAppTargetRequest {
  kind: typeof COMPUTER_TARGET_APP
  app: string
}

export interface ComputerExactTargetRequest {
  kind: typeof COMPUTER_TARGET_EXACT
  pid: number
  windowId: number
}

export type ComputerTargetRequest =
  | ComputerImplicitTargetRequest
  | ComputerAppTargetRequest
  | ComputerExactTargetRequest

export interface ComputerSelectedTarget {
  kind: typeof COMPUTER_TARGET_SELECTED
  window: ComputerWindow
}

export interface ComputerAbsentTarget {
  kind: typeof COMPUTER_TARGET_ABSENT
}

export interface ComputerRejectedTarget {
  kind: typeof COMPUTER_TARGET_REJECTED
  message: string
}

export interface ComputerScreenTarget {
  kind: typeof COMPUTER_TARGET_SCREEN
}

export type ComputerTargetSelection =
  | ComputerSelectedTarget
  | ComputerSelectedExactTarget
  | ComputerRejectedTarget
  | ComputerScreenTarget

export type ComputerStickyTarget = ComputerSelectedTarget | ComputerSelectedExactTarget | ComputerAbsentTarget

export type ComputerInputTarget = ComputerStickyTarget | ComputerRejectedTarget

export interface ComputerShellNames {
  darwin: string[]
  linux: string[]
  win32: string[]
}

export interface ComputerSelectedExactTarget {
  kind: typeof COMPUTER_EXACT_TARGET_SELECTED
  pid: number
  windowId: number
}

export type ComputerTargetIdentity = ComputerSelectedExactTarget | ComputerAbsentTarget
