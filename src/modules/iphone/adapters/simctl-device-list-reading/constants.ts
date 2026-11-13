import { type IphoneJsonEscapes } from "./types"

export const SIMCTL_VALID = "output-valid"
export const SIMCTL_INVALID = "output-invalid"
export const JSON_SYNTAX_ERROR = "A lista simctl contém JSON inválido."
export const JSON_OBJECT = "object"
export const JSON_ARRAY = "array"
export const JSON_OBJECT_START = "{"
export const JSON_OBJECT_END = "}"
export const JSON_ARRAY_START = "["
export const JSON_ARRAY_END = "]"
export const JSON_QUOTE = '"'
export const JSON_ESCAPE = "\\"
export const JSON_COLON = ":"
export const JSON_COMMA = ","
export const JSON_WHITESPACE = [" ", "\t", "\n", "\r"]
export const JSON_LITERALS = ["true", "false", "null"]
export const JSON_DIGITS = "0123456789"
export const JSON_NONZERO_DIGITS = "123456789"
export const JSON_HEX_DIGITS = "0123456789abcdefABCDEF"
export const JSON_MINUS = "-"
export const JSON_DECIMAL = "."
export const JSON_EXPONENTS = "eE"
export const JSON_SIGNS = "+-"
export const JSON_ZERO = "0"
export const JSON_SLASH = "/"
export const JSON_BACKSPACE_ESCAPE = "b"
export const JSON_FORMFEED_ESCAPE = "f"
export const JSON_NEWLINE_ESCAPE = "n"
export const JSON_RETURN_ESCAPE = "r"
export const JSON_TAB_ESCAPE = "t"
export const JSON_UNICODE_ESCAPE = "u"
export const JSON_HEX_LENGTH = 4
export const JSON_HEX_BASE = 16
export const JSON_CONTROL_LIMIT = 32
export const JSON_ARRAY_INDEX_MAXIMUM = 4294967294
export const SIMCTL_DEVICES = "devices"
export const SIMCTL_UDID = "udid"
export const SIMCTL_NAME = "name"
export const SIMCTL_STATE = "state"
export const JSON_ESCAPES: IphoneJsonEscapes = {
  '"': '"',
  "\\": "\\",
  "/": "/",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t",
}
