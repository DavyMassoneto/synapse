import { type IphoneTreeEntityValues } from "./types"

export const IPHONE_TREE_TYPES = new Set([
  "Button",
  "TextField",
  "SecureTextField",
  "TextView",
  "SearchField",
  "Switch",
  "Slider",
  "Link",
  "Cell",
  "Tab",
  "Toggle",
  "Picker",
  "PickerWheel",
  "SegmentedControl",
  "Stepper",
  "Key",
  "Keyboard",
  "MenuItem",
  "Alert",
  "Sheet",
  "Icon",
  "PageIndicator",
  "Checkbox",
  "RadioButton",
])
export const IPHONE_TREE_TAG = /<XCUIElementType(\w+)\s((?:"[^"]*"|'[^']*'|[^>"'])*?)\/?\s*>/g
export const IPHONE_TREE_ATTRIBUTE_PATTERN = /(?:^|\s)([A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g

export const IPHONE_TREE_ENTITY = /&(?:quot|apos|lt|gt|amp|#\d+|#x[\da-fA-F]+);/g

export const IPHONE_TREE_NUMERIC_ENTITY = /&#(?:x([\da-fA-F]+)|(\d+));/g

export const IPHONE_XML_HEX_RADIX = 16

export const IPHONE_XML_DECIMAL_RADIX = 10

export const IPHONE_XML_HEX_PREFIX_LENGTH = 3

export const IPHONE_XML_DECIMAL_PREFIX_LENGTH = 2

export const IPHONE_XML_ENTITY_QUOTE = "&quot;"

export const IPHONE_XML_ENTITY_APOSTROPHE = "&apos;"

export const IPHONE_XML_ENTITY_LESS = "&lt;"

export const IPHONE_XML_ENTITY_GREATER = "&gt;"

export const IPHONE_XML_ENTITY_AMPERSAND = "&amp;"

export const IPHONE_XML_ENTITY_NEWLINE = "&#10;"

export const IPHONE_XML_HEX_PREFIX = "&#x"

export const IPHONE_XML_ENTITY_SPACE = " "

export const IPHONE_XML_CODEPOINT_MAX = 0x10ffff

export const IPHONE_XML_NONCHAR_START = 0xfffe

export const IPHONE_XML_NONCHAR_END = 0xffff

export const IPHONE_XML_SURROGATE_START = 0xd800

export const IPHONE_XML_SURROGATE_END = 0xdfff

export const IPHONE_XML_CHARACTER_MIN = 0x20

export const IPHONE_XML_CHARACTER_TAB = 9

export const IPHONE_XML_CHARACTER_NEWLINE = 10

export const IPHONE_XML_CHARACTER_RETURN = 13
export const IPHONE_TREE_ENTITY_VALUES: IphoneTreeEntityValues = {
  "&quot;": '"',
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&#10;": " ",
}
export const IPHONE_XML_TOKEN = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<(?:"[^"]*"|'[^']*'|[^<>"'])*>|[^<>]+/g

export const IPHONE_XML_COMMENT = /^<!--[\s\S]*?-->$/

export const IPHONE_XML_CDATA = /^<!\[CDATA\[[\s\S]*?\]\]>$/
export const IPHONE_XML_OPEN = /^<([A-Za-z_][\w:.-]*)(?:\s+[A-Za-z_][\w:.-]*\s*=\s*(?:"[^"<]*"|'[^'<]*'))*\s*(\/?)>$/
export const IPHONE_XML_CLOSE = /^<\/([A-Za-z_][\w:.-]*)\s*>$/
export const IPHONE_XML_DECLARATION = /^<\?xml\s+[^<>]*\?>$/
export const IPHONE_XML_INVALID_ENTITY = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);)/

export const IPHONE_XML_ERROR = "XML da tela vazio ou malformado."
export const IPHONE_TREE_UNKNOWN_APP = "(springboard/desconhecido)"
export const IPHONE_XML_RECT_REQUIRED = "O retângulo do elemento está incompleto."

export const IPHONE_XML_NAME = "name"

export const IPHONE_XML_LABEL = "label"

export const IPHONE_XML_VALUE = "value"

export const IPHONE_XML_X = "x"

export const IPHONE_XML_Y = "y"

export const IPHONE_XML_WIDTH = "width"

export const IPHONE_XML_HEIGHT = "height"

export const IPHONE_XML_ENABLED = "enabled"

export const IPHONE_XML_VISIBLE = "visible"

export const IPHONE_XML_FALSE = "false"

export const IPHONE_XML_APPLICATION = "Application"

export const IPHONE_XML_SELF_CLOSE = "/"

export const IPHONE_XML_TAG_START = "<"

export const IPHONE_TREE_UNLABELED_ATTRIBUTE = ""

export const IPHONE_TREE_DISABLED_TEXT = " [desabilitado]"

export const IPHONE_TREE_VALUE_TEXT = " value="

export const IPHONE_TREE_ID_TEXT = " id="

export const IPHONE_TREE_TRUNCATED_TEXT = " (truncada)"

export const IPHONE_TREE_APP_PREFIX = "app: "

export const IPHONE_TREE_ELEMENTS_TEXT = " elementos"

export const IPHONE_TREE_APP_KNOWN = "known"

export const IPHONE_TREE_APP_MISSING = "missing"

export const IPHONE_TREE_FOUND = "found"
export const IPHONE_TREE_MISSING = "missing"
