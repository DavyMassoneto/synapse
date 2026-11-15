import { type Static } from "typebox"
import { type ComputerDriverPolicy } from "#synapse/modules/computer-use"
import {
  type PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA,
  type PI_COMPUTER_UNITY_BRIDGE_CONFIGURATION_SCHEMA,
} from "./schemas"

export type PiComputerLaunchConfiguration = Static<typeof PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA>

export interface PiComputerConfiguredLaunch {
  kind: "launch-configured"
  configuration: PiComputerLaunchConfiguration
}

export interface PiComputerUnconfiguredLaunch {
  kind: "launch-unconfigured"
}

export type PiComputerLaunchConfigurationResult = PiComputerConfiguredLaunch | PiComputerUnconfiguredLaunch

export type PiComputerUnityBridgeConfiguration = Static<typeof PI_COMPUTER_UNITY_BRIDGE_CONFIGURATION_SCHEMA>

export interface PiComputerConfiguredUnityBridge {
  kind: "unity-bridge-configured"
  configuration: PiComputerUnityBridgeConfiguration
}

export interface PiComputerUnconfiguredUnityBridge {
  kind: "unity-bridge-unconfigured"
}

export type PiComputerUnityBridgeConfigurationResult =
  | PiComputerConfiguredUnityBridge
  | PiComputerUnconfiguredUnityBridge

export interface PiComputerConfiguredDriverPolicy {
  kind: "driver-policy-configured"
  policy: ComputerDriverPolicy
}

export interface PiComputerUnconfiguredDriverPolicy {
  kind: "driver-policy-unconfigured"
}

export type PiComputerDriverPolicyConfigurationResult =
  | PiComputerConfiguredDriverPolicy
  | PiComputerUnconfiguredDriverPolicy

export interface PiComputerConfigurationFileRead {
  kind: "configuration-file-read"
  text: string
}

export interface PiComputerConfigurationFileMissing {
  kind: "configuration-file-missing"
}

export type PiComputerConfigurationFile = PiComputerConfigurationFileRead | PiComputerConfigurationFileMissing
