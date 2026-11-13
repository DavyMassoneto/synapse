import { readFileSync } from "node:fs"
import { Value } from "typebox/value"
import { type MemberRecord } from "#synapse/modules"
import {
  TEAM_PI_MEMBER_ENCODING,
  TEAM_PI_MEMBER_INVALID_FILE,
  TEAM_PI_MEMBER_INVALID_SESSION,
  TEAM_PI_MEMBER_MAX_SESSION_BYTES,
  TEAM_PI_MEMBER_NEWLINE,
  TEAM_PI_MEMBER_SESSION_TOO_LARGE,
} from "./constants"
import { TEAM_PI_MEMBER_ENTRY_SCHEMA, TEAM_PI_MEMBER_HEADER_SCHEMA } from "./schemas"
import { type TeamSessionFileIdentity } from "./types"

export function validateTeamSessionFile(record: MemberRecord, bytes: number): void {
  const path = record.sessionFile
  if (bytes > TEAM_PI_MEMBER_MAX_SESSION_BYTES) {
    throw new Error(TEAM_PI_MEMBER_SESSION_TOO_LARGE + path)
  }
  const content = readFileSync(path, TEAM_PI_MEMBER_ENCODING)
  const lines = content.trimEnd().split(TEAM_PI_MEMBER_NEWLINE)
  const [header] = lines
  if (!header) {
    throw new Error(TEAM_PI_MEMBER_INVALID_FILE + path)
  }
  const identity = parseTeamSessionFile(lines, header, path)
  if (identity.id !== record.sessionId || identity.cwd !== record.cwd) {
    throw new Error(TEAM_PI_MEMBER_INVALID_SESSION + record.name)
  }
}

function parseTeamSessionFile(lines: string[], header: string, path: string): TeamSessionFileIdentity {
  try {
    const identity = Value.Parse(TEAM_PI_MEMBER_HEADER_SCHEMA, JSON.parse(header))
    for (let index = 1; index < lines.length; index++) {
      const line = lines[index]
      if (line) {
        Value.Parse(TEAM_PI_MEMBER_ENTRY_SCHEMA, JSON.parse(line))
      }
    }
    return identity
  } catch {
    throw new Error(TEAM_PI_MEMBER_INVALID_FILE + path)
  }
}
