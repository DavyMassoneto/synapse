import { type ToolExecutionStartEvent } from "@earendil-works/pi-coding-agent"
import { Value } from "typebox/value"
import { TEAM_PI_MEMBER_ACTIVITY_SEPARATOR, TEAM_PI_MEMBER_DETAIL_SEPARATOR } from "./constants"
import { TEAM_PI_MEMBER_TOOL_INPUT_SCHEMA } from "./schemas"

export function teamMemberActivity(event: ToolExecutionStartEvent): string {
  if (!Value.Check(TEAM_PI_MEMBER_TOOL_INPUT_SCHEMA, event.args)) {
    return event.toolName
  }
  const input = event.args
  const fields = [input.path, input.command, input.agent, input.task_id, input.action, input.subject]
  const detail = fields.filter((field) => field).join(TEAM_PI_MEMBER_DETAIL_SEPARATOR)
  if (detail) {
    return `${event.toolName}${TEAM_PI_MEMBER_ACTIVITY_SEPARATOR}${detail}`
  }
  return event.toolName
}
