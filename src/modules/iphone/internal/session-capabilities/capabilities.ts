import { IPHONE_WDA_BINDING_IP, isIphoneLocalSimulatorWda } from "#synapse/modules/iphone/internal/wda-endpoint"
import {
  IPHONE_DEVICE,
  IPHONE_MACOS,
  type IphoneConfiguration,
  type IphoneHost,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_AUTOMATION_NAME,
  IPHONE_COMMAND_TIMEOUT_SECONDS,
  IPHONE_PLATFORM_NAME,
  IPHONE_WDA_TIMEOUT_MS,
} from "./constants"
import { type IphoneCapabilities } from "./types"

export function buildIphoneCapabilities(config: IphoneConfiguration, host: IphoneHost): IphoneCapabilities {
  const target = config.target
  const caps: IphoneCapabilities = {
    platformName: IPHONE_PLATFORM_NAME,
    "appium:automationName": IPHONE_AUTOMATION_NAME,
    "appium:newCommandTimeout": IPHONE_COMMAND_TIMEOUT_SECONDS,
    "appium:noReset": true,
    "appium:wdaLaunchTimeout": IPHONE_WDA_TIMEOUT_MS,
    "appium:wdaConnectionTimeout": IPHONE_WDA_TIMEOUT_MS,
    "appium:useNewWDA": false,
    "appium:deviceName": target.deviceName,
  }
  if (target.udid) {
    caps["appium:udid"] = target.udid
  }
  if (target.platformVersion) {
    caps["appium:platformVersion"] = target.platformVersion
  }
  if (target.wdaUrl) {
    caps["appium:webDriverAgentUrl"] = target.wdaUrl
  }
  if (target.wdaInstalled) {
    caps["appium:usePreinstalledWDA"] = true
  }
  applyIphoneCapabilityOverrides(caps, config)
  if (isIphoneLocalSimulatorWda(config)) {
    caps["appium:wdaBindingIP"] = IPHONE_WDA_BINDING_IP
  }
  if (host === IPHONE_MACOS && target.kind === IPHONE_DEVICE) {
    if (config.xcodeOrgId) {
      caps["appium:xcodeOrgId"] = config.xcodeOrgId
    }
    if (config.xcodeSigningId) {
      caps["appium:xcodeSigningId"] = config.xcodeSigningId
    }
    if (config.updatedWDABundleId) {
      caps["appium:updatedWDABundleId"] = config.updatedWDABundleId
    }
    caps["appium:allowProvisioningDeviceRegistration"] = true
  }
  return caps
}

function applyIphoneCapabilityOverrides(caps: IphoneCapabilities, config: IphoneConfiguration): void {
  if (config.capabilities) {
    const overrides = config.capabilities
    if (typeof overrides.noReset === "boolean") {
      caps["appium:noReset"] = overrides.noReset
    }
    if (overrides.newCommandTimeout) {
      caps["appium:newCommandTimeout"] = overrides.newCommandTimeout
    }
    if (overrides.wdaLaunchTimeout) {
      caps["appium:wdaLaunchTimeout"] = overrides.wdaLaunchTimeout
    }
    if (overrides.wdaConnectionTimeout) {
      caps["appium:wdaConnectionTimeout"] = overrides.wdaConnectionTimeout
    }
    if (overrides.wdaLocalPort) {
      caps["appium:wdaLocalPort"] = overrides.wdaLocalPort
    }
    if (typeof overrides.useNewWDA === "boolean") {
      caps["appium:useNewWDA"] = overrides.useNewWDA
    }
  }
}
