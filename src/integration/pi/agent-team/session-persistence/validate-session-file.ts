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
  let end = content.length
  while (end > 0 && content.slice(end - 1, end).trimEnd().length === 0) {
    end--
  }
  const firstNewline = content.indexOf(TEAM_PI_MEMBER_NEWLINE)
  const headerEnd = firstNewline < 0 || firstNewline > end ? end : firstNewline
  const header = content.slice(0, headerEnd)
  if (!header) {
    throw new Error(TEAM_PI_MEMBER_INVALID_FILE + path)
  }
  const identity = parseTeamSessionFile(content, header, headerEnd, end, path)
  if (identity.id !== record.sessionId || identity.cwd !== record.cwd) {
    throw new Error(TEAM_PI_MEMBER_INVALID_SESSION + record.name)
  }
}

function parseTeamSessionFile(
  content: string,
  header: string,
  headerEnd: number,
  end: number,
  path: string,
): TeamSessionFileIdentity {
  try {
    const identity = Value.Parse(TEAM_PI_MEMBER_HEADER_SCHEMA, JSON.parse(header))
    let position = headerEnd + 1
    while (position < end) {
      const newline = content.indexOf(TEAM_PI_MEMBER_NEWLINE, position)
      const lineEnd = newline < 0 || newline > end ? end : newline
      if (lineEnd > position) {
        Value.Parse(TEAM_PI_MEMBER_ENTRY_SCHEMA, JSON.parse(content.slice(position, lineEnd)))
      }
      position = lineEnd + 1
    }
    return identity
  } catch {
    throw new Error(TEAM_PI_MEMBER_INVALID_FILE + path)
  }
}
