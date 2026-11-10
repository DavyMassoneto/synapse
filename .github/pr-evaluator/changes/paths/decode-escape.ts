import { decodeOctal } from "./decode-octal"
import { lookupEscape } from "./lookup-escape"
import { isOctalEscape } from "./predicates"

export function decodeEscape(sequence: string): string {
  if (isOctalEscape(sequence)) {
    return decodeOctal(sequence)
  }
  return lookupEscape(sequence)
}
