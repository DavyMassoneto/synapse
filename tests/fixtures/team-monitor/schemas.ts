import { Type } from "typebox"

export const MONITOR_TOOL_PARAMETERS = Type.Object({
  command: Type.String(),
  path: Type.String(),
  agent: Type.String(),
  task_id: Type.String(),
  action: Type.String(),
  subject: Type.String(),
})
