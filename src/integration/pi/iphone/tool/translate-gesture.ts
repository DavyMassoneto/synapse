import {
  IPHONE_ACTION_CLEAR,
  IPHONE_ACTION_DOUBLE_TAP,
  IPHONE_ACTION_DRAG,
  IPHONE_ACTION_LONG_PRESS,
  IPHONE_ACTION_PAGE_DRAG,
  IPHONE_ACTION_SCROLL,
  IPHONE_ACTION_SWIPE,
  IPHONE_ACTION_TAP,
  IPHONE_ACTION_TYPE,
  type IphoneDeviceAction,
  type IphoneDragSpec,
  type IphonePoint,
  type IphoneSwipeAction,
  type IphoneTypeAction,
} from "#synapse/modules"
import {
  PI_IPHONE_DEFAULT_FLIP_MS,
  PI_IPHONE_DEFAULT_HOLD_MS,
  PI_IPHONE_DEFAULT_HOVER_MS,
  PI_IPHONE_DEFAULT_LIFT_DISTANCE,
  PI_IPHONE_DEFAULT_LIFT_MS,
  PI_IPHONE_DEFAULT_MOVE_MS,
  PI_IPHONE_DESTINATION_FOUND,
  PI_IPHONE_DESTINATION_MISSING,
  PI_IPHONE_INVALID_ARGUMENTS,
  PI_IPHONE_VALUE_DOWN,
  PI_IPHONE_VALUE_LEFT,
  PI_IPHONE_VALUE_RIGHT,
  PI_IPHONE_VALUE_UP,
} from "./constants"
import { iphoneMilliseconds, iphoneNumber } from "./input-values"
import { iphoneOptionalTargetPoint, iphoneTargetPoint } from "./target"
import { type PiIphoneInput, type PiIphoneTargetSource, type PiIphoneTargets } from "./types"

export function translateIphoneGesture(input: PiIphoneInput, targets: PiIphoneTargets): IphoneDeviceAction {
  switch (input.action) {
    case IPHONE_ACTION_TAP:
    case IPHONE_ACTION_DOUBLE_TAP:
    case IPHONE_ACTION_CLEAR:
      return { kind: input.action, point: iphoneTargetPoint(targets.source) }
    case IPHONE_ACTION_LONG_PRESS:
      return {
        kind: input.action,
        point: iphoneTargetPoint(targets.source),
        durationMs: iphoneMilliseconds(PI_IPHONE_DEFAULT_HOLD_MS, input.seconds),
      }
    case IPHONE_ACTION_TYPE:
      return translateIphoneText(input, targets.source)
    case IPHONE_ACTION_SWIPE:
    case IPHONE_ACTION_SCROLL: {
      if (
        input.direction !== PI_IPHONE_VALUE_UP &&
        input.direction !== PI_IPHONE_VALUE_DOWN &&
        input.direction !== PI_IPHONE_VALUE_LEFT &&
        input.direction !== PI_IPHONE_VALUE_RIGHT
      ) {
        throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
      }
      const swipe: IphoneSwipeAction = { kind: input.action, direction: input.direction }
      Object.assign(swipe, iphoneOptionalTargetPoint(targets.source))
      return swipe
    }
    case IPHONE_ACTION_DRAG:
      return translateIphoneDrag(input, targets)
    default:
      throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
}

function translateIphoneDrag(input: PiIphoneInput, targets: PiIphoneTargets): IphoneDeviceAction {
  const destination = targets.destination
  const point = iphoneDragDestination(input, targets)
  const drag = iphoneDragSpec(input, point, targets.source)
  if (input.flips) {
    if (input.edge !== PI_IPHONE_VALUE_LEFT && input.edge !== PI_IPHONE_VALUE_RIGHT) {
      throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
    }
    return {
      kind: IPHONE_ACTION_PAGE_DRAG,
      drag,
      edge: input.edge,
      flips: input.flips,
      flipWaitMs: iphoneMilliseconds(PI_IPHONE_DEFAULT_FLIP_MS, input.flip_wait),
      releaseAtEdge: destination.kind === PI_IPHONE_DESTINATION_MISSING,
    }
  }
  return { kind: IPHONE_ACTION_DRAG, drag }
}

function translateIphoneText(input: PiIphoneInput, source: PiIphoneTargetSource): IphoneDeviceAction {
  if (typeof input.text_input !== "string") {
    throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
  const action: IphoneTypeAction = { kind: IPHONE_ACTION_TYPE, text: input.text_input, submit: input.submit === true }
  Object.assign(action, iphoneOptionalTargetPoint(source))
  return action
}

function iphoneDragDestination(input: PiIphoneInput, targets: PiIphoneTargets): IphonePoint {
  if (targets.destination.kind === PI_IPHONE_DESTINATION_FOUND) {
    return iphoneTargetPoint(targets.destination)
  }
  if (input.flips) {
    return iphoneTargetPoint(targets.source)
  }
  throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
}

function iphoneDragSpec(input: PiIphoneInput, point: IphonePoint, source: PiIphoneTargetSource): IphoneDragSpec {
  const drag: IphoneDragSpec = {
    from: iphoneTargetPoint(source),
    destination: point,
    holdMs: iphoneMilliseconds(PI_IPHONE_DEFAULT_HOLD_MS, input.seconds),
    liftDistance: iphoneNumber(PI_IPHONE_DEFAULT_LIFT_DISTANCE, input.lift_px),
    liftMs: iphoneMilliseconds(PI_IPHONE_DEFAULT_LIFT_MS, input.lift_ms),
    moveMs: iphoneMilliseconds(PI_IPHONE_DEFAULT_MOVE_MS, input.move),
    hoverMs: iphoneMilliseconds(PI_IPHONE_DEFAULT_HOVER_MS, input.hover),
  }
  return drag
}
