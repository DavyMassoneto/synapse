import { rmSync } from "node:fs"
import { type SessionManager } from "@earendil-works/pi-coding-agent"
import { TEAM_PI_CREATED_SESSION_MISSING } from "./constants"

export function requireCreatedMemberFile(storage: SessionManager): string {
  const path = storage.getSessionFile()
  if (path) {
    return path
  }
  throw new Error(TEAM_PI_CREATED_SESSION_MISSING)
}

export function removeFailedMemberFile(storage: SessionManager): void {
  const path = storage.getSessionFile()
  if (path) {
    rmSync(path, { force: true })
  }
}
