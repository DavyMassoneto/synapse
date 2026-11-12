import { buildIphonePress } from "#synapse/modules/iphone/internal/pointer-gestures"
import {
  IPHONE_ACTION_FOCUS_WAIT_MS,
  IPHONE_ACTION_KEYS,
  IPHONE_ACTION_RETURN,
  IPHONE_ACTION_TAP_DURATION_MS,
} from "./constants"
import { executeIphoneFallback } from "./fallback"
import { sendIphoneGesture } from "./gesture"
import { type IphoneClearAction, type IphoneDeviceActionPort, type IphoneTypeAction } from "./types"

export async function typeIphoneText(
  port: IphoneDeviceActionPort,
  action: IphoneTypeAction,
  signal: AbortSignal,
): Promise<void> {
  if (action.point) {
    await sendIphoneGesture(port, buildIphonePress(action.point, IPHONE_ACTION_TAP_DURATION_MS), signal)
    await port.wait(IPHONE_ACTION_FOCUS_WAIT_MS, signal)
  }
  await executeIphoneFallback(
    port.mobile.bind(port, IPHONE_ACTION_KEYS, { keys: [...action.text] }, signal),
    typeIphoneActiveElement.bind(null, port, action.text, signal),
    signal,
  )
  if (action.submit) {
    await port.mobile(IPHONE_ACTION_KEYS, { keys: [IPHONE_ACTION_RETURN] }, signal)
  }
}

async function typeIphoneActiveElement(port: IphoneDeviceActionPort, text: string, signal: AbortSignal): Promise<void> {
  const element = await port.activeElement(signal)
  signal.throwIfAborted()
  await port.elementValue(element, text, signal)
}

export async function clearIphoneText(
  port: IphoneDeviceActionPort,
  action: IphoneClearAction,
  signal: AbortSignal,
): Promise<void> {
  await sendIphoneGesture(port, buildIphonePress(action.point, IPHONE_ACTION_TAP_DURATION_MS), signal)
  const element = await port.activeElement(signal)
  await port.clearElement(element, signal)
}
