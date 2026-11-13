import { existsSync, statSync } from "node:fs"
import { join } from "node:path"
import { getAgentDir, SessionManager } from "@earendil-works/pi-coding-agent"
import { type MemberRecord } from "#synapse/modules"
import {
  TEAM_PI_MEMBER_DIRECTORY,
  TEAM_PI_MEMBER_MISSING_SESSION,
  TEAM_PI_MEMBER_SEED,
  TEAM_PI_MEMBER_USER_ROLE,
} from "./constants"
import { validateTeamSessionFile } from "./validate-session-file"

export function createTeamMemberStorage(cwd: string, leadId: string): SessionManager {
  const storage = SessionManager.create(cwd, join(getAgentDir(), TEAM_PI_MEMBER_DIRECTORY, leadId))
  storage.appendMessage({ role: TEAM_PI_MEMBER_USER_ROLE, content: TEAM_PI_MEMBER_SEED, timestamp: Date.now() })
  return storage
}

export function openTeamMemberStorage(record: MemberRecord): SessionManager {
  if (!existsSync(record.sessionFile)) {
    throw new Error(TEAM_PI_MEMBER_MISSING_SESSION + record.sessionFile)
  }
  const bytes = statSync(record.sessionFile).size
  if (bytes === 0) {
    throw new Error(TEAM_PI_MEMBER_MISSING_SESSION + record.sessionFile)
  }
  validateTeamSessionFile(record, bytes)
  return SessionManager.open(record.sessionFile)
}
