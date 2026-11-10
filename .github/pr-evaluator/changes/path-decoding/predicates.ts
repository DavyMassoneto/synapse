import { OCTAL_ESCAPE_PATTERN, QUOTED_PATTERN } from "./constants"

export function isQuoted(name: string): boolean {
  return QUOTED_PATTERN.test(name)
}

export function isOctalEscape(sequence: string): boolean {
  return OCTAL_ESCAPE_PATTERN.test(sequence)
}
