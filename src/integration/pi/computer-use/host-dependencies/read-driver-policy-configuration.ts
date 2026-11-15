import { Value } from "typebox/value"
import { COMPUTER_DRIVER_POLICY_SCHEMA, type ComputerDriverPolicy } from "#synapse/modules/computer-use"
import {
  PI_COMPUTER_CONFIGURATION_FILE_MISSING,
  PI_COMPUTER_DRIVER_POLICY_CONFIGURATION_FILE,
  PI_COMPUTER_DRIVER_POLICY_CONFIGURED,
  PI_COMPUTER_DRIVER_POLICY_UNCONFIGURED,
} from "./constants"
import { computerReadConfigurationFile } from "./read-configuration-file"
import { type PiComputerDriverPolicyConfigurationResult } from "./types"

export function computerReadDriverPolicyConfiguration(directory: string): PiComputerDriverPolicyConfigurationResult {
  const file = computerReadConfigurationFile(directory, PI_COMPUTER_DRIVER_POLICY_CONFIGURATION_FILE)
  if (file.kind === PI_COMPUTER_CONFIGURATION_FILE_MISSING) {
    return { kind: PI_COMPUTER_DRIVER_POLICY_UNCONFIGURED }
  }
  const policy: ComputerDriverPolicy = Value.Parse(COMPUTER_DRIVER_POLICY_SCHEMA, JSON.parse(file.text))
  return { kind: PI_COMPUTER_DRIVER_POLICY_CONFIGURED, policy }
}
