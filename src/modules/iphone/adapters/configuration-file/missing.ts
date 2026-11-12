import { IPHONE_DEVICE } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_CONFIG_KEY_DEVICE_NAME,
  IPHONE_CONFIG_KEY_SERVER_URL,
  IPHONE_CONFIG_KEY_TARGET,
  IPHONE_CONFIG_KEY_UDID,
  IPHONE_CONFIG_KEY_WDA_INSTALLED,
} from "./constants"
import { type IphoneStoredConfiguration } from "./types"

export function missingIphoneConfigurationFields(config: IphoneStoredConfiguration): string[] {
  const missing: string[] = []
  if (!config.serverUrl) {
    missing.push(IPHONE_CONFIG_KEY_SERVER_URL)
  }
  if (!config.target) {
    missing.push(IPHONE_CONFIG_KEY_TARGET)
  }
  if (!config.deviceName) {
    missing.push(IPHONE_CONFIG_KEY_DEVICE_NAME)
  }
  if (typeof config.wdaInstalled !== "boolean") {
    missing.push(IPHONE_CONFIG_KEY_WDA_INSTALLED)
  }
  if (config.target === IPHONE_DEVICE && !config.udid) {
    missing.push(IPHONE_CONFIG_KEY_UDID)
  }
  return missing
}
