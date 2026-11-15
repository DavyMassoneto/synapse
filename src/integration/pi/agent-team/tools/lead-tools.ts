import { type AgentTeam, TEAM_LEAD_NAME } from "#synapse/modules/agent-team"
import { TeamAgentHandlers } from "./agent-handlers"
import {
  TEAM_TOOL_INTERRUPT_AGENT,
  TEAM_TOOL_INTERRUPT_AGENT_DESCRIPTION,
  TEAM_TOOL_LIST_MODELS,
  TEAM_TOOL_LIST_MODELS_DESCRIPTION,
  TEAM_TOOL_MODEL_ONLY,
  TEAM_TOOL_SEQUENTIAL,
  TEAM_TOOL_SUBAGENT,
  TEAM_TOOL_SUBAGENT_DESCRIPTION,
  TEAM_TOOL_TASK_CLEAN,
  TEAM_TOOL_TASK_CLEAN_DESCRIPTION,
} from "./constants"
import { listTeamModels } from "./list-models"
import { memberTools } from "./member-tools"
import { registeredTeamTool } from "./register-tool"
import { TEAM_TOOL_INTERRUPT_AGENT_PARAMETERS, TEAM_TOOL_NO_PARAMETERS, TEAM_TOOL_SUBAGENT_PARAMETERS } from "./schemas"
import { TeamTaskHandlers } from "./task-handlers"
import { type TeamRegisteredTool } from "./types"

export function leadTools(team: AgentTeam): TeamRegisteredTool[] {
  const handlers = new TeamAgentHandlers(team, TEAM_LEAD_NAME)
  const tasks = new TeamTaskHandlers(team, TEAM_LEAD_NAME)
  return [
    registeredTeamTool({
      exposure: TEAM_TOOL_MODEL_ONLY,
      executionMode: TEAM_TOOL_SEQUENTIAL,
      name: TEAM_TOOL_TASK_CLEAN,
      description: TEAM_TOOL_TASK_CLEAN_DESCRIPTION,
      parameters: TEAM_TOOL_NO_PARAMETERS,
      execute: tasks.clean.bind(tasks),
    }),
    registeredTeamTool({
      executionMode: TEAM_TOOL_SEQUENTIAL,
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
