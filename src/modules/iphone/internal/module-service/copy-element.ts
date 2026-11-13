import { type IphoneElement } from "#synapse/modules/iphone/public/contracts"

export function copyIphoneElement(element: IphoneElement): IphoneElement {
  return { ...element, rect: { ...element.rect } }
}
