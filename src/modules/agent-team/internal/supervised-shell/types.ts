export type ShellCleanupAction = () => void | Promise<void>
export type ShellCleanupOutcome = ShellCleanupSuccess | ShellCleanupFailure
interface ShellCleanupSuccess {
  failed: false
}
export interface ShellCleanupFailure {
  failed: true
  error: Error
}
