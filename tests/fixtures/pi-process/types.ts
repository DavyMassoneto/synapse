import { type Static } from "typebox"
import { type ScriptedProviderScript } from "../scripted-provider"
import { type PI_PROCESS_NOTICE_SCHEMA, type PI_PROCESS_RECORD_SCHEMA, type PI_PROCESS_STATUS_SCHEMA } from "./schemas"

export type PiProcessStatus = Static<typeof PI_PROCESS_STATUS_SCHEMA>

export type PiProcessNotice = Static<typeof PI_PROCESS_NOTICE_SCHEMA>

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
  script(steps: ScriptedProviderScript): void
}

export interface PiProcessScenarioRecords {
  waitForUi(method: "setStatus", timeoutMs: number): Promise<PiProcessStatus>
  waitForUi(method: "notify", timeoutMs: number): Promise<PiProcessNotice>
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

export type PiProcessUiMethod = "setStatus" | "notify"

export type PiProcessUiEvent = PiProcessStatus | PiProcessNotice

export interface PiProcessUiMatches {
  setStatus: PiProcessMatch
  notify: PiProcessMatch
}
