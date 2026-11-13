import {
  IPHONE_ACTION_ALERT,
  IPHONE_ACTION_CLOSE,
  IPHONE_ACTION_HOME,
  IPHONE_ACTION_INSTALL,
  IPHONE_ACTION_ORIENTATION,
  IPHONE_ACTION_PRESS,
  IPHONE_ACTION_WAIT,
  type IphoneActionArguments,
  type IphoneAlertAction,
  type IphoneDeviceActionPort,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_ACTION_INSTALL_SCRIPT,
  IPHONE_ACTION_MAX_WAIT_SECONDS,
  IPHONE_ACTION_MS_PER_SECOND,
  IPHONE_ACTION_PRESS_SCRIPT,
  IPHONE_ACTION_SENT,
} from "./constants"
import { type IphoneSimpleDeviceAction } from "./types"

export async function executeIphoneDeviceCommand(
  port: IphoneDeviceActionPort,
  action: IphoneSimpleDeviceAction,
  signal: AbortSignal,
): Promise<string> {
  switch (action.kind) {
    case IPHONE_ACTION_INSTALL:
      await port.mobile(IPHONE_ACTION_INSTALL_SCRIPT, { app: action.path }, signal)
      break
    case IPHONE_ACTION_HOME:
      await port.mobile(IPHONE_ACTION_PRESS_SCRIPT, { name: IPHONE_ACTION_HOME }, signal)
      break
    case IPHONE_ACTION_PRESS:
      await port.mobile(IPHONE_ACTION_PRESS_SCRIPT, { name: action.button }, signal)
      break
    case IPHONE_ACTION_ALERT:
      await port.mobile(IPHONE_ACTION_ALERT, { action: action.action, ...alertButton(action) }, signal)
      break
    case IPHONE_ACTION_WAIT:
      await port.wait(Math.min(IPHONE_ACTION_MAX_WAIT_SECONDS, action.seconds) * IPHONE_ACTION_MS_PER_SECOND, signal)
      break
    case IPHONE_ACTION_CLOSE:
      await port.close(signal)
      break
    case IPHONE_ACTION_ORIENTATION:
      if (action.orientation) {
        await port.setOrientation(action.orientation, signal)
      }
      return port.getOrientation(signal)
  }
  return IPHONE_ACTION_SENT
}

function alertButton(action: IphoneAlertAction): IphoneActionArguments {
  const args: IphoneActionArguments = {}
  if (action.buttonLabel) {
    args.buttonLabel = action.buttonLabel
  }
  return args
}
