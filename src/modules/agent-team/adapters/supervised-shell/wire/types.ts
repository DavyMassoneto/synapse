import { type ChildProcess } from "node:child_process"
import { type Readable, type Writable } from "node:stream"

export interface ShellWireProcess {
  process: ChildProcess
  status: Readable
  output: Readable
  input: Writable
  requiresEmptyAck: boolean
  confirmEmpty(): Promise<void>
  terminate(): void
}
export type ShellWireReject = (error: Error) => void
export type ShellWireReadyResolve = () => void

export interface ShellWireEnvironmentEntry {
  name: string
  value: string
}
export interface ShellWireSpec {
  input?: string
  executable: string
  arguments: string[]
  cwd: string
  environment: ShellWireEnvironmentEntry[]
}

export interface ShellWireWaiting {
  kind: "waiting"
}
export interface ShellWireCreated {
  kind: "created"
}
export interface ShellWireReleased {
  kind: "released"
}
export interface ShellWireCompleted {
  kind: "completed"
  exitCode: number
  acceptedBytes: number
}
export interface ShellWireFailed {
  kind: "failed"
}
export type ShellWireStatus =
  | ShellWireWaiting
  | ShellWireCreated
  | ShellWireReleased
  | ShellWireCompleted
  | ShellWireFailed
