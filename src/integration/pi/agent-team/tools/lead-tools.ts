import { type AgentTeam, TEAM_LEAD_NAME } from "#synapse/modules"
import {
  TEAM_TOOL_INTERRUPT_AGENT,
  TEAM_TOOL_INTERRUPT_AGENT_DESCRIPTION,
  TEAM_TOOL_LIST_MODELS,
  TEAM_TOOL_LIST_MODELS_DESCRIPTION,
  TEAM_TOOL_SUBAGENT,
  TEAM_TOOL_SUBAGENT_DESCRIPTION,
} from "./constants"
import { listTeamModels } from "./list-models"
import { memberTools } from "./member-tools"
import { registeredTeamTool } from "./register-tool"
import { TEAM_TOOL_INTERRUPT_AGENT_PARAMETERS, TEAM_TOOL_NO_PARAMETERS, TEAM_TOOL_SUBAGENT_PARAMETERS } from "./schemas"
import { TeamAgentHandlers } from "./team-handlers"
import { type TeamRegisteredTool } from "./types"

export function leadTools(team: AgentTeam): TeamRegisteredTool[] {
  const handlers = new TeamAgentHandlers(team, TEAM_LEAD_NAME)
  return [
    registeredTeamTool({
      name: TEAM_TOOL_SUBAGENT,
      description: TEAM_TOOL_SUBAGENT_DESCRIPTION,
      parameters: TEAM_TOOL_SUBAGENT_PARAMETERS,
      execute: handlers.subagent.bind(handlers),
    }),
    registeredTeamTool({
      name: TEAM_TOOL_INTERRUPT_AGENT,
      description: TEAM_TOOL_INTERRUPT_AGENT_DESCRIPTION,
      parameters: TEAM_TOOL_INTERRUPT_AGENT_PARAMETERS,
      execute: handlers.interrupt.bind(handlers),
    }),
    registeredTeamTool({
      name: TEAM_TOOL_LIST_MODELS,
      description: TEAM_TOOL_LIST_MODELS_DESCRIPTION,
      parameters: TEAM_TOOL_NO_PARAMETERS,
      execute: listTeamModels,
    }),
    ...memberTools(team, TEAM_LEAD_NAME),
  ]
}
