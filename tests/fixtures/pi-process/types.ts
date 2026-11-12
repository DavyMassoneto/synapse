import { type Static } from "typebox"
import { type PiProcessMatch } from "../pi-process-matching"
import { type PiProcessScript } from "../scripted-provider"
import {
  type PI_PROCESS_RECORD_SCHEMA,
  type PI_PROCESS_SEARCH_FOUND,
  type PI_PROCESS_SEARCH_PENDING,
} from "./constants"

export type PiProcessRecord = Static<typeof PI_PROCESS_RECORD_SCHEMA>

export interface PiProcessCommand {
  type: string
  message?: string
}

export type PiProcessExitCode = number | null

export interface PiProcessResponse {
  record: PiProcessRecord
  line: string
}

export interface PiProcessSearchFound {
  kind: typeof PI_PROCESS_SEARCH_FOUND
  response: PiProcessResponse
}

export interface PiProcessSearchPending {
  kind: typeof PI_PROCESS_SEARCH_PENDING
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
  waitFor(match: PiProcessMatch, timeoutMs: number): Promise<PiProcessResponse>
  records(): PiProcessRecord[]
}

export interface PiProcessScenarioHandle {
  readonly homeDirectory: PiProcessScenarioHome
  readonly received: PiProcessScenarioRecords
  readonly stderr: string
  start(entrypoint: string): void
  command(command: PiProcessCommand): Promise<PiProcessResponse>
}

export type PiProcessScenario = (piProcess: PiProcessScenarioHandle) => Promise<void>
