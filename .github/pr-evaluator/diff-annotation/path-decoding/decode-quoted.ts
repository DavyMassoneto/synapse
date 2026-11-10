import { ESCAPE_PATTERN, QUOTED_PATTERN } from "./constants"
import { decodeEscape } from "./decode-escape"

export function decodeQuoted(name: string): string {
  return name.replace(QUOTED_PATTERN, "$1").replace(ESCAPE_PATTERN, decodeEscape)
}
