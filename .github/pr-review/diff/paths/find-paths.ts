import { LINE_BREAK } from "#synapse/separators"
import {
  DELETED_FILE_MARKER,
  HUNK_MARKER,
  NEW_FILE_PREFIX,
  OLD_FILE_PREFIX,
  QUOTE,
  QUOTED_NEW_FILE_PREFIX,
  QUOTED_OLD_FILE_PREFIX,
  RENAME_TARGET_PREFIX,
  TIMESTAMP_SEPARATOR,
} from "./constants"
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

export function findOldPath(section: string): OptionalPath {
  for (const diffLine of section.split(LINE_BREAK)) {
    const path = readPrefixedPath(diffLine, OLD_FILE_PREFIX, QUOTED_OLD_FILE_PREFIX)
    if (path !== undefined) {
      return path
    }
  }
  return undefined
}

export function readPrefixedPath(diffLine: string, prefix: string, quotedPrefix: string): OptionalPath {
  if (diffLine.startsWith(quotedPrefix)) {
    const path = stripTimestamp(diffLine.slice(quotedPrefix.length))
    return path.endsWith(QUOTE) ? path.slice(0, -QUOTE.length) : path
  }
  if (diffLine.startsWith(prefix)) {
    return stripTimestamp(diffLine.slice(prefix.length))
  }
  return undefined
}

export function stripTimestamp(path: string): string {
  return path.split(TIMESTAMP_SEPARATOR).slice(0, 1).join(TIMESTAMP_SEPARATOR)
}
