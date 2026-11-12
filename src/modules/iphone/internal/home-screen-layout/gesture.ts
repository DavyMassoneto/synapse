import {
  buildIphoneDrag,
  buildIphonePageDrag,
  type IphoneEdge,
  type IphoneGestureResult,
} from "#synapse/modules/iphone/internal/pointer-gestures"
import { type IphonePoint } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_DRAG_HOLD_MS,
  IPHONE_HOME_DRAG_HOVER_MS,
  IPHONE_HOME_DRAG_LIFT_MS,
  IPHONE_HOME_DRAG_LIFT_POINTS,
  IPHONE_HOME_DRAG_MOVE_MS,
  IPHONE_HOME_FLIP_WAIT_MS,
  IPHONE_HOME_GRID,
} from "./constants"

export function buildIphoneHomeDrag(from: IphonePoint, destination: IphonePoint): IphoneGestureResult {
  return buildIphoneDrag({
    from,
    destination,
    holdMs: IPHONE_HOME_DRAG_HOLD_MS,
    hoverMs: IPHONE_HOME_DRAG_HOVER_MS,
    liftMs: IPHONE_HOME_DRAG_LIFT_MS,
    liftDistance: IPHONE_HOME_DRAG_LIFT_POINTS,
    moveMs: IPHONE_HOME_DRAG_MOVE_MS,
  })
}

export function buildIphoneHomePageDrag(
  from: IphonePoint,
  destination: IphonePoint,
  edge: IphoneEdge,
): IphoneGestureResult {
  return buildIphonePageDrag({
    drag: {
      from,
      destination,
      holdMs: IPHONE_HOME_DRAG_HOLD_MS,
      hoverMs: IPHONE_HOME_DRAG_HOVER_MS,
      liftMs: IPHONE_HOME_DRAG_LIFT_MS,
      liftDistance: IPHONE_HOME_DRAG_LIFT_POINTS,
      moveMs: IPHONE_HOME_DRAG_MOVE_MS,
    },
    edge,
    viewportWidth: IPHONE_HOME_GRID.width,
    flips: 1,
    flipWaitMs: IPHONE_HOME_FLIP_WAIT_MS,
  })
}
