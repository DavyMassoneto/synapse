import { LINE_BREAK } from "../separators"
import { SOURCE_LIMIT_CHARS, TRUNCATED_NOTE } from "./constants"
import { type TruncatedText } from "./types"

export function truncate(text: string): TruncatedText {
  if (text.length <= SOURCE_LIMIT_CHARS) {
    return { text, truncated: false }
  }
  return { text: text.slice(0, SOURCE_LIMIT_CHARS) + LINE_BREAK + TRUNCATED_NOTE, truncated: true }
}
