import { Value } from "typebox/value"
import {
  PI_COMPUTER_CONFIGURATION_FILE_MISSING,
  PI_COMPUTER_UNITY_BRIDGE_CONFIGURATION_FILE,
  PI_COMPUTER_UNITY_BRIDGE_CONFIGURED,
  PI_COMPUTER_UNITY_BRIDGE_UNCONFIGURED,
} from "./constants"
import { computerReadConfigurationFile } from "./read-configuration-file"
import { PI_COMPUTER_UNITY_BRIDGE_CONFIGURATION_SCHEMA } from "./schemas"
import { type PiComputerUnityBridgeConfigurationResult } from "./types"

export function computerReadUnityBridgeConfiguration(directory: string): PiComputerUnityBridgeConfigurationResult {
  const file = computerReadConfigurationFile(directory, PI_COMPUTER_UNITY_BRIDGE_CONFIGURATION_FILE)
  if (file.kind === PI_COMPUTER_CONFIGURATION_FILE_MISSING) {
    return { kind: PI_COMPUTER_UNITY_BRIDGE_UNCONFIGURED }
  }
  const configuration = Value.Parse(PI_COMPUTER_UNITY_BRIDGE_CONFIGURATION_SCHEMA, JSON.parse(file.text))
  return { kind: PI_COMPUTER_UNITY_BRIDGE_CONFIGURED, configuration }
}
