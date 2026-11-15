import { type ChildProcess, type StdioOptions } from "node:child_process"
import { type Readable, type Writable } from "node:stream"
import { type SupervisedWireLease } from "../wire"
export type UnixShellExitStatus = number | null

export type UnixNativeDeadlineTimer = ReturnType<typeof setInterval>
export type UnixNativeStdio = StdioOptions

export type UnixKeeperChunk = Buffer | string

export interface UnixPreparedProcess {
  lease: SupervisedWireLease
  input: Writable
}

interface UnixControlRelease {
  kind: "release"
}
interface UnixControlPartial {
  kind: "partial-stop"
}
interface UnixControlInvalid {
  kind: "invalid"
}
interface UnixControlStop {
  kind: "stop"
  deadline: bigint
}
export type UnixControlInstruction = UnixControlRelease | UnixControlPartial | UnixControlInvalid | UnixControlStop

export interface UnixNativeProcess {
  child: ChildProcess
  input: Writable
  status: Readable
}
