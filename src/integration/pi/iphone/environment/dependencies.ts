import { join } from "node:path"
import { getAgentDir } from "@earendil-works/pi-coding-agent"
import { type IphoneModuleDependencies } from "#synapse/modules"
import {
  PI_IPHONE_CONFIG_FILE,
  PI_IPHONE_LINUX,
  PI_IPHONE_MACOS,
  PI_IPHONE_MISSING_PATH,
  PI_IPHONE_PATH_VARIABLE,
  PI_IPHONE_STATE_FOLDER,
  PI_IPHONE_UNSUPPORTED_PLATFORM,
  PI_IPHONE_WINDOWS,
} from "./constants"
import { type PiIphoneSimulatorExecution } from "./types"

export function iphoneHostDependencies(executeSimulatorCommand: PiIphoneSimulatorExecution): IphoneModuleDependencies {
  const host = process.platform
  if (host !== PI_IPHONE_MACOS && host !== PI_IPHONE_LINUX && host !== PI_IPHONE_WINDOWS) {
    throw new Error(PI_IPHONE_UNSUPPORTED_PLATFORM)
  }
  const path = process.env[PI_IPHONE_PATH_VARIABLE]
  if (!path) {
    throw new Error(PI_IPHONE_MISSING_PATH)
  }
  const directory = getAgentDir()
  return {
    host,
    path,
    configPath: join(directory, PI_IPHONE_CONFIG_FILE),
    stateDirectory: join(directory, PI_IPHONE_STATE_FOLDER),
    executeSimulatorCommand,
  }
}
