import { findOldPath } from "./find-old-path"
import { isDeleted } from "./predicates"
import { splitSections } from "./split-sections"

export function listDeletedPaths(diff: string): string[] {
  const paths: string[] = []
  for (const section of splitSections(diff)) {
    const path = findOldPath(section)
    if (isDeleted(section) && path !== undefined) {
      paths.push(path)
    }
  }
  return paths
}
