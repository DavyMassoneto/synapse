import { type SupervisedShellLease } from "#synapse/modules/agent-team/public/supervised-shell/contracts"

export type AdmissionResolve = () => void
export interface ShellAdmissionResult {
  lease: SupervisedShellLease
}

export interface ShellStopSucceeded {
  kind: "succeeded"
}
export interface ShellStopFailed {
  kind: "failed"
  error: Error
}
export type ShellStopOutcome = ShellStopSucceeded | ShellStopFailed
