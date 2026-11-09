export const OLD_PREFIX = "a/"

export const NEW_PREFIX = "b/"

export const NO_FILE = "/dev/null"

export const TAB = "\t"

export const QUOTE = '"'

export const ESCAPE_PATTERN = /\\(?:[0-7]{3}|[\\"abfnrtv])/g

export const OCTAL_ESCAPE_LENGTH = 4

export const OCTAL_RADIX = 8

export const ESCAPES = new Map<string, string>([
  ["\\\\", "\\"],
  ['\\"', '"'],
  ["\\a", "\x07"],
  ["\\b", "\b"],
  ["\\f", "\f"],
  ["\\n", "\n"],
  ["\\r", "\r"],
  ["\\t", "\t"],
  ["\\v", "\v"],
])
