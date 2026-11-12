import { type ComputerDriverLaunch, type ComputerDriverManifest } from "#synapse/modules/computer-use/public/contracts"
import { type ComputerActionDispatch } from "../action-dispatch"
import { type COMPUTER_SESSION_DISPATCH_ACTIVE, type COMPUTER_SESSION_DISPATCH_IDLE } from "./constants"
export type ComputerAttemptOperation<T> = () => Promise<T>

export type ComputerAttemptFailure<T> = (message: string) => T

export interface ComputerCheckedDriver {
  launch: ComputerDriverLaunch
  manifest: ComputerDriverManifest
}

export interface ComputerDispatchIdle {
  kind: typeof COMPUTER_SESSION_DISPATCH_IDLE
}

export interface ComputerDispatchActive {
  kind: typeof COMPUTER_SESSION_DISPATCH_ACTIVE
  dispatch: ComputerActionDispatch
}

export type ComputerDispatchState = ComputerDispatchIdle | ComputerDispatchActive
