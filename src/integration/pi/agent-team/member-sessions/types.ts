import { type AgentSession, type SessionManager } from "@earendil-works/pi-coding-agent"
import { type AgentTeam, type OpenMemberRequest } from "#synapse/modules"
import { type TeamMemberExtensionLifetime } from "../extension-lifecycle"
import { type AgentTeamContext } from "../lead-session"
import { type SelectedMemberModel } from "../model-selection"
import { type TeamRegisteredTool } from "../tools"
import { type AgentTeamMemberExtension } from "../types"

export interface TeamMemberSessionDependencies {
  context(): AgentTeamContext
  extension: AgentTeamMemberExtension
  tools(team: AgentTeam, caller: string): TeamRegisteredTool[]
}

export interface TeamMemberSessionRequest {
  cwd: string
  storage: SessionManager
  selection: SelectedMemberModel
  instructions: string
  tools: TeamRegisteredTool[]
  extension: AgentTeamMemberExtension
  extensionPaths: string[]
}

export interface TeamCreatedMemberSession {
  session: AgentSession
  lifecycle: TeamMemberExtensionLifetime
}

export interface TeamOpenedSession {
  session: TeamCreatedMemberSession
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
