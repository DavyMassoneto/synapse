import { type AgentTeamHost, registerAgentTeam } from "#synapse/integration/pi/agent-team"
import { createAgentTeam } from "#synapse/modules/agent-team"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"

export function composeAgentTeam(pi: AgentTeamHost): void {
  registerAgentTeam(pi, createAgentTeam, createSupervisedShell)
}
