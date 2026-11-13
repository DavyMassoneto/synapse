import { type MemberRecord } from "#synapse/modules"
import { TEAM_PI_MEMBER_INVALID_SESSION } from "./constants"
import { parseTeamSessionFile } from "./parse-session-file"
import { readTeamSessionFile } from "./read-session-file"

export function validateTeamSessionFile(record: MemberRecord, bytes: number): void {
  const content = readTeamSessionFile(record.sessionFile, bytes)
  const identity = parseTeamSessionFile(content, record.sessionFile)
  if (identity.id !== record.sessionId || identity.cwd !== record.cwd) {
    throw new Error(TEAM_PI_MEMBER_INVALID_SESSION + record.name)
  }
}
