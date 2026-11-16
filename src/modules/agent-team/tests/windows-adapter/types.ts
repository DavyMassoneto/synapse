export type WindowsChannelExitCode = number | null

export interface WindowsNativeFaultCase {
  target: string
  expected: string
}

export interface SupervisedTestEnvironmentEntry {
  name: string
  value: string
}

export type WindowsFaultsResolve = (result: string) => void
export type WindowsFaultsReject = (error: Error) => void
export type WindowsFaultsError = Error | null
