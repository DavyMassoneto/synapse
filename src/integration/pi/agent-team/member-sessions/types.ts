import {
  type AgentSession,
  type DefaultPackageManager,
  type SessionManager,
  type SettingsManager,
  type ToolDefinition,
} from "@earendil-works/pi-coding-agent"
import {
  type AgentTeam,
  type OpenMemberRequest,
  type SupervisedShellFactory,
  type SupervisedShellService,
} from "#synapse/modules/agent-team"
import { type TeamMemberExtensionLifetime } from "../extension-lifecycle"
import { type AgentTeamContext } from "../lead-session"
import { type SelectedMemberModel } from "../model-selection"
import { type TeamRegisteredTool } from "../tools"

export interface TeamMemberSessionDependencies {
  shell: SupervisedShellFactory
  context(): AgentTeamContext
  tools(team: AgentTeam, caller: string): TeamRegisteredTool[]
}

export interface TeamMemberSessionRequest {
  cwd: string
  storage: SessionManager
  selection: SelectedMemberModel
  instructions: string
  tools: TeamRegisteredTool[]
  projectTrusted: boolean
  shell: SupervisedShellService
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
  projectTrusted: boolean
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

export interface TeamMemberResourceRequest {
  tools?: ToolDefinition[]
  shell?: SupervisedShellService
  cwd: string
  agentDirectory: string
  instructions: string
  settings: SettingsManager
}

export type TeamMemberResources = Awaited<ReturnType<DefaultPackageManager["resolve"]>>
export type TeamExcludedExtensionPaths = Set<string>
