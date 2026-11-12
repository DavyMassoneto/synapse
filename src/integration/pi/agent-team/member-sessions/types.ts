import { type AgentSession, type SessionManager, type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type AgentTeam, type OpenMemberRequest } from "#synapse/modules"
import { type SelectedMemberModel } from "../model-selection"
import { type AgentTeamContext, type AgentTeamMemberExtension } from "../types"

export interface TeamMemberSessionDependencies {
  context(): AgentTeamContext
  extension: AgentTeamMemberExtension
  tools(team: AgentTeam, caller: string): ToolDefinition[]
}

export interface TeamMemberSessionRequest {
  cwd: string
  storage: SessionManager
  selection: SelectedMemberModel
  instructions: string
  tools: ToolDefinition[]
  extension: AgentTeamMemberExtension
  extensionPaths: string[]
}

export interface TeamOpenedSession {
  session: AgentSession
  path: string
}

export interface TeamSessionCreation {
  cwd: string
  storage: SessionManager
  selection: SelectedMemberModel
  name: string
  team: AgentTeam
}

export interface TeamRecordSource {
  request: OpenMemberRequest
  selection: SelectedMemberModel
  storage: SessionManager
  path: string
  leadId: string
  cwd: string
}
