import { readMemberExtensions } from "../member-extensions"
import { canonicalTeamExtensionPath } from "./canonical-path"
import { type TeamExcludedExtensionPaths } from "./types"

export function readCanonicalMemberExclusions(agentDirectory: string): TeamExcludedExtensionPaths {
  const excluded: TeamExcludedExtensionPaths = new Set<string>()
  for (const path of readMemberExtensions(agentDirectory)) {
    excluded.add(canonicalTeamExtensionPath(path))
  }
  return excluded
}
