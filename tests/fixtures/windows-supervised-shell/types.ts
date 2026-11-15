export interface WindowsProofSpec {
  executable: string
  commandLine: string
  cwd: string
  environment: string
  failAssignment: boolean
}
export interface WindowsProofResult {
  outputBeforeRelease: boolean
  markerWhileRunning: boolean
  code: number
  output: string
  error: string
}
export type WindowsProofResolve = (result: WindowsProofResult) => void
export type WindowsProofReject = (error: Error) => void

export type WindowsProofExitCode = number | null
