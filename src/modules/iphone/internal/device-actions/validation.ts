import {
  IPHONE_ACTION_DOWN,
  IPHONE_ACTION_INVALID,
  IPHONE_ACTION_LEFT,
  IPHONE_ACTION_RIGHT,
  IPHONE_ACTION_UP,
} from "./constants"
import { type IphoneDeviceAction } from "./types"

export function validateIphoneDeviceAction(action: IphoneDeviceAction): void {
  if ("point" in action && action.point) {
    const point = action.point
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.y < 0) {
      throw new Error(IPHONE_ACTION_INVALID)
    }
  }
  if ("bundleId" in action && !action.bundleId.trim()) {
    throw new Error(IPHONE_ACTION_INVALID)
  }
  if ("path" in action && !action.path.trim()) {
    throw new Error(IPHONE_ACTION_INVALID)
  }
  if ("button" in action && !action.button.trim()) {
    throw new Error(IPHONE_ACTION_INVALID)
  }
  if ("url" in action && !URL.canParse(action.url)) {
    throw new Error(IPHONE_ACTION_INVALID)
  }
  validateIphoneActionLimits(action)
}

function validateIphoneActionLimits(action: IphoneDeviceAction): void {
  if (
    "direction" in action &&
    ![IPHONE_ACTION_UP, IPHONE_ACTION_DOWN, IPHONE_ACTION_LEFT, IPHONE_ACTION_RIGHT].includes(action.direction)
  ) {
    throw new Error(IPHONE_ACTION_INVALID)
  }
  if ("seconds" in action && (!Number.isFinite(action.seconds) || action.seconds < 0)) {
    throw new Error(IPHONE_ACTION_INVALID)
  }
  if ("max" in action && (!Number.isInteger(action.max) || action.max < 1)) {
    throw new Error(IPHONE_ACTION_INVALID)
  }
}
