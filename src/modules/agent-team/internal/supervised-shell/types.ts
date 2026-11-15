export type AdmissionResolve = () => void
export type ShellCleanupAction = () => Promise<void>
export type ShellCleanupOutcome = ShellCleanupSuccess | ShellCleanupFailure
export interface ShellCleanupSuccess {
  failed: false
}
export interface ShellCleanupFailure {
  failed: true
  error: Error
}
