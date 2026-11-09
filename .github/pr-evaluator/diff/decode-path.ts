import { ESCAPE_PATTERN, ESCAPES, OCTAL_ESCAPE_LENGTH, OCTAL_RADIX, QUOTE, TAB } from "./constants"

function decodeEscape(sequence: string): string {
  if (sequence.length === OCTAL_ESCAPE_LENGTH) {
    return String.fromCharCode(Number.parseInt(sequence.slice(1), OCTAL_RADIX))
  }
  const decoded = ESCAPES.get(sequence)
  if (typeof decoded === "string") {
    return decoded
  }
  return sequence
}

export function decodePath(header: string): string {
  const tab = header.indexOf(TAB)
  const name = tab === -1 ? header : header.slice(0, tab)
  if (name.length > 1 && name.startsWith(QUOTE) && name.endsWith(QUOTE)) {
    return name.slice(1, -1).replace(ESCAPE_PATTERN, (sequence) => decodeEscape(sequence))
  }
  return name
}
