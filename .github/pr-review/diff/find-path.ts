import { LINE_BREAK } from "../separators"
import {
  DELETED_FILE_MARKER,
  HUNK_MARKER,
  NEW_FILE_PREFIX,
  QUOTED_NEW_FILE_PREFIX,
  RENAME_TARGET_PREFIX,
} from "./constants"
import { readPrefixedPath } from "./read-prefixed-path"
import { type OptionalPath } from "./types"

export function findPath(section: string): OptionalPath {
  for (const diffLine of section.split(LINE_BREAK)) {
    if (diffLine === DELETED_FILE_MARKER || diffLine.startsWith(HUNK_MARKER)) {
      return undefined
    }
    if (diffLine.startsWith(RENAME_TARGET_PREFIX)) {
      return diffLine.slice(RENAME_TARGET_PREFIX.length)
    }
    const path = readPrefixedPath(diffLine, NEW_FILE_PREFIX, QUOTED_NEW_FILE_PREFIX)
    if (path !== undefined) {
      return path
    }
  }
  return undefined
}
