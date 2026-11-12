import { type IphoneConfigurationView } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_CONFIG_INVALID, IPHONE_CONFIG_LOADED } from "./constants"
import { missingIphoneConfigurationFields } from "./missing"
import { readIphoneStoredConfiguration } from "./stored"

export function readIphoneConfigurationView(path: string): IphoneConfigurationView {
  const result = readIphoneStoredConfiguration(path)
  if (result.kind === IPHONE_CONFIG_INVALID) {
    throw new Error(result.message)
  }
  if (result.kind === IPHONE_CONFIG_LOADED) {
    return { ...result.config, missing: missingIphoneConfigurationFields(result.config) }
  }
  return { missing: missingIphoneConfigurationFields({}) }
}
