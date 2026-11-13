import {
  IPHONE_ACCEPTED,
  IPHONE_DEVICE,
  IPHONE_MACOS,
  IPHONE_REFUSED,
  IPHONE_SIMULATOR,
  type IphoneHost,
  type IphoneSupportResult,
  type IphoneTarget,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_DISCOVERY_REQUIRED,
  IPHONE_SIMULATOR_HOST,
  IPHONE_VERSION_REQUIRED,
  IPHONE_WDA_REQUIRED,
} from "./constants"

export function checkIphoneHostSupport(host: IphoneHost, target: IphoneTarget): IphoneSupportResult {
  if (host !== IPHONE_MACOS && target.kind === IPHONE_SIMULATOR) {
    return { kind: IPHONE_REFUSED, message: IPHONE_SIMULATOR_HOST }
  }
  if (target.kind === IPHONE_DEVICE && !target.udid) {
    return { kind: IPHONE_REFUSED, message: IPHONE_DISCOVERY_REQUIRED }
  }
  if (host !== IPHONE_MACOS && target.kind === IPHONE_DEVICE) {
    if (!target.platformVersion) {
      return { kind: IPHONE_REFUSED, message: IPHONE_VERSION_REQUIRED }
    }
    if (!target.wdaInstalled && !target.wdaUrl) {
      return { kind: IPHONE_REFUSED, message: IPHONE_WDA_REQUIRED }
    }
  }
  return { kind: IPHONE_ACCEPTED }
}
