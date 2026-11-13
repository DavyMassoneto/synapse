import { type MemberRecord } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMember } from "../member"

export interface TeamFailedMember {
  record: MemberRecord
  message: string
}

export type TeamMembers = Map<string, TeamMember>

export type TeamFailedMembers = Map<string, TeamFailedMember>
