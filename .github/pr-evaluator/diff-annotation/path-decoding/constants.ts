import { type GitEscapeCharacters } from "./types"

export const TAB_SUFFIX_PATTERN = /\t.*$/s

export const QUOTED_PATTERN = /^"(.*)"$/s

export const ESCAPE_PATTERN = /\\(?:[0-7]{3}|[\\"abfnrtv])/g

export const OCTAL_RADIX = 8

export const GIT_ESCAPE_CHARACTERS: GitEscapeCharacters = {
  "\\\\": "\\",
  '\\"': '"',
  "\\a": "\x07",
  "\\b": "\b",
  "\\f": "\f",
  "\\n": "\n",
  "\\r": "\r",
  "\\t": "\t",
  "\\v": "\v",
}
