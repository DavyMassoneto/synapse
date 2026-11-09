import { ESCAPE_PATTERN, QUOTE, TAB } from "./constants"
import { decodeEscape } from "./decode-escape"

export function decodePath(header: string): string {
  const tab = header.indexOf(TAB)
  const name = tab === -1 ? header : header.slice(0, tab)
  if (name.length > 1 && name.startsWith(QUOTE) && name.endsWith(QUOTE)) {
    return name.slice(1, -1).replace(ESCAPE_PATTERN, (sequence) => decodeEscape(sequence))
  }
  return name
}
