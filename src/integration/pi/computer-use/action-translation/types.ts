import { type ComputerInputOptions, type ComputerInputScope, type ComputerMouseButton } from "#synapse/modules"

export type PiComputerCoordinate = [number, number]

export interface PiComputerMouseOptions {
  button?: ComputerMouseButton
  modifiers?: string[]
}

export interface PiComputerScopeOption {
  scope?: ComputerInputScope
}

export type PiComputerScopedInputOptions = ComputerInputOptions & PiComputerScopeOption
