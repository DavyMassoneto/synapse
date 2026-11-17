import { MEMBER_TOOL_ACTIVITY_COORDINATION, MEMBER_TOOL_ACTIVITY_OBSERVATION } from "#synapse/modules/agent-team"
import {
  TEAM_TOOL_LIST_AGENTS,
  TEAM_TOOL_LIST_MODELS,
  TEAM_TOOL_SEND_MESSAGE,
  TEAM_TOOL_TASK_GET,
  TEAM_TOOL_TASK_LIST,
} from "../tools"
import { type TeamMemberToolCategories } from "./types"
export const TEAM_PI_MEMBER_ASSISTANT_ROLE = "assistant"

export const TEAM_PI_MEMBER_ERROR_REASON = "error"

export const TEAM_PI_MEMBER_RESPONSE_FAILURE = "O modelo do membro encerrou com erro sem informar a causa."

export const TEAM_PI_MEMBER_AGENT_START = "agent_start"

export const TEAM_PI_MEMBER_TURN_START = "turn_start"

export const TEAM_PI_MEMBER_TOOL_START = "tool_execution_start"

export const TEAM_PI_MEMBER_TOOL_END = "tool_execution_end"

export const TEAM_PI_MEMBER_MESSAGE_END = "message_end"

export const TEAM_PI_MEMBER_SETTLED = "agent_settled"

export const TEAM_PI_MEMBER_ACTIVITY_SEPARATOR = ": "

export const TEAM_PI_MEMBER_DETAIL_SEPARATOR = " "

export const TEAM_PI_ABORT_FAILURE = "Falha ao interromper a sessão do membro."

export const TEAM_PI_ACTIVITY_AGENT_START = "agent_start"
export const TEAM_PI_ACTIVITY_AGENT_SETTLED = "agent_settled"
export const TEAM_PI_ACTIVITY_MESSAGE_START = "message_start"
export const TEAM_PI_ACTIVITY_MESSAGE_UPDATE = "message_update"
export const TEAM_PI_ACTIVITY_MESSAGE_END = "message_end"
export const TEAM_PI_ACTIVITY_TOOL_EXECUTION_START = "tool_execution_start"
export const TEAM_PI_ACTIVITY_TOOL_EXECUTION_UPDATE = "tool_execution_update"
export const TEAM_PI_ACTIVITY_TOOL_EXECUTION_END = "tool_execution_end"
export const TEAM_PI_ACTIVITY_AUTO_RETRY_START = "auto_retry_start"
export const TEAM_PI_ACTIVITY_AUTO_RETRY_END = "auto_retry_end"
export const TEAM_PI_ACTIVITY_COMPACTION_START = "compaction_start"
export const TEAM_PI_ACTIVITY_COMPACTION_END = "compaction_end"

export const TEAM_PI_ACTIVITY_TEXT = "text"
export const TEAM_PI_ACTIVITY_THINKING = "thinking"

export const TEAM_PI_ACTIVITY_TEXT_DELTA = "text_delta"
export const TEAM_PI_ACTIVITY_THINKING_DELTA = "thinking_delta"

export const TEAM_PI_TOOL_CATEGORIES: TeamMemberToolCategories = {
  [TEAM_TOOL_LIST_AGENTS]: MEMBER_TOOL_ACTIVITY_OBSERVATION,
  [TEAM_TOOL_LIST_MODELS]: MEMBER_TOOL_ACTIVITY_OBSERVATION,
  [TEAM_TOOL_TASK_GET]: MEMBER_TOOL_ACTIVITY_OBSERVATION,
  [TEAM_TOOL_TASK_LIST]: MEMBER_TOOL_ACTIVITY_OBSERVATION,
  [TEAM_TOOL_SEND_MESSAGE]: MEMBER_TOOL_ACTIVITY_COORDINATION,
}
