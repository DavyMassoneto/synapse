import { decodeEscapes } from "./decode-escapes"
import { isQuoted } from "./predicates"
import { unquote } from "./unquote"
import { withoutTabSuffix } from "./without-tab-suffix"

export function decodePath(header: string): string {
  const name = withoutTabSuffix(header)
  if (isQuoted(name)) {
    return decodeEscapes(unquote(name))
  }
  return name
}
