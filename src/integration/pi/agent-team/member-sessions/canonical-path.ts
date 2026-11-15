import { realpathSync } from "node:fs"
import { TEAM_PI_MEMBER_WINDOWS_PLATFORM } from "./constants"

export function canonicalTeamExtensionPath(path: string): string {
  const canonical = realpathSync(path)
  if (process.platform === TEAM_PI_MEMBER_WINDOWS_PLATFORM) {
    return canonical.toLowerCase()
  }
  return canonical
}
