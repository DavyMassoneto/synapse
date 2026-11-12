import { type Static } from "typebox"
import {
  type PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA,
  type PI_COMPUTER_LAUNCH_CONFIGURED,
  type PI_COMPUTER_LAUNCH_UNCONFIGURED,
} from "./constants"

export type PiComputerLaunchConfiguration = Static<typeof PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA>

export interface PiComputerConfiguredLaunch {
  kind: typeof PI_COMPUTER_LAUNCH_CONFIGURED
  configuration: PiComputerLaunchConfiguration
}

export interface PiComputerUnconfiguredLaunch {
  kind: typeof PI_COMPUTER_LAUNCH_UNCONFIGURED
}

export type PiComputerLaunchConfigurationResult = PiComputerConfiguredLaunch | PiComputerUnconfiguredLaunch
