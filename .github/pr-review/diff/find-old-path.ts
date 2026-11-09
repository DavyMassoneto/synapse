import { LINE_BREAK } from "../separators"
import { OLD_FILE_PREFIX, QUOTED_OLD_FILE_PREFIX } from "./constants"
import { readPrefixedPath } from "./read-prefixed-path"
import { type OptionalPath } from "./types"

export function findOldPath(section: string): OptionalPath {
  for (const diffLine of section.split(LINE_BREAK)) {
    const path = readPrefixedPath(diffLine, OLD_FILE_PREFIX, QUOTED_OLD_FILE_PREFIX)
    if (path !== undefined) {
      return path
    }
  }
  return undefined
}
