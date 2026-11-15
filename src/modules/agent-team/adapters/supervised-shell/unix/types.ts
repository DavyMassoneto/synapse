import { type ChildProcess } from "node:child_process"
import { type Readable, type Writable } from "node:stream"

export interface UnixKeeperProcess {
  process: ChildProcess
  status: Readable
  output: Readable
  input: Writable
  terminate(): void
}

export interface UnixKeeperEnvironmentEntry {
  name: string
  value: string
}
export interface UnixKeeperWireSpec {
  input?: string
  executable: string
  arguments: string[]
  cwd: string
  environment: UnixKeeperEnvironmentEntry[]
}

export type UnixShellExitStatus = number | null
export type UnixShellExitSignal = NodeJS.Signals | null

export type UnixGroupResolve = (groups: string) => void
export type UnixGroupReject = (error: Error) => void
export type UnixGroupReadError = Error | null
