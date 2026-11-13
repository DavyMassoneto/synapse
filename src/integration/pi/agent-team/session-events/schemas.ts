import { Type } from "typebox"

export const TEAM_PI_MEMBER_TOOL_INPUT_SCHEMA = Type.Object({
  path: Type.Optional(Type.String()),
  command: Type.Optional(Type.String()),
  agent: Type.Optional(Type.String()),
  task_id: Type.Optional(Type.String()),
  action: Type.Optional(Type.String()),
  subject: Type.Optional(Type.String()),
})
