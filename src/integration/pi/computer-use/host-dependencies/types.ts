import { type Static } from "typebox"
import { type PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA } from "./schemas"

export type PiComputerLaunchConfiguration = Static<typeof PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA>

export interface PiComputerConfiguredLaunch {
  kind: "launch-configured"
  configuration: PiComputerLaunchConfiguration
}

export interface PiComputerUnconfiguredLaunch {
  kind: "launch-unconfigured"
}

export type PiComputerLaunchConfigurationResult = PiComputerConfiguredLaunch | PiComputerUnconfiguredLaunch
