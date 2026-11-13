import { type IphoneGestureResult } from "#synapse/modules/iphone/internal/pointer-gestures"
import {
  IPHONE_REFUSED,
  IPHONE_RESULT_TEXT,
  type IphoneDeviceActionPort,
  type IphoneTextOutput,
} from "#synapse/modules/iphone/public/contracts"
import { IPHONE_ACTION_TAPPED } from "./constants"

export async function sendIphoneGesture(
  port: IphoneDeviceActionPort,
  gesture: IphoneGestureResult,
  signal: AbortSignal,
): Promise<IphoneTextOutput> {
  if (gesture.kind === IPHONE_REFUSED) {
    throw new Error(gesture.message)
  }
  await port.actions(gesture.actions, signal)
  signal.throwIfAborted()
  return { kind: IPHONE_RESULT_TEXT, text: IPHONE_ACTION_TAPPED }
}
