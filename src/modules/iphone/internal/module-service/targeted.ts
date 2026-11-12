import {
  executeIphoneDeviceAction,
  IPHONE_ACTION_CLEAR,
  IPHONE_ACTION_DOUBLE_TAP,
  IPHONE_ACTION_DRAG,
  IPHONE_ACTION_LONG_PRESS,
  IPHONE_ACTION_PAGE_DRAG,
  IPHONE_ACTION_SCROLL,
  IPHONE_ACTION_SWIPE,
  IPHONE_ACTION_TAP,
  IPHONE_ACTION_TYPE,
  resolveIphoneTarget,
} from "#synapse/modules/iphone/internal/device-actions"
import {
  type IphoneDeviceAction,
  type IphoneDeviceActionOutput,
  type IphoneElement,
  type IphoneManagedPort,
  type IphoneTargetedAction,
} from "#synapse/modules/iphone/public/contracts"
import { IPHONE_MODULE_TARGET_REQUIRED } from "./constants"

export async function executeIphoneTargeted(
  request: IphoneTargetedAction,
  session: IphoneManagedPort,
  signal: AbortSignal,
): Promise<IphoneDeviceActionOutput> {
  const action = buildIphoneTargetedAction(request, session.elements)
  session.elements = []
  return executeIphoneDeviceAction(session, action, signal)
}

function buildIphoneTargetedAction(request: IphoneTargetedAction, elements: IphoneElement[]): IphoneDeviceAction {
  const point = resolveIphoneTarget(request.target, elements)
  const action = request.action
  if (action.kind === IPHONE_ACTION_DRAG || action.kind === IPHONE_ACTION_PAGE_DRAG) {
    if (!request.destination) {
      if (action.kind === IPHONE_ACTION_PAGE_DRAG && action.releaseAtEdge) {
        return { ...action, drag: { ...action.drag, from: point } }
      }
      throw new Error(IPHONE_MODULE_TARGET_REQUIRED)
    }
    const destination = resolveIphoneTarget(request.destination, elements)
    return { ...action, drag: { ...action.drag, from: point, destination } }
  }
  if (
    action.kind === IPHONE_ACTION_TAP ||
    action.kind === IPHONE_ACTION_DOUBLE_TAP ||
    action.kind === IPHONE_ACTION_LONG_PRESS ||
    action.kind === IPHONE_ACTION_CLEAR ||
    action.kind === IPHONE_ACTION_TYPE ||
    action.kind === IPHONE_ACTION_SWIPE ||
    action.kind === IPHONE_ACTION_SCROLL
  ) {
    return { ...action, point }
  }
  throw new Error(IPHONE_MODULE_TARGET_REQUIRED)
}
