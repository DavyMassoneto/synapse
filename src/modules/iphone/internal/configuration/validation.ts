import { checkIphoneHostSupport } from "#synapse/modules/iphone/internal/host-support"
import { validateIphoneWdaEndpoint } from "#synapse/modules/iphone/internal/wda-endpoint"
import {
  IPHONE_MACOS,
  IPHONE_REFUSED,
  IPHONE_SIMULATOR,
  type IphoneConfiguration,
  type IphoneHost,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_DEVICE_NAME_REQUIRED,
  IPHONE_SERVER_URL_REQUIRED,
  IPHONE_SIMULATOR_UDID_REQUIRED,
  IPHONE_WDA_URL_INVALID,
} from "./constants"

import { isIphoneHttpUrl } from "./predicates"

export function validateIphoneConfiguration(config: IphoneConfiguration, host: IphoneHost): IphoneSupportResult {
  if (!isIphoneHttpUrl(config.serverUrl)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_SERVER_URL_REQUIRED }
  }
  if (!config.target.deviceName.trim()) {
    return { kind: IPHONE_REFUSED, message: IPHONE_DEVICE_NAME_REQUIRED }
  }
  const support = checkIphoneHostSupport(host, config.target)
  if (support.kind === IPHONE_REFUSED) {
    return support
  }
  if (config.target.kind === IPHONE_SIMULATOR && !config.target.udid && host !== IPHONE_MACOS) {
    return { kind: IPHONE_REFUSED, message: IPHONE_SIMULATOR_UDID_REQUIRED }
  }
  if (config.target.wdaUrl && !isIphoneHttpUrl(config.target.wdaUrl)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_WDA_URL_INVALID }
  }
  return validateIphoneWdaEndpoint(config)
}
