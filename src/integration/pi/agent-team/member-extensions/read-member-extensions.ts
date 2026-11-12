import { readFileSync } from "node:fs"
import { join } from "node:path"
import { TEAM_EXTENSIONS_CONFIG_FILE, TEAM_EXTENSIONS_INVALID_CONFIG } from "./constants"
import { parseTeamMemberExtensions } from "./parse-extensions"
import { isTeamExtensionsMissingFile } from "./predicates"

export function readMemberExtensions(agentDirectory: string): string[] {
  const path = join(agentDirectory, TEAM_EXTENSIONS_CONFIG_FILE)
  try {
    return parseTeamMemberExtensions(agentDirectory, new TextDecoder().decode(readFileSync(path)))
  } catch (error) {
    if (error instanceof Error && isTeamExtensionsMissingFile(error)) {
      return []
    }
    throw new Error(`${TEAM_EXTENSIONS_INVALID_CONFIG}${path}`, { cause: error })
  }
}
