import { TEAM_EXTENSIONS_MISSING_CODE } from "./constants"

export function isTeamExtensionsMissingFile(error: Error): boolean {
  return "code" in error && error.code === TEAM_EXTENSIONS_MISSING_CODE
}
