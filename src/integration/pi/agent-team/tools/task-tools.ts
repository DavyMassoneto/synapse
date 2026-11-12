import { type AgentTeam } from "#synapse/modules"
import {
  TEAM_TOOL_CREATE_TASK_PARAMETERS,
  TEAM_TOOL_GET_TASK_PARAMETERS,
  TEAM_TOOL_LIST_TASKS_PARAMETERS,
  TEAM_TOOL_TASK_CREATE,
  TEAM_TOOL_TASK_CREATE_DESCRIPTION,
  TEAM_TOOL_TASK_GET,
  TEAM_TOOL_TASK_GET_DESCRIPTION,
  TEAM_TOOL_TASK_LIST,
  TEAM_TOOL_TASK_LIST_DESCRIPTION,
  TEAM_TOOL_TASK_UPDATE,
  TEAM_TOOL_TASK_UPDATE_DESCRIPTION,
  TEAM_TOOL_UPDATE_TASK_PARAMETERS,
} from "./constants"
import { registeredTeamTool } from "./register-tool"
import { TeamTaskHandlers } from "./task-handlers"
import { type TeamRegisteredTool } from "./types"

function taskMutationTools(handlers: TeamTaskHandlers): TeamRegisteredTool[] {
  return [
    registeredTeamTool({
      name: TEAM_TOOL_TASK_CREATE,
      description: TEAM_TOOL_TASK_CREATE_DESCRIPTION,
      parameters: TEAM_TOOL_CREATE_TASK_PARAMETERS,
      execute: handlers.create.bind(handlers),
    }),
    registeredTeamTool({
      name: TEAM_TOOL_TASK_UPDATE,
      description: TEAM_TOOL_TASK_UPDATE_DESCRIPTION,
      parameters: TEAM_TOOL_UPDATE_TASK_PARAMETERS,
      execute: handlers.update.bind(handlers),
    }),
  ]
}

function taskQueryTools(handlers: TeamTaskHandlers): TeamRegisteredTool[] {
  return [
    registeredTeamTool({
      name: TEAM_TOOL_TASK_GET,
      description: TEAM_TOOL_TASK_GET_DESCRIPTION,
      parameters: TEAM_TOOL_GET_TASK_PARAMETERS,
      execute: handlers.get.bind(handlers),
    }),
    registeredTeamTool({
      name: TEAM_TOOL_TASK_LIST,
      description: TEAM_TOOL_TASK_LIST_DESCRIPTION,
      parameters: TEAM_TOOL_LIST_TASKS_PARAMETERS,
      execute: handlers.listTasks.bind(handlers),
    }),
  ]
}

export function teamTaskTools(team: AgentTeam, caller: string): TeamRegisteredTool[] {
  const handlers = new TeamTaskHandlers(team, caller)
  return [...taskMutationTools(handlers), ...taskQueryTools(handlers)]
}
