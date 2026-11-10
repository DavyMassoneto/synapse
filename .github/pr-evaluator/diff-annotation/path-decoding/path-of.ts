import { ESCAPE_PATTERN, GIT_ESCAPE_CHARACTERS, OCTAL_RADIX, QUOTED_PATTERN, TAB_SUFFIX_PATTERN } from "./constants"
import { isNamedEscape } from "./predicates"

function decodeEscape(sequence: string): string {
  if (isNamedEscape(sequence)) {
    return GIT_ESCAPE_CHARACTERS[sequence]
  }
  return String.fromCharCode(Number.parseInt(sequence.slice(1), OCTAL_RADIX))
}

function decodePath(header: string): string {
  const name = header.replace(TAB_SUFFIX_PATTERN, "")
  const quoted = QUOTED_PATTERN.exec(name)
  if (quoted?.[1]) {
    return quoted[1].replace(ESCAPE_PATTERN, decodeEscape)
  }
  return name
}

export function pathOf(header: string, prefix: string): string {
  const name = decodePath(header)
  if (name.startsWith(prefix)) {
    return name.slice(prefix.length)
  }
  return name
}
