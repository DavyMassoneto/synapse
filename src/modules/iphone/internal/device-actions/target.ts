import {
  findIphoneElement,
  IPHONE_TREE_FOUND,
  iphoneElementCenter,
} from "#synapse/modules/iphone/internal/element-tree"
import {
  IPHONE_TARGET_ELEMENT,
  IPHONE_TARGET_POINT,
  IPHONE_TARGET_TEXT,
  type IphoneActionTarget,
  type IphoneElement,
  type IphonePoint,
} from "#synapse/modules/iphone/public/contracts"
import { IPHONE_ACTION_TARGET_MISSING } from "./constants"
import { type IphoneMaybeElement } from "./types"

export function resolveIphoneTarget(target: IphoneActionTarget, elements: IphoneElement[]): IphonePoint {
  if (target.kind === IPHONE_TARGET_POINT) {
    return target.point
  }
  let element: IphoneMaybeElement = null
  if (target.kind === IPHONE_TARGET_ELEMENT) {
    const found = elements.find((item) => item.index === target.index)
    if (found) {
      element = found
    }
  }
  if (target.kind === IPHONE_TARGET_TEXT) {
    const found = findIphoneElement(elements, target.text)
    if (found.kind === IPHONE_TREE_FOUND) {
      element = found.element
    }
  }
  if (!element) {
    throw new Error(IPHONE_ACTION_TARGET_MISSING)
  }
  return iphoneElementCenter(element.rect)
}
