import { IPHONE_ACTION_LINK_SCRIPT, IPHONE_APPLICATION_SCRIPTS } from "./constants"
import { executeIphoneFallback } from "./fallback"
import { type IphoneApplicationAction, type IphoneDeviceActionPort, type IphoneUrlAction } from "./types"

export async function controlIphoneApplication(
  port: IphoneDeviceActionPort,
  action: IphoneApplicationAction,
  signal: AbortSignal,
): Promise<void> {
  await port.mobile(IPHONE_APPLICATION_SCRIPTS[action.kind], { bundleId: action.bundleId }, signal)
}

export async function openIphoneUrl(
  port: IphoneDeviceActionPort,
  action: IphoneUrlAction,
  signal: AbortSignal,
): Promise<void> {
  await executeIphoneFallback(
    port.mobile.bind(port, IPHONE_ACTION_LINK_SCRIPT, { url: action.url, bundleId: action.bundleId }, signal),
    port.openUrl.bind(port, action.url, signal),
    signal,
  )
}
