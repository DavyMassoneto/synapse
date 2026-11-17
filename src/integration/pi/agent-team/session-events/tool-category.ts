import { MEMBER_TOOL_ACTIVITY_EXECUTION, type MemberToolActivityCategory } from "#synapse/modules/agent-team"
import {
  TEAM_TOOL_LIST_AGENTS,
  TEAM_TOOL_LIST_MODELS,
  TEAM_TOOL_SEND_MESSAGE,
  TEAM_TOOL_TASK_GET,
  TEAM_TOOL_TASK_LIST,
} from "../tools"
import { TEAM_PI_TOOL_CATEGORIES } from "./constants"

export function memberToolActivityCategory(name: string): MemberToolActivityCategory {
  switch (name) {
    case TEAM_TOOL_LIST_AGENTS:
    case TEAM_TOOL_LIST_MODELS:
    case TEAM_TOOL_TASK_GET:
    case TEAM_TOOL_TASK_LIST:
    case TEAM_TOOL_SEND_MESSAGE:
      return TEAM_PI_TOOL_CATEGORIES[name]
    default:
      return MEMBER_TOOL_ACTIVITY_EXECUTION
  }
}
