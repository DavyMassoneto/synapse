import { type SettingsManager } from "@earendil-works/pi-coding-agent"
import { type PiTeamMemberSessions, type TeamMemberResourceLoader } from "#synapse/integration"
import { type TeamLeadContext, type ToolsTeamDouble } from "../agent-team"

export interface MemberConfigFixture {
  directory: string
  agentDirectory: string
  cwd: string
  extension: string
  other: string
  settings: SettingsManager
  loader: TeamMemberResourceLoader
}

export interface MemberConfigSessionFixture {
  context: TeamLeadContext
  sessions: PiTeamMemberSessions
  team: ToolsTeamDouble
}
