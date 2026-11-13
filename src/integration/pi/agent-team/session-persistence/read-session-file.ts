import { readFileSync } from "node:fs"
import {
  TEAM_PI_MEMBER_ENCODING,
  TEAM_PI_MEMBER_MAX_SESSION_BYTES,
  TEAM_PI_MEMBER_SESSION_TOO_LARGE,
} from "./constants"

export function readTeamSessionFile(path: string, bytes: number): string {
  if (bytes > TEAM_PI_MEMBER_MAX_SESSION_BYTES) {
    throw new Error(TEAM_PI_MEMBER_SESSION_TOO_LARGE + path)
  }
  return readFileSync(path, TEAM_PI_MEMBER_ENCODING)
}
