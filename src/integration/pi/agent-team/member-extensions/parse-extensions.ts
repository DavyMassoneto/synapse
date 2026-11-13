import { isAbsolute, resolve } from "node:path"
import { Value } from "typebox/value"
import { TEAM_EXTENSIONS_DIRECTORY, TEAM_EXTENSIONS_OUTSIDE_DIRECTORY } from "./constants"
import { isTeamExtensionOutsideDirectory } from "./predicates"
import { TEAM_MEMBER_EXTENSIONS_SCHEMA } from "./schemas"

export function parseTeamMemberExtensions(agentDirectory: string, content: string): string[] {
  const config = Value.Parse(TEAM_MEMBER_EXTENSIONS_SCHEMA, JSON.parse(content))
  const directory = resolve(agentDirectory, TEAM_EXTENSIONS_DIRECTORY)
  return config.memberExtensions.map((name) => resolveTeamMemberExtension(directory, name))
}

function resolveTeamMemberExtension(directory: string, name: string): string {
  if (isAbsolute(name)) {
    return name
  }
  const path = resolve(directory, name)
  if (directory === path || isTeamExtensionOutsideDirectory(directory, path)) {
    throw new Error(TEAM_EXTENSIONS_OUTSIDE_DIRECTORY)
  }
  return path
}
