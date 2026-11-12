import { isAbsolute, relative, sep } from "node:path"
import { TEAM_EXTENSIONS_MISSING_CODE, TEAM_EXTENSIONS_PARENT_SEGMENT } from "./constants"

export function isTeamExtensionOutsideDirectory(directory: string, path: string): boolean {
  const remainder = relative(directory, path)
  return (
    remainder === TEAM_EXTENSIONS_PARENT_SEGMENT ||
    remainder.startsWith(`${TEAM_EXTENSIONS_PARENT_SEGMENT}${sep}`) ||
    isAbsolute(remainder)
  )
}

export function isTeamExtensionsMissingFile(error: Error): boolean {
  return "code" in error && error.code === TEAM_EXTENSIONS_MISSING_CODE
}
