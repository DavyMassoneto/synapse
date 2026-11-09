import { LINE_BREAK, NO_TEXT } from "#synapse/separators"
import {
  BINARY_NEW_PATH,
  BINARY_OLD_PATH,
  DELETED_FILE_MARKER,
  DIFF_SIDE_PREFIX_LENGTH,
  HUNK_MARKER,
  NEW_FILE_PREFIX,
  OLD_FILE_PREFIX,
  QUOTE,
  QUOTED_NEW_FILE_PREFIX,
  QUOTED_OLD_FILE_PREFIX,
  QUOTED_RENAME_TARGET_PREFIX,
  RENAME_TARGET_PREFIX,
  TIMESTAMP_SUFFIX,
} from "./constants"
import { decodeGitPath } from "./decode-git-path"
import { isDeleted } from "./predicates"
import { type OptionalPath } from "./types"

export function findPath(section: string): OptionalPath {
  if (isDeleted(section)) {
    return undefined
  }
  for (const diffLine of section.split(LINE_BREAK)) {
    const binaryPath = BINARY_NEW_PATH.exec(diffLine)?.at(1)
    if (binaryPath !== undefined) {
      return decodeGitPath(binaryPath).slice(DIFF_SIDE_PREFIX_LENGTH)
    }
    if (diffLine === DELETED_FILE_MARKER || diffLine.startsWith(HUNK_MARKER)) {
      return undefined
    }
    if (diffLine.startsWith(RENAME_TARGET_PREFIX)) {
      return readPrefixedPath(diffLine, RENAME_TARGET_PREFIX, QUOTED_RENAME_TARGET_PREFIX)
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
    const binaryPath = BINARY_OLD_PATH.exec(diffLine)?.at(1)
    if (binaryPath !== undefined) {
      return decodeGitPath(binaryPath).slice(DIFF_SIDE_PREFIX_LENGTH)
    }
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
    return decodeGitPath(path.endsWith(QUOTE) ? path.slice(0, -QUOTE.length) : path)
  }
  if (diffLine.startsWith(prefix)) {
    return stripTimestamp(diffLine.slice(prefix.length))
  }
  return undefined
}

export function stripTimestamp(path: string): string {
  return path.replace(TIMESTAMP_SUFFIX, NO_TEXT)
}
