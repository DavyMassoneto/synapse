import { type AgentTeam } from "#synapse/modules"
import {
  TEAM_TOOL_LIST_AGENTS,
  TEAM_TOOL_LIST_AGENTS_DESCRIPTION,
  TEAM_TOOL_NO_PARAMETERS,
  TEAM_TOOL_SEND_MESSAGE,
  TEAM_TOOL_SEND_MESSAGE_DESCRIPTION,
  TEAM_TOOL_SEND_MESSAGE_PARAMETERS,
  TEAM_TOOL_WAIT_AGENT,
  TEAM_TOOL_WAIT_AGENT_DESCRIPTION,
  TEAM_TOOL_WAIT_AGENT_PARAMETERS,
} from "./constants"
import { registeredTeamTool } from "./register-tool"
import { TeamAgentHandlers } from "./team-handlers"
import { type TeamRegisteredTool } from "./types"

export function teamAgentTools(team: AgentTeam, caller: string): TeamRegisteredTool[] {
  const handlers = new TeamAgentHandlers(team, caller)
  return [
    registeredTeamTool({
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
    registeredTeamTool({
      name: TEAM_TOOL_WAIT_AGENT,
      description: TEAM_TOOL_WAIT_AGENT_DESCRIPTION,
      parameters: TEAM_TOOL_WAIT_AGENT_PARAMETERS,
      execute: handlers.wait.bind(handlers),
    }),
  ]
}
