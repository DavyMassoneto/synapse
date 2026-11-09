export const OLD_FILE_PREFIX = "--- a/"
export const QUOTED_OLD_FILE_PREFIX = '--- "a/'
export const NEW_FILE_PREFIX = "+++ b/"
export const QUOTED_NEW_FILE_PREFIX = '+++ "b/'
export const DELETED_FILE_MARKER = "+++ /dev/null"
export const RENAME_TARGET_PREFIX = "rename to "
export const HUNK_MARKER = "@@"
export const TIMESTAMP_SUFFIX = /\t.*$/
export const QUOTED_RENAME_TARGET_PREFIX = 'rename to "'
export const GIT_PATH_ESCAPES = /\\\\|\\"|\\a|\\b|\\f|\\v|\\t|\\n|\\r|(?:\\[0-7]{3})+/g
export const GIT_ESCAPE_VALUES: ReadonlyMap<string, string> = new Map([
  ["\\\\", "\\"],
  ['\\"', '"'],
  ["\\a", "\u0007"],
  ["\\b", "\b"],
  ["\\f", "\f"],
  ["\\v", "\v"],
  ["\\t", "\t"],
  ["\\n", "\n"],
  ["\\r", "\r"],
])
export const GIT_ESCAPE_PREFIX = "\\"
export const DIFF_SIDE_PREFIX_LENGTH = "a/".length
export const OCTAL_RADIX = 8
export const BINARY_NEW_PATH = /^Binary files .+ and ("?b\/.+?) differ$/
export const BINARY_OLD_PATH = /^Binary files ("?a\/.+?) and .+ differ$/
export const BINARY_DELETION = /^Binary files .+ and \/dev\/null differ$/m
export const QUOTE = '"'
