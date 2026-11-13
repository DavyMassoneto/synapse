import { type IphoneElement } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_TREE_ATTRIBUTE_PATTERN,
  IPHONE_TREE_NUMERIC_ENTITY,
  IPHONE_XML_CHARACTER_MIN,
  IPHONE_XML_CHARACTER_NEWLINE,
  IPHONE_XML_CHARACTER_RETURN,
  IPHONE_XML_CHARACTER_TAB,
  IPHONE_XML_CODEPOINT_MAX,
  IPHONE_XML_DECIMAL_RADIX,
  IPHONE_XML_HEIGHT,
  IPHONE_XML_HEX_RADIX,
  IPHONE_XML_NONCHAR_END,
  IPHONE_XML_NONCHAR_START,
  IPHONE_XML_SURROGATE_END,
  IPHONE_XML_SURROGATE_START,
  IPHONE_XML_WIDTH,
  IPHONE_XML_X,
  IPHONE_XML_Y,
} from "./constants"
import { type IphoneXmlAttributes } from "./types"

export function hasIphoneRectangle(attributes: IphoneXmlAttributes): boolean {
  return Boolean(
    attributes.get(IPHONE_XML_X) &&
      attributes.get(IPHONE_XML_Y) &&
      attributes.get(IPHONE_XML_WIDTH) &&
      attributes.get(IPHONE_XML_HEIGHT),
  )
}

export function isIphoneElementVisible(element: IphoneElement): boolean {
  return (
    (element.interactive || Boolean(element.name || element.label || element.value)) &&
    Number.isFinite(element.rect.x) &&
    Number.isFinite(element.rect.y) &&
    element.rect.width > 0 &&
    element.rect.height > 0
  )
}

export function hasIphoneDuplicateXmlAttributes(token: string): boolean {
  const names = new Set<string>()
  for (const match of token.matchAll(IPHONE_TREE_ATTRIBUTE_PATTERN)) {
    const name = match[1]
    if (name && names.has(name)) {
      return true
    }
    if (name) {
      names.add(name)
    }
  }
  return false
}

export function isIphoneXmlNumericEntitiesValid(xml: string): boolean {
  for (const match of xml.matchAll(IPHONE_TREE_NUMERIC_ENTITY)) {
    const digits = match[1] ? match[1] : match[2]
    if (!digits) {
      return false
    }
    const point = Number.parseInt(digits, match[1] ? IPHONE_XML_HEX_RADIX : IPHONE_XML_DECIMAL_RADIX)
    if (
      !Number.isSafeInteger(point) ||
      point > IPHONE_XML_CODEPOINT_MAX ||
      (point >= IPHONE_XML_SURROGATE_START && point <= IPHONE_XML_SURROGATE_END) ||
      (point >= IPHONE_XML_NONCHAR_START && point <= IPHONE_XML_NONCHAR_END)
    ) {
      return false
    }
    if (
      point < IPHONE_XML_CHARACTER_MIN &&
      point !== IPHONE_XML_CHARACTER_TAB &&
      point !== IPHONE_XML_CHARACTER_NEWLINE &&
      point !== IPHONE_XML_CHARACTER_RETURN
    ) {
      return false
    }
  }
  return true
}
