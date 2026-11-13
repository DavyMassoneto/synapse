import { IPHONE_ACCEPTED, IPHONE_REFUSED, type IphoneElement } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_TREE_APP_KNOWN,
  IPHONE_TREE_APP_MISSING,
  IPHONE_TREE_ATTRIBUTE_PATTERN,
  IPHONE_TREE_ENTITY,
  IPHONE_TREE_ENTITY_VALUES,
  IPHONE_TREE_TAG,
  IPHONE_TREE_TYPES,
  IPHONE_TREE_UNLABELED_ATTRIBUTE,
  IPHONE_XML_APPLICATION,
  IPHONE_XML_CHARACTER_NEWLINE,
  IPHONE_XML_DECIMAL_PREFIX_LENGTH,
  IPHONE_XML_DECIMAL_RADIX,
  IPHONE_XML_ENABLED,
  IPHONE_XML_ENTITY_AMPERSAND,
  IPHONE_XML_ENTITY_APOSTROPHE,
  IPHONE_XML_ENTITY_GREATER,
  IPHONE_XML_ENTITY_LESS,
  IPHONE_XML_ENTITY_NEWLINE,
  IPHONE_XML_ENTITY_QUOTE,
  IPHONE_XML_ENTITY_SPACE,
  IPHONE_XML_FALSE,
  IPHONE_XML_HEIGHT,
  IPHONE_XML_HEX_PREFIX,
  IPHONE_XML_HEX_PREFIX_LENGTH,
  IPHONE_XML_HEX_RADIX,
  IPHONE_XML_LABEL,
  IPHONE_XML_NAME,
  IPHONE_XML_RECT_REQUIRED,
  IPHONE_XML_VALUE,
  IPHONE_XML_VISIBLE,
  IPHONE_XML_WIDTH,
  IPHONE_XML_X,
  IPHONE_XML_Y,
} from "./constants"
import { hasIphoneRectangle, isIphoneElementVisible } from "./predicates"
import { type IphoneElementTree, type IphoneTreeResult, type IphoneXmlAttributes } from "./types"
import { validateIphoneXml } from "./xml-validation"

function decodeIphoneEntity(entity: string): string {
  switch (entity) {
    case IPHONE_XML_ENTITY_QUOTE:
    case IPHONE_XML_ENTITY_APOSTROPHE:
    case IPHONE_XML_ENTITY_LESS:
    case IPHONE_XML_ENTITY_GREATER:
    case IPHONE_XML_ENTITY_AMPERSAND:
    case IPHONE_XML_ENTITY_NEWLINE:
      return IPHONE_TREE_ENTITY_VALUES[entity]
    default: {
      const hexadecimal = entity.startsWith(IPHONE_XML_HEX_PREFIX)
      const digits = entity.slice(hexadecimal ? IPHONE_XML_HEX_PREFIX_LENGTH : IPHONE_XML_DECIMAL_PREFIX_LENGTH, -1)
      const point = Number.parseInt(digits, hexadecimal ? IPHONE_XML_HEX_RADIX : IPHONE_XML_DECIMAL_RADIX)
      if (point === IPHONE_XML_CHARACTER_NEWLINE) {
        return IPHONE_XML_ENTITY_SPACE
      }
      return String.fromCodePoint(point)
    }
  }
}

function readAttributes(source: string): IphoneXmlAttributes {
  const attributes: IphoneXmlAttributes = new Map<string, string>()
  for (const match of source.matchAll(IPHONE_TREE_ATTRIBUTE_PATTERN)) {
    if (match[1]) {
      const value = typeof match[2] === "string" ? match[2] : match[3]
      if (typeof value === "string") {
        attributes.set(match[1], value.replace(IPHONE_TREE_ENTITY, decodeIphoneEntity))
      }
    }
  }
  return attributes
}

function readIphoneElement(type: string, attributes: IphoneXmlAttributes, index: number): IphoneElement {
  const x = attributes.get(IPHONE_XML_X)
  const y = attributes.get(IPHONE_XML_Y)
  const width = attributes.get(IPHONE_XML_WIDTH)
  const height = attributes.get(IPHONE_XML_HEIGHT)
  if (!x || !y || !width || !height) {
    throw new Error(IPHONE_XML_RECT_REQUIRED)
  }
  const name = attributes.get(IPHONE_XML_NAME)
  const label = attributes.get(IPHONE_XML_LABEL)
  const value = attributes.get(IPHONE_XML_VALUE)
  return {
    index,
    type,
    name: name ? name : IPHONE_TREE_UNLABELED_ATTRIBUTE,
    label: label ? label : IPHONE_TREE_UNLABELED_ATTRIBUTE,
    value: value ? value : IPHONE_TREE_UNLABELED_ATTRIBUTE,
    rect: {
      x: Number(x),
      y: Number(y),
      width: Number(width),
      height: Number(height),
    },
    enabled: attributes.get(IPHONE_XML_ENABLED) !== IPHONE_XML_FALSE,
    interactive: IPHONE_TREE_TYPES.has(type),
  }
}

function applicationName(element: IphoneElement, current: string): string {
  if (element.type === IPHONE_XML_APPLICATION) {
    if (element.name) {
      return element.name
    }
    if (element.label) {
      return element.label
    }
  }
  return current
}

function readIphoneTreeApp(app: string, elements: IphoneElement[], truncated: boolean): IphoneElementTree {
  if (app) {
    return { app: { kind: IPHONE_TREE_APP_KNOWN, name: app }, elements, truncated }
  }
  return { app: { kind: IPHONE_TREE_APP_MISSING }, elements, truncated }
}

function readIphoneElementTree(xml: string, max: number): IphoneElementTree {
  const elements: IphoneElement[] = []
  let app = ""
  let truncated = false
  for (const match of xml.matchAll(IPHONE_TREE_TAG)) {
    const type = match[1]
    const source = match[2]
    if (!type || !source) {
      continue
    }
    const attributes = readAttributes(source)
    if (!hasIphoneRectangle(attributes)) {
      continue
    }
    const element = readIphoneElement(type, attributes, elements.length + 1)
    app = applicationName(element, app)
    if (attributes.get(IPHONE_XML_VISIBLE) === IPHONE_XML_FALSE || !isIphoneElementVisible(element)) {
      continue
    }
    if (elements.length >= max) {
      truncated = true
      break
    }
    elements.push(element)
  }
  return readIphoneTreeApp(app, elements, truncated)
}

export function parseIphoneElementTree(xml: string, max: number): IphoneTreeResult {
  const validation = validateIphoneXml(xml)
  if (validation.kind === IPHONE_REFUSED) {
    return validation
  }
  return { kind: IPHONE_ACCEPTED, tree: readIphoneElementTree(xml, max) }
}
