import { GIT_ESCAPE_CHARACTERS } from "./constants"
import { type GitEscape } from "./types"

export function isNamedEscape(sequence: string): sequence is GitEscape {
  return Object.hasOwn(GIT_ESCAPE_CHARACTERS, sequence)
}
