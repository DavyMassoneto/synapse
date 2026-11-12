import { Type } from "typebox"

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

export const TEAM_PI_MEMBER_TOOL_INPUT_SCHEMA = Type.Object({
  path: Type.Optional(Type.String()),
  command: Type.Optional(Type.String()),
  agent: Type.Optional(Type.String()),
  task_id: Type.Optional(Type.String()),
  action: Type.Optional(Type.String()),
  subject: Type.Optional(Type.String()),
})
