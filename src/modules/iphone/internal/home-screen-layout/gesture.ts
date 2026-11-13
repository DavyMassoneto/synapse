import {
  buildIphoneDrag,
  buildIphonePageDrag,
  type IphoneEdge,
  type IphoneGestureResult,
} from "#synapse/modules/iphone/internal/pointer-gestures"
import { type IphonePoint } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_HOME_DRAG_CALIBRATION, IPHONE_HOME_FLIP_WAIT_MS, IPHONE_HOME_GRID } from "./constants"

export function buildIphoneHomeDrag(from: IphonePoint, destination: IphonePoint): IphoneGestureResult {
  return buildIphoneDrag({
    from,
    destination,
    ...IPHONE_HOME_DRAG_CALIBRATION,
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
      ...IPHONE_HOME_DRAG_CALIBRATION,
    },
    edge,
    viewportWidth: IPHONE_HOME_GRID.width,
    flips: 1,
    flipWaitMs: IPHONE_HOME_FLIP_WAIT_MS,
  })
}
