import { type EscapedCharacters } from "./types"

export const TAB_SUFFIX_PATTERN = /\t.*$/s

export const QUOTED_PATTERN = /^"(.*)"$/s

export const ESCAPE_PATTERN = /\\(?:[0-7]{3}|[\\"abfnrtv])/g

export const OCTAL_RADIX = 8

export const ESCAPED_CHARACTERS: EscapedCharacters = {
  backslash: "\\",
  quote: '"',
  bell: "\x07",
  backspace: "\b",
  formFeed: "\f",
  lineFeed: "\n",
  carriageReturn: "\r",
  tab: "\t",
  verticalTab: "\v",
}
