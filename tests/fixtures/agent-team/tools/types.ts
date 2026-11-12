import { type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type MemberModelContext, type TeamAgentHandlers, type TeamTaskHandlers } from "#synapse/integration"
import { type ToolsTeamDouble } from "./team-double"

export interface TeamToolsSut {
  team: ToolsTeamDouble
  tools: ToolDefinition[]
  handlers: TeamAgentHandlers
  tasks: TeamTaskHandlers
}

export interface MemberModelSut {
  context: MemberModelContext
  registry: ToolsModelTestRegistry
}

export type ToolsModelTestRegistry = ToolsModelRegistryPort & ToolsModelAuthState

export interface ToolsModelAuthState {
  authorized: boolean
}

export type ToolsModelRegistryPort = MemberModelContext["modelRegistry"]
