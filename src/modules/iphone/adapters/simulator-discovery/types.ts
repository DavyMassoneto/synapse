import { type IphoneRefused, type IphoneSimulatorCommandOutput } from "#synapse/modules/iphone/public/contracts"

export type IphoneSimulatorExecutor = (
  command: string,
  argumentsValue: string[],
) => Promise<IphoneSimulatorCommandOutput>

export interface IphoneSimulatorCommandSucceeded {
  kind: "command-succeeded"
  output: IphoneSimulatorCommandOutput
}

export interface IphoneSimulatorCommandError {
  kind: "command-error"
  message: string
}

export type IphoneSimulatorCommandResult = IphoneSimulatorCommandSucceeded | IphoneSimulatorCommandError

export interface IphoneBootedSimulator {
  udid: string
  name: string
}

export interface IphoneSimulatorList {
  kind: "accepted"
  simulators: IphoneBootedSimulator[]
}

export type IphoneSimulatorDiscoveryResult = IphoneSimulatorList | IphoneRefused
