import { type AgentTeam } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMember, type TeamMemberObserver } from "../member"

export type TeamMembershipContext = AgentTeam & TeamMemberObserver

export interface TeamAdmissionAttempt {
  member?: TeamMember
}
