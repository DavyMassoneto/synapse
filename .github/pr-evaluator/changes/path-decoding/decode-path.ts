import { TAB_SUFFIX_PATTERN } from "./constants"
import { decodeQuoted } from "./decode-quoted"
import { isQuoted } from "./predicates"

export function decodePath(header: string): string {
  const name = header.replace(TAB_SUFFIX_PATTERN, "")
  if (isQuoted(name)) {
    return decodeQuoted(name)
  }
  return name
}
