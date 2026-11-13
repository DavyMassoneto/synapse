import { type IphoneSimulatorExecutor } from "#synapse/modules/iphone/adapters/simulator-discovery"
import { type IphoneSimulatorCommandOutput } from "#synapse/modules/iphone/public/contracts"

export type IphoneSimulatorTestCommandResult = IphoneSimulatorCommandOutput | Error

export interface IphoneSimulatorTestCall {
  command: string
  arguments: string[]
}

export interface IphoneSimulatorTestRecorder {
  calls: IphoneSimulatorTestCall[]
}

export interface IphoneSimulatorTestSut {
  executor: IphoneSimulatorTestRecorder
  run: IphoneSimulatorExecutor
}
