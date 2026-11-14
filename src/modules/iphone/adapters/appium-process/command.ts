import { type IphoneHost } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_APPIUM_ARGUMENT_SEPARATOR,
  IPHONE_APPIUM_NODE_SCRIPT_EXTENSION,
  IPHONE_APPIUM_WINDOWS_PERCENT,
  IPHONE_APPIUM_WINDOWS_PERCENT_MESSAGE,
  IPHONE_APPIUM_WINDOWS_QUOTE,
  IPHONE_APPIUM_WINDOWS_QUOTE_PATTERN,
  IPHONE_APPIUM_WINDOWS_QUOTED_QUOTE,
  IPHONE_APPIUM_WINDOWS_SHELL,
  IPHONE_APPIUM_WINDOWS_SHELL_ARGUMENTS,
} from "./constants"
import { isWindowsShellScript } from "./predicates"
import { type IphoneAppiumSpawnCommand } from "./types"

export function iphoneAppiumLaunchCommand(
  executable: string,
  argumentsValue: string[],
  host: IphoneHost,
): IphoneAppiumSpawnCommand {
  if (executable.endsWith(IPHONE_APPIUM_NODE_SCRIPT_EXTENSION)) {
    return { command: process.execPath, arguments: [executable, ...argumentsValue] }
  }
  return iphoneAppiumCommand(executable, argumentsValue, host)
}

export function iphoneAppiumCommand(
  executable: string,
  argumentsValue: string[],
  host: IphoneHost,
): IphoneAppiumSpawnCommand {
  if (!isWindowsShellScript(executable, host)) {
    return { command: executable, arguments: argumentsValue }
  }
  if ([executable, ...argumentsValue].some((token) => token.includes(IPHONE_APPIUM_WINDOWS_PERCENT))) {
    throw new Error(IPHONE_APPIUM_WINDOWS_PERCENT_MESSAGE)
  }
  return {
    command: IPHONE_APPIUM_WINDOWS_SHELL,
    arguments: [...IPHONE_APPIUM_WINDOWS_SHELL_ARGUMENTS, windowsShellCommand(executable, argumentsValue)],
  }
}

function windowsShellCommand(executable: string, argumentsValue: string[]): string {
  const tokens = [executable, ...argumentsValue].map(windowsQuoted)
  return `${IPHONE_APPIUM_WINDOWS_QUOTE}${tokens.join(IPHONE_APPIUM_ARGUMENT_SEPARATOR)}${IPHONE_APPIUM_WINDOWS_QUOTE}`
}

function windowsQuoted(value: string): string {
  const escaped = value.replace(IPHONE_APPIUM_WINDOWS_QUOTE_PATTERN, IPHONE_APPIUM_WINDOWS_QUOTED_QUOTE)
  return `${IPHONE_APPIUM_WINDOWS_QUOTE}${escaped}${IPHONE_APPIUM_WINDOWS_QUOTE}`
}
