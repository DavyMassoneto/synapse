import { type AgentTeam } from "#synapse/modules/agent-team"
import { TeamAgentHandlers } from "./agent-handlers"
import {
  TEAM_TOOL_LIST_AGENTS,
  TEAM_TOOL_LIST_AGENTS_DESCRIPTION,
  TEAM_TOOL_SEND_MESSAGE,
  TEAM_TOOL_SEND_MESSAGE_DESCRIPTION,
  TEAM_TOOL_SEQUENTIAL,
} from "./constants"
import { registeredTeamTool } from "./register-tool"
import { TEAM_TOOL_NO_PARAMETERS, TEAM_TOOL_SEND_MESSAGE_PARAMETERS } from "./schemas"
import { type TeamRegisteredTool } from "./types"

export function teamAgentTools(team: AgentTeam, caller: string): TeamRegisteredTool[] {
  const handlers = new TeamAgentHandlers(team, caller)
  return [
    registeredTeamTool({
      executionMode: TEAM_TOOL_SEQUENTIAL,
      name: TEAM_TOOL_SEND_MESSAGE,
      description: TEAM_TOOL_SEND_MESSAGE_DESCRIPTION,
      parameters: TEAM_TOOL_SEND_MESSAGE_PARAMETERS,
      execute: handlers.send.bind(handlers),
    }),
    registeredTeamTool({
      name: TEAM_TOOL_LIST_AGENTS,
      description: TEAM_TOOL_LIST_AGENTS_DESCRIPTION,
      parameters: TEAM_TOOL_NO_PARAMETERS,
      execute: handlers.list.bind(handlers),
    }),
  ]
}
