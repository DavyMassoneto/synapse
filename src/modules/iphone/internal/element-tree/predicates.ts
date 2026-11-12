import { type IphoneElement } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_XML_HEIGHT, IPHONE_XML_WIDTH, IPHONE_XML_X, IPHONE_XML_Y } from "./constants"
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
