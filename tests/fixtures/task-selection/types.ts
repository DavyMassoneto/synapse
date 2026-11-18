import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { type Static } from "typebox"
import { type AgentTeam } from "#synapse/modules/agent-team"
import { type SELECTION_REQUESTS_SCHEMA } from "./schemas"

export type SelectionRequest = Static<typeof SELECTION_REQUESTS_SCHEMA>

export type SelectionCleanupFailure = Error | string

export type SelectionCleanupFailures = SelectionCleanupFailure[]

export type SelectionCleanupAction = () => void | Promise<void>

export interface SelectionSessionCleanup {
  team?: AgentTeam
  session?: AgentSession
  releaseDirectory: SelectionCleanupAction
}

export interface SelectionPaths {
  directory: string
  agentDirectory: string
  cwd: string
}

export interface SelectionRequestContext {
  selected: string
  external: boolean
}
