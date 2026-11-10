import { OCTAL_RADIX } from "./constants"

export function decodeOctal(sequence: string): string {
  return String.fromCharCode(Number.parseInt(sequence.slice(1), OCTAL_RADIX))
}
