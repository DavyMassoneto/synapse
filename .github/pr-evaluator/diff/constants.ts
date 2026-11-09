export const LINE_BREAK = "\n"

export const DIFF_FILE_HEADER = "diff --git "

export const OLD_FILE_HEADER = "--- "

export const NEW_FILE_HEADER = "+++ "

export const NO_FILE = "/dev/null"

export const OLD_PREFIX = "a/"

export const NEW_PREFIX = "b/"

export const TAB = "\t"

export const QUOTE = '"'

export const ESCAPE_PATTERN = /\\[\\"tn]/g

export const ESCAPES = new Map<string, string>([
  ["\\\\", "\\"],
  ['\\"', '"'],
  ["\\t", "\t"],
  ["\\n", "\n"],
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
