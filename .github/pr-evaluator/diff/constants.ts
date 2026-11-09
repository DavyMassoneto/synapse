export const LINE_BREAK = "\n"

export const DIFF_FILE_HEADER = "diff --git "

export const OLD_FILE_HEADER = "--- "

export const NEW_FILE_HEADER = "+++ "

export const NO_FILE = "/dev/null"

export const OLD_PREFIX = "a/"

export const NEW_PREFIX = "b/"

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

export const ADDED = "+"

export const REMOVED = "-"

export const CONTEXT = " "

export const NO_NEWLINE = "\\"

export const HUNK_MARKERS: string[] = [ADDED, REMOVED, CONTEXT, NO_NEWLINE]

export const OLD_START_PATTERN = /^@@ -(\d+)(?:,\d+)? \+\d+(?:,\d+)? @@.*$/

export const NEW_START_PATTERN = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@.*$/

export const GIT_DIFF_ARGUMENTS: string[] = [
  "-c",
  "core.quotepath=false",
  "diff",
  "--no-color",
  "--no-ext-diff",
  "--no-textconv",
  "-M",
]

export const DIFF_BUFFER_BYTES = 268_435_456
