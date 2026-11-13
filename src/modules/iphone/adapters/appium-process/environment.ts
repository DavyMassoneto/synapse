import { IPHONE_APPIUM_HOME_VARIABLE } from "./constants"

export function iphoneAppiumEnvironment(appiumHome?: string): NodeJS.ProcessEnv {
  if (!appiumHome) {
    return process.env
  }
  return { ...process.env, [IPHONE_APPIUM_HOME_VARIABLE]: appiumHome }
}
