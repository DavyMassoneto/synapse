import { Value } from "typebox/value"
import {
  TEAM_PI_MEMBER_INVALID_FILE,
  TEAM_SESSION_LINE_TOO_LARGE,
  TEAM_SESSION_MAX_LINE_CODE_UNITS,
  TEAM_SESSION_NEWLINE,
} from "./constants"
import { TEAM_PI_MEMBER_ENTRY_SCHEMA, TEAM_PI_MEMBER_HEADER_SCHEMA } from "./schemas"
import { type TeamSessionFileIdentity } from "./types"

export class TeamSessionFileParser {
  private readonly path: string
  private identity?: TeamSessionFileIdentity
  private readonly segments: string[] = []
  private lineLength = 0
  private pendingLine = ""
  private hasPendingLine = false
  private trailingWhitespace = false

  constructor(path: string) {
    this.path = path
  }

  consume(chunk: string): void {
    let position = 0
    let newline = chunk.indexOf(TEAM_SESSION_NEWLINE, position)
    while (newline >= 0) {
      this.append(chunk.slice(position, newline))
      this.deferLine(this.segments.join(""))
      this.segments.length = 0
      this.lineLength = 0
      position = newline + 1
      newline = chunk.indexOf(TEAM_SESSION_NEWLINE, position)
    }
    this.append(chunk.slice(position))
  }

  finish(): TeamSessionFileIdentity {
    if (this.lineLength > 0) {
      this.deferLine(this.segments.join(""))
    }
    if (this.hasPendingLine) {
      this.parseLine(this.pendingLine.trimEnd())
    }
    if (!this.identity) {
      throw new Error(TEAM_PI_MEMBER_INVALID_FILE + this.path)
    }
    return this.identity
  }

  private append(segment: string): void {
    if (segment.length > TEAM_SESSION_MAX_LINE_CODE_UNITS - this.lineLength) {
      throw new Error(TEAM_SESSION_LINE_TOO_LARGE + this.path)
    }
    if (segment.length > 0) {
      this.segments.push(segment)
      this.lineLength += segment.length
    }
  }

  private deferLine(line: string): void {
    if (!this.hasPendingLine) {
      this.pendingLine = line
      this.hasPendingLine = true
    } else if (line.length > 0) {
      if (line.trimEnd().length === 0) {
        this.trailingWhitespace = true
      } else {
        this.parseLine(this.pendingLine)
        if (this.trailingWhitespace) {
          throw new Error(TEAM_PI_MEMBER_INVALID_FILE + this.path)
        }
        this.pendingLine = line
      }
    }
  }

  private parseLine(line: string): void {
    try {
      if (!this.identity) {
        const header = Value.Parse(TEAM_PI_MEMBER_HEADER_SCHEMA, JSON.parse(line))
        this.identity = { id: header.id, cwd: header.cwd }
      } else {
        Value.Parse(TEAM_PI_MEMBER_ENTRY_SCHEMA, JSON.parse(line))
      }
    } catch {
      throw new Error(TEAM_PI_MEMBER_INVALID_FILE + this.path)
    }
  }
}
