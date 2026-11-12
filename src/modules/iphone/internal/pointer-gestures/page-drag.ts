import { IPHONE_ACCEPTED, IPHONE_REFUSED } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_EDGE_INSET,
  IPHONE_EDGE_MOVE_MS,
  IPHONE_EDGE_REENTRY,
  IPHONE_INVALID_GESTURE,
  IPHONE_LIFT_PAUSE_MS,
  IPHONE_POINTER_BUTTON,
  IPHONE_POINTER_MOVE,
  IPHONE_POINTER_PAUSE,
  IPHONE_POINTER_UP,
} from "./constants"
import { buildIphoneDrag } from "./gestures"
import { type IphoneGestureResult, type IphonePageDragSpec, type IphonePointerAction } from "./types"

function appendIphoneFlips(actions: IphonePointerAction[], spec: IphonePageDragSpec, edgeX: number): void {
  const reentry = spec.edge === "left" ? edgeX + IPHONE_EDGE_REENTRY : edgeX - IPHONE_EDGE_REENTRY
  for (let flip = 0; flip < spec.flips; flip++) {
    actions.push({ type: IPHONE_POINTER_PAUSE, duration: spec.flipWaitMs })
    if (flip < spec.flips - 1) {
      actions.push({ type: IPHONE_POINTER_MOVE, duration: IPHONE_LIFT_PAUSE_MS, x: reentry, y: spec.drag.from.y })
      actions.push({ type: IPHONE_POINTER_MOVE, duration: IPHONE_LIFT_PAUSE_MS, x: edgeX, y: spec.drag.from.y })
    }
  }
}

function appendIphonePageDestination(actions: IphonePointerAction[], spec: IphonePageDragSpec): void {
  if (!spec.releaseAtEdge) {
    actions.push({
      type: IPHONE_POINTER_MOVE,
      duration: spec.drag.moveMs,
      x: spec.drag.destination.x,
      y: spec.drag.destination.y,
    })
    actions.push({ type: IPHONE_POINTER_PAUSE, duration: spec.drag.hoverMs })
  }
  actions.push({ type: IPHONE_POINTER_UP, button: IPHONE_POINTER_BUTTON })
}

export function buildIphonePageDrag(spec: IphonePageDragSpec): IphoneGestureResult {
  if (
    !Number.isInteger(spec.flips) ||
    spec.flips < 1 ||
    !Number.isFinite(spec.viewportWidth) ||
    spec.viewportWidth <= IPHONE_EDGE_REENTRY ||
    !Number.isFinite(spec.flipWaitMs) ||
    spec.flipWaitMs < 0
  ) {
    return { kind: IPHONE_REFUSED, message: IPHONE_INVALID_GESTURE }
  }
  const destination = buildIphoneDrag(spec.drag)
  if (destination.kind === IPHONE_REFUSED) {
    return destination
  }
  const edgeX = spec.edge === "left" ? IPHONE_EDGE_INSET : Math.round(spec.viewportWidth - IPHONE_EDGE_INSET)
  const approach = buildIphoneDrag({
    ...spec.drag,
    destination: { x: edgeX, y: spec.drag.from.y },
    moveMs: IPHONE_EDGE_MOVE_MS,
    hoverMs: 0,
  })
  if (approach.kind === IPHONE_REFUSED) {
    return approach
  }
  const actions: IphonePointerAction[] = approach.actions.slice(0, -2)
  appendIphoneFlips(actions, spec, edgeX)
  appendIphonePageDestination(actions, spec)
  return { kind: IPHONE_ACCEPTED, actions }
}
