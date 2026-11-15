export type ShellCleanupAction = () => Promise<void>
export type ShellCleanupOutcome = ShellCleanupSuccess | ShellCleanupFailure
export interface ShellCleanupSuccess {
  failed: false
  kind: "cleanup"
}
export interface ShellCleanupFailure {
  failed: true
  error: Error
}

export type ShellOperationOutcome<T> = ShellOperationSuccess<T> | ShellCleanupFailure
export type ShellCaptureOutcome<T> = ShellOperationOutcome<T> | ShellCleanupOutcome
export interface ShellOperationSuccess<T> {
  failed: false
  kind: "operation"
  value: T
}
export type ShellOperationInput<T> = ShellCleanupAction | Promise<T>
