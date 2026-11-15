import { type StdioOptions } from "node:child_process"
import { type Writable } from "node:stream"
import { type SupervisedWireLease } from "../wire"
export type UnixShellExitStatus = number | null

export type UnixNativeDeadlineTimer = ReturnType<typeof setInterval>
export type UnixNativeStdio = StdioOptions

export type UnixKeeperChunk = Buffer | string

export interface UnixPreparedProcess {
  lease: SupervisedWireLease
  input: Writable
}

export interface UnixControlRelease {
  kind: "release"
}
export interface UnixControlPartial {
  kind: "partial-stop"
}
export interface UnixControlInvalid {
  kind: "invalid"
}
export interface UnixControlStop {
  kind: "stop"
  deadline: bigint
}
export type UnixControlInstruction = UnixControlRelease | UnixControlPartial | UnixControlInvalid | UnixControlStop
