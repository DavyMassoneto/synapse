import { type MemberRecord } from "#synapse/modules/agent-team/public/contracts"

export interface TeamFailedMember {
  record: MemberRecord
  message: string
}
