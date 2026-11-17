import { type MemberRecord } from "#synapse/modules/agent-team"
import { TEAM_PI_MEMBER_INVALID_SESSION } from "./constants"
import { readTeamSessionFile } from "./read-session-file"

export function validateTeamSessionFile(record: MemberRecord): void {
  const identity = readTeamSessionFile(record.sessionFile)
  if (identity.id !== record.sessionId || identity.cwd !== record.cwd) {
    throw new Error(TEAM_PI_MEMBER_INVALID_SESSION + record.name)
  }
}
