import {
  IPHONE_ACTION_SCROLL,
  type IphoneDeviceActionPort,
  type IphoneSwipeAction,
  type IphoneSwipeDirection,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_ACTION_DOWN,
  IPHONE_ACTION_DRAG_SCRIPT,
  IPHONE_ACTION_LEFT,
  IPHONE_ACTION_OPPOSITE_DIRECTIONS,
  IPHONE_ACTION_SCROLL_SCRIPT,
  IPHONE_ACTION_SWIPE_FRACTION,
  IPHONE_ACTION_SWIPE_SECONDS,
  IPHONE_ACTION_UP,
} from "./constants"
import { executeIphoneFallback } from "./fallback"
import { type IphoneSwipeEndpoints } from "./types"

async function swipeIphoneScreen(
  port: IphoneDeviceActionPort,
  action: IphoneSwipeAction,
  signal: AbortSignal,
): Promise<void> {
  const rect = await port.rect(signal)
  const center = action.point ? action.point : { x: Math.round(rect.width / 2), y: Math.round(rect.height / 2) }
  const direction = iphoneSwipeDirection(action)
  const dx = Math.round(rect.width * IPHONE_ACTION_SWIPE_FRACTION)
  const dy = Math.round(rect.height * IPHONE_ACTION_SWIPE_FRACTION)
  const endpoints: IphoneSwipeEndpoints = {
    fromX: center.x,
    fromY: center.y,
    toX: center.x,
    toY: center.y,
    duration: IPHONE_ACTION_SWIPE_SECONDS,
  }
  if (direction === IPHONE_ACTION_UP || direction === IPHONE_ACTION_DOWN) {
    const delta = direction === IPHONE_ACTION_UP ? dy : -dy
    endpoints.fromY += delta
    endpoints.toY -= delta
  } else {
    const delta = direction === IPHONE_ACTION_LEFT ? dx : -dx
    endpoints.fromX += delta
    endpoints.toX -= delta
  }
  await port.mobile(IPHONE_ACTION_DRAG_SCRIPT, endpoints, signal)
}

export async function executeIphoneSwipe(
  port: IphoneDeviceActionPort,
  action: IphoneSwipeAction,
  signal: AbortSignal,
): Promise<void> {
  if (action.kind === IPHONE_ACTION_SCROLL && action.point) {
    await executeIphoneFallback(
      port.mobile.bind(
        port,
        IPHONE_ACTION_SCROLL_SCRIPT,
        { direction: action.direction, x: action.point.x, y: action.point.y },
        signal,
      ),
      swipeIphoneScreen.bind(null, port, action, signal),
      signal,
    )
  } else {
    await swipeIphoneScreen(port, action, signal)
  }
}

function iphoneSwipeDirection(action: IphoneSwipeAction): IphoneSwipeDirection {
  if (action.kind === IPHONE_ACTION_SCROLL) {
    return IPHONE_ACTION_OPPOSITE_DIRECTIONS[action.direction]
  }
  return action.direction
}
