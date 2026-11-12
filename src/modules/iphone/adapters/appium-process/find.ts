import { delimiter, join } from "node:path"
import { type IphoneHost } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_APPIUM_NAME,
  IPHONE_APPIUM_NOT_FOUND,
  IPHONE_APPIUM_WINDOWS,
  IPHONE_APPIUM_WINDOWS_EXTENSIONS,
} from "./constants"
import { isExecutableAppium } from "./predicates"

export function findIphoneAppium(path: string, host: IphoneHost): string {
  const names =
    host === IPHONE_APPIUM_WINDOWS
      ? IPHONE_APPIUM_WINDOWS_EXTENSIONS.map((extension) => `${IPHONE_APPIUM_NAME}${extension}`)
      : [IPHONE_APPIUM_NAME]
  const candidates = path.split(delimiter).flatMap((directory) => names.map((name) => join(directory, name)))
  const found = candidates.find(isExecutableAppium)
  if (!found) {
    throw new Error(IPHONE_APPIUM_NOT_FOUND)
  }
  return found
}
