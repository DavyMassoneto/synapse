import { type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type Static, type TSchema } from "typebox"
import { type AgentTeam } from "#synapse/modules"
import {
  type TEAM_TOOL_CREATE_TASK_PARAMETERS,
  type TEAM_TOOL_GET_TASK_PARAMETERS,
  type TEAM_TOOL_INTERRUPT_AGENT,
  type TEAM_TOOL_INTERRUPT_AGENT_PARAMETERS,
  type TEAM_TOOL_LIST_AGENTS,
  type TEAM_TOOL_LIST_MODELS,
  type TEAM_TOOL_LIST_TASKS_PARAMETERS,
  type TEAM_TOOL_NO_PARAMETERS,
  type TEAM_TOOL_SEND_MESSAGE,
  type TEAM_TOOL_SEND_MESSAGE_PARAMETERS,
  type TEAM_TOOL_SUBAGENT,
  type TEAM_TOOL_SUBAGENT_PARAMETERS,
  type TEAM_TOOL_TASK_CREATE,
  type TEAM_TOOL_TASK_GET,
  type TEAM_TOOL_TASK_LIST,
  type TEAM_TOOL_TASK_UPDATE,
  type TEAM_TOOL_UPDATE_TASK_PARAMETERS,
  type TEAM_TOOL_WAIT_AGENT,
  type TEAM_TOOL_WAIT_AGENT_PARAMETERS,
} from "./constants"

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
  | typeof TEAM_TOOL_SUBAGENT
  | typeof TEAM_TOOL_SEND_MESSAGE
  | typeof TEAM_TOOL_LIST_AGENTS
  | typeof TEAM_TOOL_WAIT_AGENT
  | typeof TEAM_TOOL_INTERRUPT_AGENT
  | typeof TEAM_TOOL_LIST_MODELS
  | typeof TEAM_TOOL_TASK_CREATE
  | typeof TEAM_TOOL_TASK_LIST
  | typeof TEAM_TOOL_TASK_GET
  | typeof TEAM_TOOL_TASK_UPDATE

export type TeamRegisteredTool = Omit<ToolDefinition, "name"> & TeamToolIdentity

export interface TeamToolIdentity {
  name: TeamToolName
}

export type TeamWaitSignal = Parameters<AgentTeam["wait"]>[2]

export interface TeamToolRegistration<T extends TSchema> {
  name: TeamToolName
  description: string
  parameters: T
  execute: ToolDefinition<T, TeamToolDetails>["execute"]
}
