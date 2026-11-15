export type ShellRequirementResolve = () => void
export type ShellRequirementReject = (error: Error) => void
export type ShellRequirementError = Error | null
export interface ShellRequirementOptions {
  signal?: AbortSignal
}
