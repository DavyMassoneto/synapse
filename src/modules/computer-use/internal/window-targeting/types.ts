import { type ComputerWindow } from "#synapse/modules/computer-use/public/contracts"

export interface ComputerImplicitTargetRequest {
  kind: "target-implicit"
}

export interface ComputerAppTargetRequest {
  kind: "target-app"
  app: string
}

export interface ComputerExactTargetRequest {
  kind: "target-exact"
  pid: number
  windowId: number
}

export type ComputerTargetRequest =
  | ComputerImplicitTargetRequest
  | ComputerAppTargetRequest
  | ComputerExactTargetRequest

export interface ComputerSelectedTarget {
  kind: "target-selected"
  window: ComputerWindow
}

export interface ComputerAbsentTarget {
  kind: "target-absent"
}

export interface ComputerRejectedTarget {
  kind: "target-rejected"
  message: string
}

export interface ComputerScreenTarget {
  kind: "target-screen"
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
  kind: "exact-target-selected"
  pid: number
  windowId: number
}

export type ComputerTargetIdentity = ComputerSelectedExactTarget | ComputerAbsentTarget
