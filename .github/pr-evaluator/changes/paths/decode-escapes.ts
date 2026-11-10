import { ESCAPE_PATTERN } from "./constants"
import { decodeEscape } from "./decode-escape"

export function decodeEscapes(text: string): string {
  return text.replace(ESCAPE_PATTERN, decodeEscape)
}
