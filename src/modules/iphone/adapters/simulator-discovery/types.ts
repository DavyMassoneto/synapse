import { type Static } from "typebox"
import {
  type IPHONE_ACCEPTED,
  type IphoneRefused,
  type IphoneSimulatorCommandOutput,
} from "#synapse/modules/iphone/public/contracts"
import {
  type IPHONE_SIMULATOR_COMMAND_ERROR,
  type IPHONE_SIMULATOR_COMMAND_SUCCEEDED,
  type IPHONE_SIMULATOR_OUTPUT_INVALID,
  type IPHONE_SIMULATOR_OUTPUT_VALID,
} from "./constants"
import { type IPHONE_SIMULATOR_DEVICE_SCHEMA } from "./schemas"

export type { IphoneSimulatorCommandOutput } from "#synapse/modules/iphone/public/contracts"

export type IphoneSimulatorDevice = Static<typeof IPHONE_SIMULATOR_DEVICE_SCHEMA>

export type IphoneSimulatorExecutor = (
  command: string,
  argumentsValue: string[],
) => Promise<IphoneSimulatorCommandOutput>

export interface IphoneSimulatorCommandSucceeded {
  kind: typeof IPHONE_SIMULATOR_COMMAND_SUCCEEDED
  output: IphoneSimulatorCommandOutput
}

export interface IphoneSimulatorCommandError {
  kind: typeof IPHONE_SIMULATOR_COMMAND_ERROR
  message: string
}

export type IphoneSimulatorCommandResult = IphoneSimulatorCommandSucceeded | IphoneSimulatorCommandError

export interface IphoneSimulatorOutputValid {
  kind: typeof IPHONE_SIMULATOR_OUTPUT_VALID
  runtimes: IphoneSimulatorDevice[][]
}

export interface IphoneSimulatorOutputInvalid {
  kind: typeof IPHONE_SIMULATOR_OUTPUT_INVALID
}

export type IphoneSimulatorOutput = IphoneSimulatorOutputValid | IphoneSimulatorOutputInvalid

export interface IphoneBootedSimulator {
  udid: string
  name: string
}

export interface IphoneSimulatorList {
  kind: typeof IPHONE_ACCEPTED
  simulators: IphoneBootedSimulator[]
}

export type IphoneSimulatorDiscoveryResult = IphoneSimulatorList | IphoneRefused
