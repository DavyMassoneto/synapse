import { accessSync, constants, existsSync } from "node:fs"
import { extname } from "node:path"
import { type IphoneHost } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_APPIUM_UNUSABLE_CODES,
  IPHONE_APPIUM_WINDOWS,
  IPHONE_APPIUM_WINDOWS_SCRIPT_EXTENSIONS,
} from "./constants"

export function isWindowsShellScript(executable: string, host: IphoneHost): boolean {
  return host === IPHONE_APPIUM_WINDOWS && IPHONE_APPIUM_WINDOWS_SCRIPT_EXTENSIONS.includes(extname(executable))
}

export function isUnusableAppiumPath(error: Error): boolean {
  return "code" in error && IPHONE_APPIUM_UNUSABLE_CODES.includes(String(error.code))
}

export function isExecutableAppium(candidate: string): boolean {
  if (!existsSync(candidate)) {
    return false
  }
  try {
    accessSync(candidate, constants.X_OK)
    return true
  } catch (error) {
    if (error instanceof Error && isUnusableAppiumPath(error)) {
      return false
    }
    throw error
  }
}
