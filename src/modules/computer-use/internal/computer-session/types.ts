import { type ComputerDriverLaunch, type ComputerDriverManifest } from "#synapse/modules/computer-use/public/contracts"
import { type ComputerActionDispatch } from "../action-dispatch"
export type ComputerAttemptOperation<T> = () => Promise<T>

export type ComputerAttemptFailure<T> = (message: string) => T

export interface ComputerCheckedDriver {
  launch: ComputerDriverLaunch
  manifest: ComputerDriverManifest
}

export interface ComputerDispatchIdle {
  kind: "dispatch-idle"
}

export interface ComputerDispatchActive {
  kind: "dispatch-active"
  dispatch: ComputerActionDispatch
}

export type ComputerDispatchState = ComputerDispatchIdle | ComputerDispatchActive
