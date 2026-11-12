import { readFileSync } from "node:fs"
import { Value } from "typebox/value"
import {
  TEAM_PI_MEMBER_ENCODING,
  TEAM_PI_MEMBER_ENTRY_SCHEMA,
  TEAM_PI_MEMBER_HEADER_SCHEMA,
  TEAM_PI_MEMBER_INVALID_FILE,
  TEAM_PI_MEMBER_MAX_SESSION_BYTES,
  TEAM_PI_MEMBER_NEWLINE,
  TEAM_PI_MEMBER_SESSION_TOO_LARGE,
} from "./constants"

export function validateTeamSessionFile(path: string, bytes: number): void {
  if (bytes > TEAM_PI_MEMBER_MAX_SESSION_BYTES) {
    throw new Error(TEAM_PI_MEMBER_SESSION_TOO_LARGE + path)
  }
  const content = readFileSync(path, TEAM_PI_MEMBER_ENCODING)
  const lines = content.trimEnd().split(TEAM_PI_MEMBER_NEWLINE)
  const [header] = lines
  if (!header) {
    throw new Error(TEAM_PI_MEMBER_INVALID_FILE + path)
  }
  try {
    Value.Parse(TEAM_PI_MEMBER_HEADER_SCHEMA, JSON.parse(header))
    for (let index = 1; index < lines.length; index++) {
      const line = lines[index]
      if (line) {
        Value.Parse(TEAM_PI_MEMBER_ENTRY_SCHEMA, JSON.parse(line))
      }
    }
  } catch {
    throw new Error(TEAM_PI_MEMBER_INVALID_FILE + path)
  }
}
