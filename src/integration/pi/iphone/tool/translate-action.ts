import {
  IPHONE_ACTION_ACTIVATE,
  IPHONE_ACTION_ALERT,
  IPHONE_ACTION_CLOSE,
  IPHONE_ACTION_HOME,
  IPHONE_ACTION_INFO,
  IPHONE_ACTION_INSTALL,
  IPHONE_ACTION_LAUNCH,
  IPHONE_ACTION_ORIENTATION,
  IPHONE_ACTION_PRESS,
  IPHONE_ACTION_SCREENSHOT,
  IPHONE_ACTION_TERMINATE,
  IPHONE_ACTION_TREE,
  IPHONE_ACTION_URL,
  IPHONE_ACTION_WAIT,
  type IphoneDeviceAction,
} from "#synapse/modules"
import {
  PI_IPHONE_DEFAULT_BROWSER,
  PI_IPHONE_DEFAULT_MAX,
  PI_IPHONE_DEFAULT_SECONDS,
  PI_IPHONE_INVALID_ARGUMENTS,
  PI_IPHONE_VALUE_ACCEPT,
  PI_IPHONE_VALUE_DISMISS,
  PI_IPHONE_VALUE_LANDSCAPE,
  PI_IPHONE_VALUE_PORTRAIT,
} from "./constants"
import { iphoneNumber, iphoneRequiredText } from "./input-values"
import { translateIphoneGesture } from "./translate-gesture"
import { type PiIphoneInput } from "./types"

export function translateIphoneAction(input: PiIphoneInput): IphoneDeviceAction {
  switch (input.action) {
    case IPHONE_ACTION_TREE:
      return { kind: input.action, max: iphoneNumber(PI_IPHONE_DEFAULT_MAX, input.max) }
    case IPHONE_ACTION_SCREENSHOT:
    case IPHONE_ACTION_HOME:
    case IPHONE_ACTION_INFO:
    case IPHONE_ACTION_CLOSE:
      return { kind: input.action }
    case IPHONE_ACTION_LAUNCH:
    case IPHONE_ACTION_TERMINATE:
    case IPHONE_ACTION_ACTIVATE:
      return { kind: input.action, bundleId: iphoneRequiredText(input.bundle_id) }
    case IPHONE_ACTION_INSTALL:
      return { kind: input.action, path: iphoneRequiredText(input.path) }
    case IPHONE_ACTION_PRESS:
      return { kind: input.action, button: iphoneRequiredText(input.button) }
    case IPHONE_ACTION_URL:
      return {
        kind: input.action,
        url: iphoneRequiredText(input.url),
        bundleId: iphoneBrowserBundle(input),
      }
    case IPHONE_ACTION_WAIT:
      return { kind: input.action, seconds: iphoneNumber(PI_IPHONE_DEFAULT_SECONDS, input.seconds) }
    case IPHONE_ACTION_ORIENTATION:
      return translateIphoneOrientation(input)
    case IPHONE_ACTION_ALERT:
      return translateIphoneAlert(input)
    default:
      return translateIphoneGesture(input)
  }
}

function iphoneBrowserBundle(input: PiIphoneInput): string {
  if (input.bundle_id) {
    return input.bundle_id
  }
  return PI_IPHONE_DEFAULT_BROWSER
}

function translateIphoneOrientation(input: PiIphoneInput): IphoneDeviceAction {
  if (!input.orientation) {
    return { kind: IPHONE_ACTION_ORIENTATION }
  }
  const orientation = input.orientation.toUpperCase()
  if (orientation !== PI_IPHONE_VALUE_PORTRAIT && orientation !== PI_IPHONE_VALUE_LANDSCAPE) {
    throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
  return { kind: IPHONE_ACTION_ORIENTATION, orientation }
}

function translateIphoneAlert(input: PiIphoneInput): IphoneDeviceAction {
  const action = input.alert_action === PI_IPHONE_VALUE_DISMISS ? PI_IPHONE_VALUE_DISMISS : PI_IPHONE_VALUE_ACCEPT
  if (input.button_label) {
    return { kind: IPHONE_ACTION_ALERT, action, buttonLabel: input.button_label }
  }
  return { kind: IPHONE_ACTION_ALERT, action }
}
