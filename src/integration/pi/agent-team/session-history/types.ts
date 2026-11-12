import { type ExtensionContext } from "@earendil-works/pi-coding-agent"
import { type MemberRecord, type TaskSnapshot } from "#synapse/modules"

export type TeamMembersByName = Map<string, MemberRecord>

export interface TeamHistory {
  members: MemberRecord[]
  tasks: TaskSnapshot[]
}

export type TeamHistorySessionManager = Pick<ExtensionContext["sessionManager"], "getBranch">
