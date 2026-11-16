export type ShellCleanupAction<T> = () => T | Promise<T>
export type ShellCleanupInput<T> = ShellCleanupAction<T> | Promise<T>
export type ShellOperationOutcome<T> = ShellOperationSuccess<T> | ShellCleanupFailure
export interface ShellOperationSuccess<T> {
  failed: false
  value: T
}
export interface ShellCleanupFailure {
  failed: true
  error: Error
}
export type ShellCleanupOutcome = ShellOperationOutcome<void>

export type ShellCleanupReject = (error: Error) => void
