import { resolve } from "node:path"
import { Value } from "typebox/value"
import { TEAM_MEMBER_EXTENSIONS_SCHEMA } from "./schemas"

export function parseTeamMemberExtensions(agentDirectory: string, content: string): string[] {
  const config = Value.Parse(TEAM_MEMBER_EXTENSIONS_SCHEMA, JSON.parse(content))
  const paths = new Set<string>()
  for (const path of config.excludedMemberExtensions) {
    paths.add(resolve(agentDirectory, path))
  }
  return Array.from(paths)
}
