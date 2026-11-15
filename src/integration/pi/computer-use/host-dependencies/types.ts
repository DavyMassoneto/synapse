import { type Static } from "typebox"
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

export interface PiComputerConfigurationFileRead {
  kind: "configuration-file-read"
  text: string
}

export interface PiComputerConfigurationFileMissing {
  kind: "configuration-file-missing"
}

export type PiComputerConfigurationFile = PiComputerConfigurationFileRead | PiComputerConfigurationFileMissing
