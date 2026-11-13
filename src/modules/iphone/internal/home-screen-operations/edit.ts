import { buildIphonePress } from "#synapse/modules/iphone/internal/pointer-gestures"
import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphoneHomeScreenPort,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_ALERT_FAILURE,
  IPHONE_HOME_DONE_POINT,
  IPHONE_HOME_EDIT_FAILURE,
  IPHONE_HOME_EDIT_POINT,
  IPHONE_HOME_FOLDER_EDIT_POINT,
  IPHONE_HOME_FOLDER_FAILURE,
  IPHONE_HOME_PRESS_MS,
  IPHONE_HOME_SETTLE_MS,
} from "./constants"
import { readIphoneHomeScreen } from "./read"

export async function editIphoneHomeScreen(
  port: IphoneHomeScreenPort,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const before = await readIphoneHomeScreen(port, signal)
  if (before.kind === IPHONE_REFUSED) {
    return before
  }
  if (before.alert) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ALERT_FAILURE }
  }
  if (before.edit) {
    return { kind: IPHONE_ACCEPTED }
  }
  const point = before.inFolder ? IPHONE_HOME_FOLDER_EDIT_POINT : IPHONE_HOME_EDIT_POINT
  const gesture = buildIphonePress(point, IPHONE_HOME_PRESS_MS)
  if (gesture.kind === IPHONE_REFUSED) {
    return gesture
  }
  await port.actions(gesture.actions, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const after = await readIphoneHomeScreen(port, signal)
  if (after.kind === IPHONE_REFUSED) {
    return after
  }
  if (!after.edit || after.alert) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_EDIT_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED }
}

export async function exitIphoneHomeEdit(
  port: IphoneHomeScreenPort,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const before = await readIphoneHomeScreen(port, signal)
  if (before.kind === IPHONE_REFUSED) {
    return before
  }
  if (before.alert) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ALERT_FAILURE }
  }
  if (before.inFolder) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_FAILURE }
  }
  if (!before.edit) {
    return { kind: IPHONE_ACCEPTED }
  }
  await port.tap(IPHONE_HOME_DONE_POINT, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const after = await readIphoneHomeScreen(port, signal)
  if (after.kind === IPHONE_REFUSED) {
    return after
  }
  if (after.edit || after.alert) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_EDIT_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED }
}
