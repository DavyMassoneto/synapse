import { MAX_TREE_LINES } from "./constants"

export function countOmitted(paths: string[]): number {
  return Math.max(0, paths.length - MAX_TREE_LINES)
}
