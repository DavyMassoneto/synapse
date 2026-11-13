import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphoneDragSpec,
  type IphonePoint,
  type IphonePointerAction,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_INVALID_GESTURE,
  IPHONE_LIFT_PAUSE_MS,
  IPHONE_POINTER_BUTTON,
  IPHONE_POINTER_DOWN,
  IPHONE_POINTER_MOVE,
  IPHONE_POINTER_PAUSE,
  IPHONE_POINTER_UP,
} from "./constants"
import { type IphoneGestureResult } from "./types"

export function buildIphonePress(point: IphonePoint, duration: number): IphoneGestureResult {
  if (![point.x, point.y, duration].every(Number.isFinite) || point.x < 0 || point.y < 0 || duration < 0) {
    return { kind: IPHONE_REFUSED, message: IPHONE_INVALID_GESTURE }
  }
  return {
    kind: IPHONE_ACCEPTED,
    actions: [
      { type: IPHONE_POINTER_MOVE, duration: 0, x: point.x, y: point.y },
      { type: IPHONE_POINTER_DOWN, button: IPHONE_POINTER_BUTTON },
      { type: IPHONE_POINTER_PAUSE, duration },
      { type: IPHONE_POINTER_UP, button: IPHONE_POINTER_BUTTON },
    ],
  }
}

export function buildIphoneDrag(spec: IphoneDragSpec): IphoneGestureResult {
  const values = [
    spec.from.x,
    spec.from.y,
    spec.destination.x,
    spec.destination.y,
    spec.holdMs,
    spec.liftDistance,
    spec.liftMs,
    spec.moveMs,
    spec.hoverMs,
  ]
  if (!values.every(Number.isFinite) || values.some((value) => value < 0)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_INVALID_GESTURE }
  }
  const actions: IphonePointerAction[] = [
    { type: IPHONE_POINTER_MOVE, duration: 0, x: spec.from.x, y: spec.from.y },
    { type: IPHONE_POINTER_DOWN, button: IPHONE_POINTER_BUTTON },
    { type: IPHONE_POINTER_PAUSE, duration: spec.holdMs },
  ]
  const dx = spec.destination.x - spec.from.x
  const dy = spec.destination.y - spec.from.y
  const distance = Math.hypot(dx, dy)
  if (spec.liftDistance > 0 && distance > spec.liftDistance) {
    actions.push({
      type: IPHONE_POINTER_MOVE,
      duration: spec.liftMs,
      x: Math.round(spec.from.x + (dx / distance) * spec.liftDistance),
      y: Math.round(spec.from.y + (dy / distance) * spec.liftDistance),
    })
    actions.push({ type: IPHONE_POINTER_PAUSE, duration: IPHONE_LIFT_PAUSE_MS })
  }
  actions.push({ type: IPHONE_POINTER_MOVE, duration: spec.moveMs, x: spec.destination.x, y: spec.destination.y })
  actions.push({ type: IPHONE_POINTER_PAUSE, duration: spec.hoverMs })
  actions.push({ type: IPHONE_POINTER_UP, button: IPHONE_POINTER_BUTTON })
  return { kind: IPHONE_ACCEPTED, actions }
}
