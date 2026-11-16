import { type AgentTeamHost, registerAgentTeam } from "#synapse/integration/pi/agent-team"
import { createAgentTeam, createSupervisedShell } from "#synapse/modules/agent-team"

export function composeAgentTeam(pi: AgentTeamHost): void {
  registerAgentTeam(pi, createAgentTeam, createSupervisedShell)
}
