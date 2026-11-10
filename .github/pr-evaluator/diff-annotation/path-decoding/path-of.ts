import { ESCAPE_PATTERN, ESCAPED_CHARACTERS, OCTAL_RADIX, QUOTED_PATTERN, TAB_SUFFIX_PATTERN } from "./constants"

function decodeEscape(sequence: string): string {
  if (sequence === "\\\\") {
    return ESCAPED_CHARACTERS.backslash
  }
  if (sequence === '\\"') {
    return ESCAPED_CHARACTERS.quote
  }
  if (sequence === "\\a") {
    return ESCAPED_CHARACTERS.bell
  }
  if (sequence === "\\b") {
    return ESCAPED_CHARACTERS.backspace
  }
  if (sequence === "\\f") {
    return ESCAPED_CHARACTERS.formFeed
  }
  if (sequence === "\\n") {
    return ESCAPED_CHARACTERS.lineFeed
  }
  if (sequence === "\\r") {
    return ESCAPED_CHARACTERS.carriageReturn
  }
  if (sequence === "\\t") {
    return ESCAPED_CHARACTERS.tab
  }
  if (sequence === "\\v") {
    return ESCAPED_CHARACTERS.verticalTab
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
