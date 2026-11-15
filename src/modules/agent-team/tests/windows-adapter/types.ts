import { type ChildProcess } from "node:child_process"
export type WindowsChannelExitCode = number | null
export type WindowsSentinel = ChildProcess | null

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
