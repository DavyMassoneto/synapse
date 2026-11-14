import { type AgentTeamHost, registerAgentTeam } from "#synapse/integration"
import { createAgentTeam } from "#synapse/modules"

export function composeAgentTeam(pi: AgentTeamHost): void {
  registerAgentTeam(pi, createAgentTeam)
}
