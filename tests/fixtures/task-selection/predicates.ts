import { type AgentMessage } from "@earendil-works/pi-agent-core"
import { type TranscriptContext } from "@earendil-works/pi-ai"
import { type TeamAgentRow } from "#synapse/modules/agent-team"
import { PI_REQUEST_LOG_USER_ROLE } from "../request-log"
import { SCRIPTED_PROVIDER_ASSISTANT_ROLE, SCRIPTED_PROVIDER_TOOL_USE_REASON } from "../scripted-provider"
import {
  SELECTION_MEMBER,
  SELECTION_MEMBER_RUNNING_STATUS,
  SELECTION_NOTICE_MARKER,
  SELECTION_TOOL_RESULT_ROLE,
} from "./constants"

export function isSelectionNoticeRequest(context: TranscriptContext): boolean {
  const last = context.messages.at(-1)
  const assistant = context.messages.findLast((message) => message.role === SCRIPTED_PROVIDER_ASSISTANT_ROLE)
  return Boolean(
    last?.role === PI_REQUEST_LOG_USER_ROLE &&
      JSON.stringify(last.content).includes(SELECTION_NOTICE_MARKER) &&
      assistant?.role === SCRIPTED_PROVIDER_ASSISTANT_ROLE &&
      assistant.stopReason !== SCRIPTED_PROVIDER_TOOL_USE_REASON,
  )
}

export function isSelectionToolError(message: AgentMessage): boolean {
  return message.role === SELECTION_TOOL_RESULT_ROLE && message.isError
}

export function isSelectionMemberRunning(agent: TeamAgentRow): boolean {
  return agent.name === SELECTION_MEMBER && agent.status === SELECTION_MEMBER_RUNNING_STATUS
}
