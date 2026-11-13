import { readFileSync } from "node:fs"
import { join } from "node:path"
import { Value } from "typebox/value"
import {
  PI_COMPUTER_CONFIGURATION_ERROR_CODE_PROPERTY,
  PI_COMPUTER_CONFIGURATION_MISSING_CODE,
  PI_COMPUTER_DRIVER_CONFIGURATION_FILE,
  PI_COMPUTER_LAUNCH_CONFIGURED,
  PI_COMPUTER_LAUNCH_UNCONFIGURED,
} from "./constants"
import { PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA } from "./schemas"
import { type PiComputerLaunchConfigurationResult } from "./types"

export function computerReadLaunchConfiguration(directory: string): PiComputerLaunchConfigurationResult {
  let text: string
  try {
    text = new TextDecoder().decode(readFileSync(join(directory, PI_COMPUTER_DRIVER_CONFIGURATION_FILE)))
  } catch (error) {
    if (
      error instanceof Error &&
      PI_COMPUTER_CONFIGURATION_ERROR_CODE_PROPERTY in error &&
      error.code === PI_COMPUTER_CONFIGURATION_MISSING_CODE
    ) {
      return { kind: PI_COMPUTER_LAUNCH_UNCONFIGURED }
    }
    throw error
  }
  const configuration = Value.Parse(PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA, JSON.parse(text))
  return { kind: PI_COMPUTER_LAUNCH_CONFIGURED, configuration }
}
