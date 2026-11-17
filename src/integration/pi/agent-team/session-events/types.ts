import { type AgentSession, type AgentSessionEvent } from "@earendil-works/pi-coding-agent"

export type TeamMemberSessionOperation =
  | "isStreaming"
  | "prompt"
  | "steer"
  | "abort"
  | "subscribe"
  | "getLastAssistantText"

export type TeamMemberSessionPort = Pick<AgentSession, TeamMemberSessionOperation>

export interface TeamMemberExecutionState {
  executionId: number
}

export type TeamMemberToolEvent = Extract<AgentSessionEvent, TeamMemberToolEventSelector>

interface TeamMemberToolEventSelector {
  type: TeamMemberToolEventType
}
type TeamMemberToolEventType = "tool_execution_start" | "tool_execution_update" | "tool_execution_end"

export type TeamMemberMessageUpdate = Extract<AgentSessionEvent, TeamMemberMessageUpdateSelector>
interface TeamMemberMessageUpdateSelector {
  type: "message_update"
}
