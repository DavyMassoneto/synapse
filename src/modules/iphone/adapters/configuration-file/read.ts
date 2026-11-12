import { Value } from "typebox/value"
import {
  IPHONE_DEVICE,
  IPHONE_SIMULATOR,
  type IphoneConfiguration,
  type IphoneTarget,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_COMPLETE_STORED_SCHEMA,
  IPHONE_CONFIG_INVALID,
  IPHONE_CONFIG_LOADED,
  IPHONE_CONFIG_MISSING,
  IPHONE_CONFIG_REQUIRED,
  IPHONE_CONFIG_TRAILING_SLASH,
} from "./constants"
import { missingIphoneConfigurationFields } from "./missing"
import { readIphoneStoredConfiguration } from "./stored"
import {
  type IphoneCompleteStoredConfiguration,
  type IphoneConfigReadResult,
  type IphoneSimulatorIdentifier,
  type IphoneStoredConfiguration,
} from "./types"

export function readIphoneConfiguration(path: string): IphoneConfigReadResult {
  const loaded = readIphoneStoredConfiguration(path)
  if (loaded.kind === IPHONE_CONFIG_MISSING) {
    return loaded
  }
  if (loaded.kind === IPHONE_CONFIG_INVALID) {
    return loaded
  }
  const stored = loaded.config
  if (!Value.Check(IPHONE_COMPLETE_STORED_SCHEMA, stored)) {
    return {
      kind: IPHONE_CONFIG_INVALID,
      message: `${IPHONE_CONFIG_REQUIRED}${missingIphoneConfigurationFields(stored).join(", ")}`,
    }
  }
  return buildIphoneConfiguration(stored)
}

function buildIphoneConfiguration(stored: IphoneCompleteStoredConfiguration): IphoneConfigReadResult {
  const target = buildIphoneTarget(stored)
  const config: IphoneConfiguration = { serverUrl: iphoneServerUrl(stored), target }
  if (stored.platformVersion) {
    config.target.platformVersion = stored.platformVersion
  }
  if (stored.wdaUrl) {
    config.target.wdaUrl = stored.wdaUrl
  }
  applyIphoneOptionalConfiguration(config, stored)
  return { kind: IPHONE_CONFIG_LOADED, config }
}

function buildIphoneTarget(stored: IphoneCompleteStoredConfiguration): IphoneTarget {
  if (stored.target === IPHONE_DEVICE) {
    return { kind: IPHONE_DEVICE, udid: stored.udid, deviceName: stored.deviceName, wdaInstalled: stored.wdaInstalled }
  }
  return {
    kind: IPHONE_SIMULATOR,
    deviceName: stored.deviceName,
    wdaInstalled: stored.wdaInstalled,
    ...simulatorIphoneIdentifier(stored),
  }
}

function iphoneServerUrl(stored: IphoneCompleteStoredConfiguration): string {
  if (stored.port) {
    const url = new URL(stored.serverUrl)
    url.port = String(stored.port)
    return url.toString().replace(IPHONE_CONFIG_TRAILING_SLASH, "")
  }
  return stored.serverUrl
}

function simulatorIphoneIdentifier(stored: IphoneCompleteStoredConfiguration): IphoneSimulatorIdentifier {
  if (stored.target === IPHONE_SIMULATOR) {
    if (stored.simulator) {
      return { udid: stored.simulator }
    }
    if (stored.udid) {
      return { udid: stored.udid }
    }
  }
  return {}
}

function applyIphoneOptionalConfiguration(config: IphoneConfiguration, stored: IphoneStoredConfiguration): void {
  if (stored.xcodeOrgId) {
    config.xcodeOrgId = stored.xcodeOrgId
  }
  if (stored.xcodeSigningId) {
    config.xcodeSigningId = stored.xcodeSigningId
  }
  if (stored.updatedWDABundleId) {
    config.updatedWDABundleId = stored.updatedWDABundleId
  }
  if (stored.appiumHome) {
    config.appiumHome = stored.appiumHome
  }
  if (stored.capabilities) {
    config.capabilities = stored.capabilities
  }
}
