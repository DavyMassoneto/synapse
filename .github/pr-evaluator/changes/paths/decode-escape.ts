import { ESCAPES, OCTAL_ESCAPE_LENGTH, OCTAL_RADIX } from "./constants"

export function decodeEscape(sequence: string): string {
  if (sequence.length === OCTAL_ESCAPE_LENGTH) {
    return String.fromCharCode(Number.parseInt(sequence.slice(1), OCTAL_RADIX))
  }
  const decoded = ESCAPES.get(sequence)
  if (typeof decoded === "string") {
    return decoded
  }
  return sequence
}
