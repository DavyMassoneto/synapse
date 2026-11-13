export interface IphoneCapabilities {
  platformName: string
  "appium:automationName": string
  "appium:newCommandTimeout": number
  "appium:noReset": boolean
  "appium:wdaLaunchTimeout": number
  "appium:wdaConnectionTimeout": number
  "appium:useNewWDA": boolean
  "appium:deviceName": string
  "appium:udid"?: string
  "appium:platformVersion"?: string
  "appium:webDriverAgentUrl"?: string
  "appium:usePreinstalledWDA"?: boolean
  "appium:xcodeOrgId"?: string
  "appium:xcodeSigningId"?: string
  "appium:updatedWDABundleId"?: string
  "appium:allowProvisioningDeviceRegistration"?: boolean
}
