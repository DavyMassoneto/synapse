import { type ChildProcess } from "node:child_process"
import { type Readable, type Writable } from "node:stream"

export interface ShellWireProcess {
  process: ChildProcess
  status: Readable
  output: Readable
  input: Writable
  requiresEmptyAck: boolean
  preparationTerminal?: boolean
  confirmEmpty(): Promise<void>
  terminate(deadline?: bigint): void
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
export interface ShellWirePreparationCancelled {
  kind: "preparation-empty"
  reason: "cancelled"
}
export interface ShellWirePreparationFailed {
  kind: "preparation-empty"
  reason: "failed"
  error: string
}
export type ShellWirePreparationEmpty = ShellWirePreparationCancelled | ShellWirePreparationFailed
export type ShellUserAuthorization = "forbidden" | "authorized"
export type ShellReleaseRequest = "absent" | "sent" | "revoked"
export type ShellGateCommit = "closed" | "revoked" | "execution"
export type ShellReservationProof = "absent" | "empty" | "uncertain"

export type ShellWireStatus =
  | ShellWirePreparationEmpty
  | ShellWireWaiting
  | ShellWireCreated
  | ShellWireReleased
  | ShellWireCompleted
  | ShellWireFailed
