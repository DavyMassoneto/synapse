import { findOldPath, isDeleted } from "./paths"
import { splitSections } from "./sections"

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
