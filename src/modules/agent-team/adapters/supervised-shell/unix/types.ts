import { type StdioOptions } from "node:child_process"
import { type Writable } from "node:stream"
import { type SupervisedWireLease } from "../wire"
export type UnixShellExitStatus = number | null
export type UnixShellExitSignal = NodeJS.Signals | null

export type UnixGroupResolve = (groups: string) => void
export type UnixGroupReject = (error: Error) => void
export type UnixGroupReadError = Error | null

export type UnixNativeDeadlineTimer = ReturnType<typeof setInterval>
export type UnixNativeStdio = StdioOptions

export type UnixKeeperChunk = Buffer | string

export interface UnixPreparedProcess {
  lease: SupervisedWireLease
  input: Writable
}
