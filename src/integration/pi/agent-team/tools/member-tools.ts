import { type AgentTeam } from "#synapse/modules"
import { teamAgentTools } from "./agent-tools"
import { teamTaskTools } from "./task-tools"
import { type TeamRegisteredTool } from "./types"

export function memberTools(team: AgentTeam, memberName: string): TeamRegisteredTool[] {
  return [...teamAgentTools(team, memberName), ...teamTaskTools(team, memberName)]
}
