import { type Static } from "typebox"
import { type PiProcessScript } from "../scripted-provider"
import { type PI_PROCESS_RECORD_SCHEMA } from "./schemas"

export type PiProcessRecord = Static<typeof PI_PROCESS_RECORD_SCHEMA>

export interface PiProcessCommand {
  type: string
  message?: string
}

export type PiProcessExitCode = number | null

export interface PiProcessSearchFound {
  kind: "found"
  response: PiProcessRecord
}

export interface PiProcessSearchPending {
  kind: "pending"
  offset: number
}

export type PiProcessSearch = PiProcessSearchFound | PiProcessSearchPending

export interface PiProcessDiagnosticAccepted {
  kind: "accepted"
}

export interface PiProcessDiagnosticFailure {
  kind: "failure"
  error: Error
}

export type PiProcessDiagnostic = PiProcessDiagnosticAccepted | PiProcessDiagnosticFailure

export interface PiProcessScenarioHome {
  readonly home: string
  readonly agentDirectory: string
  script(steps: PiProcessScript): void
}

export interface PiProcessScenarioRecords {
  waitFor(match: PiProcessMatch, timeoutMs: number): Promise<PiProcessRecord>
}

export interface PiProcessScenarioHandle {
  readonly homeDirectory: PiProcessScenarioHome
  readonly received: PiProcessScenarioRecords
  readonly stderr: string
  start(entrypoint: string): void
  command(command: PiProcessCommand): Promise<PiProcessRecord>
}

export type PiProcessScenario = (piProcess: PiProcessScenarioHandle) => Promise<void>

export type PiProcessClosePromise = Promise<void>

export type PiProcessCloseResolver = () => void

export interface PiProcessMatch {
  type: string
  id?: string
  method?: string
  statusKey?: string
}
