import { formatIphoneElementTree, parseIphoneElementTree } from "#synapse/modules/iphone/internal/element-tree"
import {
  buildIphoneDrag,
  buildIphonePageDrag,
  buildIphonePress,
  type IphoneGestureResult,
} from "#synapse/modules/iphone/internal/pointer-gestures"
import {
  IPHONE_ACTION_ACTIVATE,
  IPHONE_ACTION_CLEAR,
  IPHONE_ACTION_DOUBLE_TAP,
  IPHONE_ACTION_DRAG,
  IPHONE_ACTION_INFO,
  IPHONE_ACTION_LAUNCH,
  IPHONE_ACTION_LONG_PRESS,
  IPHONE_ACTION_PAGE_DRAG,
  IPHONE_ACTION_SCREENSHOT,
  IPHONE_ACTION_SCROLL,
  IPHONE_ACTION_SWIPE,
  IPHONE_ACTION_TAP,
  IPHONE_ACTION_TERMINATE,
  IPHONE_ACTION_TREE,
  IPHONE_ACTION_TYPE,
  IPHONE_ACTION_URL,
  IPHONE_IMAGE_PNG,
  IPHONE_REFUSED,
  IPHONE_RESULT_IMAGE,
  IPHONE_RESULT_INFO,
  IPHONE_RESULT_TEXT,
  IPHONE_RESULT_TREE,
  type IphoneDeviceAction,
  type IphoneDeviceActionOutput,
  type IphoneDeviceActionPort,
} from "#synapse/modules/iphone/public/contracts"
import { controlIphoneApplication, openIphoneUrl } from "./application"
import * as constants from "./constants"
import { executeIphoneDeviceCommand } from "./device-command"
import { sendIphoneGesture } from "./gesture"
import { executeIphoneSwipe } from "./swipe"
import { clearIphoneText, typeIphoneText } from "./text-input"
import { type IphoneDispatchedAction, type IphonePointerDeviceAction, type IphoneRemainingAction } from "./types"
import { validateIphoneDeviceAction } from "./validation"

export async function executeIphoneDeviceAction(
  port: IphoneDeviceActionPort,
  action: IphoneDeviceAction,
  signal: AbortSignal,
): Promise<IphoneDeviceActionOutput> {
  signal.throwIfAborted()
  validateIphoneDeviceAction(action)
  if (action.kind === IPHONE_ACTION_TREE) {
    return readIphoneTree(port, action.max, signal)
  }
  if (action.kind === IPHONE_ACTION_SCREENSHOT) {
    return readIphoneScreenshot(port, signal)
  }
  if (action.kind === IPHONE_ACTION_INFO) {
    return readIphoneInfo(port, signal)
  }
  const text = await dispatchIphoneDeviceAction(port, action, signal)
  signal.throwIfAborted()
  return { kind: IPHONE_RESULT_TEXT, text }
}

async function readIphoneTree(
  port: IphoneDeviceActionPort,
  max: number,
  signal: AbortSignal,
): Promise<IphoneDeviceActionOutput> {
  const source = await port.source(signal)
  signal.throwIfAborted()
  const tree = parseIphoneElementTree(source, max)
  if (tree.kind === IPHONE_REFUSED) {
    throw new Error(tree.message)
  }
  const viewport = await port.rect(signal)
  signal.throwIfAborted()
  return {
    kind: IPHONE_RESULT_TREE,
    text: formatIphoneElementTree(tree.tree),
    count: tree.tree.elements.length,
    viewport,
    elements: tree.tree.elements,
  }
}

async function readIphoneScreenshot(
  port: IphoneDeviceActionPort,
  signal: AbortSignal,
): Promise<IphoneDeviceActionOutput> {
  const data = await port.screenshot(signal)
  signal.throwIfAborted()
  return { kind: IPHONE_RESULT_IMAGE, data, mimeType: IPHONE_IMAGE_PNG }
}

async function readIphoneInfo(port: IphoneDeviceActionPort, signal: AbortSignal): Promise<IphoneDeviceActionOutput> {
  const device = await port.mobileInfo(constants.IPHONE_ACTION_DEVICE_INFO, signal)
  signal.throwIfAborted()
  const activeApp = await port.mobileInfo(constants.IPHONE_ACTION_APP_INFO, signal)
  signal.throwIfAborted()
  const viewport = await port.rect(signal)
  signal.throwIfAborted()
  return { kind: IPHONE_RESULT_INFO, device, activeApp, viewport }
}

async function dispatchIphoneDeviceAction(
  port: IphoneDeviceActionPort,
  action: IphoneDispatchedAction,
  signal: AbortSignal,
): Promise<string> {
  switch (action.kind) {
    case IPHONE_ACTION_TAP:
    case IPHONE_ACTION_LONG_PRESS:
    case IPHONE_ACTION_DRAG:
      return executeIphonePointerAction(port, action, signal)
    case IPHONE_ACTION_PAGE_DRAG: {
      const viewport = await port.rect(signal)
      signal.throwIfAborted()
      return (await sendIphoneGesture(port, buildIphonePageDrag({ ...action, viewportWidth: viewport.width }), signal))
        .text
    }
    case IPHONE_ACTION_DOUBLE_TAP:
      await port.mobile(constants.IPHONE_ACTION_DOUBLE_TAP_SCRIPT, action.point, signal)
      break
    case IPHONE_ACTION_TYPE:
      await typeIphoneText(port, action, signal)
      break
    case IPHONE_ACTION_CLEAR:
      await clearIphoneText(port, action, signal)
      break
    case IPHONE_ACTION_SWIPE:
    case IPHONE_ACTION_SCROLL:
      await executeIphoneSwipe(port, action, signal)
      break
    default:
      return dispatchIphoneApplicationAction(port, action, signal)
  }
  return constants.IPHONE_ACTION_SENT
}

async function dispatchIphoneApplicationAction(
  port: IphoneDeviceActionPort,
  action: IphoneRemainingAction,
  signal: AbortSignal,
): Promise<string> {
  switch (action.kind) {
    case IPHONE_ACTION_LAUNCH:
    case IPHONE_ACTION_TERMINATE:
    case IPHONE_ACTION_ACTIVATE:
      await controlIphoneApplication(port, action, signal)
      break
    case IPHONE_ACTION_URL:
      await openIphoneUrl(port, action, signal)
      break
    default:
      return executeIphoneDeviceCommand(port, action, signal)
  }
  return constants.IPHONE_ACTION_SENT
}

async function executeIphonePointerAction(
  port: IphoneDeviceActionPort,
  action: IphonePointerDeviceAction,
  signal: AbortSignal,
): Promise<string> {
  let gesture: IphoneGestureResult
  if (action.kind === IPHONE_ACTION_DRAG) {
    gesture = buildIphoneDrag(action.drag)
  } else {
    const duration = action.kind === IPHONE_ACTION_TAP ? constants.IPHONE_ACTION_TAP_DURATION_MS : action.durationMs
    gesture = buildIphonePress(action.point, duration)
  }
  return (await sendIphoneGesture(port, gesture, signal)).text
}
