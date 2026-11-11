import { LOCKFILE, SOURCE_PATTERN } from "./constants"

export function isSourceFile(path: string): boolean {
  return SOURCE_PATTERN.test(path) && !path.endsWith(LOCKFILE)
}
