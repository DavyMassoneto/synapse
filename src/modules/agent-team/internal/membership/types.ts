import { type AgentTeam } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMemberObserver } from "../member"

export type TeamMembershipContext = AgentTeam & TeamMemberObserver
