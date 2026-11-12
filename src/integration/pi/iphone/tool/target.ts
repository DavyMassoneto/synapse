import {
  IPHONE_TARGET_ELEMENT,
  IPHONE_TARGET_POINT,
  IPHONE_TARGET_TEXT,
  type IphoneActionTarget,
  type IphoneDeviceAction,
  type IphoneTargetedAction,
} from "#synapse/modules"
import { PI_IPHONE_DESTINATION_FOUND, PI_IPHONE_DESTINATION_MISSING } from "./constants"
import { iphoneInputPoint, iphoneRequiredText } from "./input-values"
import { type PiIphoneDestination, type PiIphoneInput } from "./types"

export function iphoneActionTarget(input: PiIphoneInput): IphoneActionTarget {
  if (typeof input.element === "number") {
    return { kind: IPHONE_TARGET_ELEMENT, index: input.element }
  }
  if (input.text) {
    return { kind: IPHONE_TARGET_TEXT, text: iphoneRequiredText(input.text) }
  }
  return { kind: IPHONE_TARGET_POINT, point: iphoneInputPoint(input) }
}

export function iphoneDestination(input: PiIphoneInput): PiIphoneDestination {
  if (typeof input.to_element === "number") {
    return { kind: PI_IPHONE_DESTINATION_FOUND, target: { kind: IPHONE_TARGET_ELEMENT, index: input.to_element } }
  }
  if (input.to_text) {
    return {
      kind: PI_IPHONE_DESTINATION_FOUND,
      target: { kind: IPHONE_TARGET_TEXT, text: iphoneRequiredText(input.to_text) },
    }
  }
  if (typeof input.to_x === "number" && typeof input.to_y === "number") {
    return {
      kind: PI_IPHONE_DESTINATION_FOUND,
      target: { kind: IPHONE_TARGET_POINT, point: { x: input.to_x, y: input.to_y } },
    }
  }
  return { kind: PI_IPHONE_DESTINATION_MISSING }
}

export function iphoneTargetedRequest(input: PiIphoneInput, action: IphoneDeviceAction): IphoneTargetedAction {
  const request: IphoneTargetedAction = { action, target: iphoneActionTarget(input) }
  const destination = iphoneDestination(input)
  if (destination.kind === PI_IPHONE_DESTINATION_FOUND) {
    request.destination = destination.target
  }
  return request
}
