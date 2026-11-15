import { canonicalTeamExtensionPath } from "./canonical-path"
import { type TeamExcludedExtensionPaths, type TeamMemberResources } from "./types"

export function selectMemberExtensionPaths(
  resources: TeamMemberResources,
  excluded: TeamExcludedExtensionPaths,
): string[] {
  const paths: string[] = []
  const selected = new Set<string>()
  for (const resource of resources.extensions) {
    if (resource.enabled) {
      const path = canonicalTeamExtensionPath(resource.path)
      if (!excluded.has(path) && !selected.has(path)) {
        paths.push(resource.path)
        selected.add(path)
      }
    }
  }
  return paths
}
