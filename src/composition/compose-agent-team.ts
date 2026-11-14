import { type AgentTeamHost, registerAgentTeam } from "#synapse/integration"
import { createAgentTeam } from "#synapse/modules"
import { selectMemberFactories } from "./member-factories"

export function composeAgentTeam(pi: AgentTeamHost): void {
  registerAgentTeam(pi, createAgentTeam, selectMemberFactories.bind(undefined, pi))
}
