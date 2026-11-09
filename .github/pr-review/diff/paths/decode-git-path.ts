import { TEXT_ENCODING } from "#synapse/separators"
import { GIT_ESCAPE_PREFIX, GIT_ESCAPE_VALUES, GIT_PATH_ESCAPES, OCTAL_RADIX, QUOTE } from "./constants"

export function decodeGitPath(path: string): string {
  const unquoted = path.startsWith(QUOTE) && path.endsWith(QUOTE) ? path.slice(1, -1) : path
  return unquoted.replace(GIT_PATH_ESCAPES, (sequence) => {
    const decodedEscape = GIT_ESCAPE_VALUES.get(sequence)
    if (decodedEscape !== undefined) {
      return decodedEscape
    }
    const bytes = sequence
      .split(GIT_ESCAPE_PREFIX)
      .slice(1)
      .map((octal) => Number.parseInt(octal, OCTAL_RADIX))
    return Buffer.from(bytes).toString(TEXT_ENCODING)
  })
}
