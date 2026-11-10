import { ESCAPES, OCTAL_RADIX } from "./constants"
import { isOctalEscape } from "./predicates"

export function decodeEscape(sequence: string): string {
  if (isOctalEscape(sequence)) {
    return String.fromCharCode(Number.parseInt(sequence.slice(1), OCTAL_RADIX))
  }
  const decoded = ESCAPES.get(sequence)
  if (typeof decoded === "string") {
    return decoded
  }
  return sequence
}
