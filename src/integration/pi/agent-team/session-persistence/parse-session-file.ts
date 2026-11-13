import { Value } from "typebox/value"
import { TEAM_PI_MEMBER_INVALID_FILE, TEAM_PI_MEMBER_NEWLINE } from "./constants"
import { TEAM_PI_MEMBER_ENTRY_SCHEMA, TEAM_PI_MEMBER_HEADER_SCHEMA } from "./schemas"
import { type TeamSessionFileIdentity } from "./types"

export function parseTeamSessionFile(content: string, path: string): TeamSessionFileIdentity {
  const end = content.trimEnd().length
  const firstNewline = content.indexOf(TEAM_PI_MEMBER_NEWLINE)
  const headerEnd = firstNewline < 0 || firstNewline > end ? end : firstNewline
  const header = content.slice(0, headerEnd)
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
