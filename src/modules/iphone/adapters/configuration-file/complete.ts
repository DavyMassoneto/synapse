import { validateIphoneConfiguration } from "#synapse/modules/iphone/internal/configuration"
import { IPHONE_REFUSED, type IphoneConfiguration, type IphoneHost } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_CONFIG_COMPLETE_REQUIRED, IPHONE_CONFIG_INVALID, IPHONE_CONFIG_LOADED } from "./constants"
import { readIphoneConfiguration } from "./read"

export function loadIphoneCompleteConfiguration(path: string, host: IphoneHost): IphoneConfiguration {
  const result = readIphoneConfiguration(path)
  if (result.kind === IPHONE_CONFIG_INVALID) {
    throw new Error(result.message)
  }
  if (result.kind !== IPHONE_CONFIG_LOADED) {
    throw new Error(IPHONE_CONFIG_COMPLETE_REQUIRED)
  }
  const validation = validateIphoneConfiguration(result.config, host)
  if (validation.kind === IPHONE_REFUSED) {
    throw new Error(validation.message)
  }
  return result.config
}
