import { type AgentTeam } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMemberObserver } from "../member"

export interface TeamMembershipContext {
  team: AgentTeam
  observer: TeamMemberObserver
}
