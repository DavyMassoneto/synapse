import { type AgentTeam, type TeamMemberRegistry } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMember, type TeamMemberObserver } from "../member"

export type TeamAdmissionJournal = Pick<TeamMemberRegistry, "recordAdmission">

export type TeamMembershipContext = AgentTeam & TeamMemberObserver

export interface TeamAdmissionAttempt {
  member?: TeamMember
  committed?: boolean
}
