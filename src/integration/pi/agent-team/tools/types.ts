import { type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type Static, type TSchema } from "typebox"
import { type AgentTeam } from "#synapse/modules"
import {
  type TEAM_TOOL_CREATE_TASK_PARAMETERS,
  type TEAM_TOOL_GET_TASK_PARAMETERS,
  type TEAM_TOOL_INTERRUPT_AGENT_PARAMETERS,
  type TEAM_TOOL_LIST_TASKS_PARAMETERS,
  type TEAM_TOOL_NO_PARAMETERS,
  type TEAM_TOOL_SEND_MESSAGE_PARAMETERS,
  type TEAM_TOOL_SUBAGENT_PARAMETERS,
  type TEAM_TOOL_UPDATE_TASK_PARAMETERS,
  type TEAM_TOOL_WAIT_AGENT_PARAMETERS,
} from "./schemas"

export type TeamModelToolSignal = Parameters<
  ToolDefinition<typeof TEAM_TOOL_NO_PARAMETERS, TeamToolDetails>["execute"]
>[2]

export type TeamModelToolUpdate = Parameters<
  ToolDefinition<typeof TEAM_TOOL_NO_PARAMETERS, TeamToolDetails>["execute"]
>[3]

export type TeamNoInput = Static<typeof TEAM_TOOL_NO_PARAMETERS>

export type TeamSubagentInput = Static<typeof TEAM_TOOL_SUBAGENT_PARAMETERS>

export type TeamSendInput = Static<typeof TEAM_TOOL_SEND_MESSAGE_PARAMETERS>

export type TeamInterruptInput = Static<typeof TEAM_TOOL_INTERRUPT_AGENT_PARAMETERS>

export type TeamWaitInput = Static<typeof TEAM_TOOL_WAIT_AGENT_PARAMETERS>

export type TeamCreateTaskInput = Static<typeof TEAM_TOOL_CREATE_TASK_PARAMETERS>

export type TeamGetTaskInput = Static<typeof TEAM_TOOL_GET_TASK_PARAMETERS>

export type TeamListTasksInput = Static<typeof TEAM_TOOL_LIST_TASKS_PARAMETERS>

export type TeamUpdateTaskInput = Static<typeof TEAM_TOOL_UPDATE_TASK_PARAMETERS>

export interface TeamToolText {
  type: "text"
  text: string
}

export interface TeamToolDetails {
  text: string
}

export interface TeamToolOutput {
  content: TeamToolText[]
  details: TeamToolDetails
  isError: boolean
}

export type TeamToolOutcome =
  | Awaited<ReturnType<AgentTeam["start"]>>
  | ReturnType<AgentTeam["getTask"]>
  | ReturnType<AgentTeam["send"]>
  | Awaited<ReturnType<AgentTeam["wait"]>>
  | ReturnType<AgentTeam["interrupt"]>

export type TeamToolName =
  | "subagent"
  | "send_message"
  | "list_agents"
  | "wait_agent"
  | "interrupt_agent"
  | "list_models"
  | "team_task_create"
  | "team_task_list"
  | "team_task_get"
  | "team_task_update"

export type TeamRegisteredTool = Omit<
  ToolDefinition<TSchema, TeamToolDetails, never>,
  "name" | "renderCall" | "renderResult"
> &
  TeamToolIdentity

export interface TeamToolIdentity {
  name: TeamToolName
}

export interface TeamToolRegistration<T extends TSchema> {
  name: TeamToolName
  description: string
  parameters: T
  execute: ToolDefinition<T, TeamToolDetails, never>["execute"]
}
