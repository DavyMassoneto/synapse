import { QUOTE } from "./constants"
import { stripTimestamp } from "./strip-timestamp"
import { type OptionalPath } from "./types"

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
