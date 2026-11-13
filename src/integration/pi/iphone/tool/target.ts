import {
  IPHONE_TARGET_ELEMENT,
  IPHONE_TARGET_POINT,
  IPHONE_TARGET_TEXT,
  type IphoneDeviceAction,
  type IphonePoint,
  type IphoneTargetedAction,
} from "#synapse/modules"
import {
  PI_IPHONE_DESTINATION_FOUND,
  PI_IPHONE_DESTINATION_MISSING,
  PI_IPHONE_INVALID_ARGUMENTS,
  PI_IPHONE_TARGET_REPLACED_POINT,
} from "./constants"
import { type PiIphoneInput, type PiIphonePointOption, type PiIphoneTargetSource, type PiIphoneTargets } from "./types"

export function iphoneTargets(input: PiIphoneInput): PiIphoneTargets {
  return {
    source: iphoneTargetSource(input.element, input.text, input.x, input.y),
    destination: iphoneTargetSource(input.to_element, input.to_text, input.to_x, input.to_y),
  }
}

function iphoneTargetSource(element?: number, text?: string, x?: number, y?: number): PiIphoneTargetSource {
  if (typeof element === "number") {
    return { kind: PI_IPHONE_DESTINATION_FOUND, target: { kind: IPHONE_TARGET_ELEMENT, index: element } }
  }
  if (text) {
    if (!text.trim()) {
      throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
    }
    return { kind: PI_IPHONE_DESTINATION_FOUND, target: { kind: IPHONE_TARGET_TEXT, text } }
  }
  if (typeof x === "number" && typeof y === "number") {
    return { kind: PI_IPHONE_DESTINATION_FOUND, target: { kind: IPHONE_TARGET_POINT, point: { x, y } } }
  }
  if (typeof x === "number" || typeof y === "number") {
    throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
  return { kind: PI_IPHONE_DESTINATION_MISSING }
}

export function iphoneTargetPoint(source: PiIphoneTargetSource): IphonePoint {
  if (source.kind === PI_IPHONE_DESTINATION_MISSING) {
    throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
  if (source.target.kind === IPHONE_TARGET_POINT) {
    return source.target.point
  }
  return PI_IPHONE_TARGET_REPLACED_POINT
}

export function iphoneOptionalTargetPoint(source: PiIphoneTargetSource): PiIphonePointOption {
  if (source.kind === PI_IPHONE_DESTINATION_FOUND) {
    return { point: iphoneTargetPoint(source) }
  }
  return {}
}

export function iphoneTargetedRequest(targets: PiIphoneTargets, action: IphoneDeviceAction): IphoneTargetedAction {
  if (targets.source.kind === PI_IPHONE_DESTINATION_MISSING) {
    throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
  const request: IphoneTargetedAction = { action, target: targets.source.target }
  if (targets.destination.kind === PI_IPHONE_DESTINATION_FOUND) {
    request.destination = targets.destination.target
  }
  return request
}
