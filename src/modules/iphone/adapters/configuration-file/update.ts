import { Value } from "typebox/value"
import { isIphoneHttpUrl } from "#synapse/modules/iphone/internal/configuration"
import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphoneConfigurationChange,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import * as constants from "./constants"
import { IPHONE_CONFIG_CAPABILITIES_SCHEMA } from "./schemas"
import { type IphoneStoredConfiguration } from "./types"

export function updateIphoneConfiguration(
  config: IphoneStoredConfiguration,
  changes: IphoneConfigurationChange[],
): IphoneSupportResult {
  for (const change of changes) {
    const result = applyIphoneConfigurationChange(config, change)
    if (result.kind === IPHONE_REFUSED) {
      return result
    }
  }
  return { kind: IPHONE_ACCEPTED }
}

function applyIphoneConfigurationChange(
  config: IphoneStoredConfiguration,
  change: IphoneConfigurationChange,
): IphoneSupportResult {
  const value = change.value.trim()
  if (!value) {
    return { kind: IPHONE_REFUSED, message: `${constants.IPHONE_CONFIG_UPDATE_ERROR}${change.key}` }
  }
  return dispatchIphoneConfigurationChange(config, change.key, value)
}

function dispatchIphoneConfigurationChange(
  config: IphoneStoredConfiguration,
  key: string,
  value: string,
): IphoneSupportResult {
  switch (key) {
    case constants.IPHONE_CONFIG_KEY_TARGET:
      return applyIphoneTarget(config, value)
    case constants.IPHONE_CONFIG_KEY_UDID:
    case constants.IPHONE_CONFIG_KEY_SIMULATOR:
    case constants.IPHONE_CONFIG_KEY_DEVICE_NAME:
    case constants.IPHONE_CONFIG_KEY_PLATFORM_VERSION:
    case constants.IPHONE_CONFIG_KEY_XCODE_ORG:
    case constants.IPHONE_CONFIG_KEY_XCODE_SIGNING:
    case constants.IPHONE_CONFIG_KEY_BUNDLE:
    case constants.IPHONE_CONFIG_KEY_APPIUM_HOME:
      config[key] = value
      break
    case constants.IPHONE_CONFIG_KEY_SERVER_URL:
      return applyIphoneServerUrl(config, value)
    case constants.IPHONE_CONFIG_KEY_PORT:
      return applyIphonePort(config, value)
    case constants.IPHONE_CONFIG_KEY_WDA_URL:
      return applyIphoneWdaUrl(config, value)
    case constants.IPHONE_CONFIG_KEY_WDA_INSTALLED:
      return applyIphoneWdaInstalled(config, value)
    case constants.IPHONE_CONFIG_KEY_CAPABILITIES:
      return applyIphoneCapabilities(config, value)
    default:
      return { kind: IPHONE_REFUSED, message: `${constants.IPHONE_CONFIG_UPDATE_ERROR}${key}` }
  }
  return { kind: IPHONE_ACCEPTED }
}

function applyIphoneTarget(config: IphoneStoredConfiguration, value: string): IphoneSupportResult {
  if (value !== constants.IPHONE_CONFIG_TARGET_DEVICE && value !== constants.IPHONE_CONFIG_TARGET_SIMULATOR) {
    return {
      kind: IPHONE_REFUSED,
      message: `${constants.IPHONE_CONFIG_UPDATE_ERROR}${constants.IPHONE_CONFIG_KEY_TARGET}`,
    }
  }
  config.target = value
  return { kind: IPHONE_ACCEPTED }
}

function applyIphoneServerUrl(config: IphoneStoredConfiguration, value: string): IphoneSupportResult {
  if (!isIphoneHttpUrl(value)) {
    return {
      kind: IPHONE_REFUSED,
      message: `${constants.IPHONE_CONFIG_UPDATE_ERROR}${constants.IPHONE_CONFIG_KEY_SERVER_URL}`,
    }
  }
  config.serverUrl = value
  return { kind: IPHONE_ACCEPTED }
}

function applyIphoneWdaUrl(config: IphoneStoredConfiguration, value: string): IphoneSupportResult {
  if (!isIphoneHttpUrl(value)) {
    return {
      kind: IPHONE_REFUSED,
      message: `${constants.IPHONE_CONFIG_UPDATE_ERROR}${constants.IPHONE_CONFIG_KEY_WDA_URL}`,
    }
  }
  config.wdaUrl = value
  return { kind: IPHONE_ACCEPTED }
}

function applyIphonePort(config: IphoneStoredConfiguration, value: string): IphoneSupportResult {
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > constants.IPHONE_CONFIG_MAX_PORT) {
    return {
      kind: IPHONE_REFUSED,
      message: `${constants.IPHONE_CONFIG_UPDATE_ERROR}${constants.IPHONE_CONFIG_KEY_PORT}`,
    }
  }
  config.port = port
  return { kind: IPHONE_ACCEPTED }
}

function applyIphoneWdaInstalled(config: IphoneStoredConfiguration, value: string): IphoneSupportResult {
  if (value !== constants.IPHONE_CONFIG_TRUE && value !== constants.IPHONE_CONFIG_FALSE) {
    return {
      kind: IPHONE_REFUSED,
      message: `${constants.IPHONE_CONFIG_UPDATE_ERROR}${constants.IPHONE_CONFIG_KEY_WDA_INSTALLED}`,
    }
  }
  config.wdaInstalled = value === constants.IPHONE_CONFIG_TRUE
  return { kind: IPHONE_ACCEPTED }
}

function applyIphoneCapabilities(config: IphoneStoredConfiguration, value: string): IphoneSupportResult {
  try {
    config.capabilities = Value.Parse(IPHONE_CONFIG_CAPABILITIES_SCHEMA, JSON.parse(value))
    return { kind: IPHONE_ACCEPTED }
  } catch {
    return {
      kind: IPHONE_REFUSED,
      message: `${constants.IPHONE_CONFIG_UPDATE_ERROR}${constants.IPHONE_CONFIG_KEY_CAPABILITIES}`,
    }
  }
}
