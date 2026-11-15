import { Value } from "typebox/value"
import {
  PI_COMPUTER_CONFIGURATION_FILE_MISSING,
  PI_COMPUTER_DRIVER_CONFIGURATION_FILE,
  PI_COMPUTER_LAUNCH_CONFIGURED,
  PI_COMPUTER_LAUNCH_UNCONFIGURED,
} from "./constants"
import { computerReadConfigurationFile } from "./read-configuration-file"
import { PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA } from "./schemas"
import { type PiComputerLaunchConfigurationResult } from "./types"

export function computerReadLaunchConfiguration(directory: string): PiComputerLaunchConfigurationResult {
  const file = computerReadConfigurationFile(directory, PI_COMPUTER_DRIVER_CONFIGURATION_FILE)
  if (file.kind === PI_COMPUTER_CONFIGURATION_FILE_MISSING) {
    return { kind: PI_COMPUTER_LAUNCH_UNCONFIGURED }
  }
  const configuration = Value.Parse(PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA, JSON.parse(file.text))
  return { kind: PI_COMPUTER_LAUNCH_CONFIGURED, configuration }
}
