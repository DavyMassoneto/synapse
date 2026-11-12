import {
  type IphoneAppiumCommandOutput,
  type IphoneAppiumProcess,
} from "#synapse/modules/iphone/adapters/appium-process"
import {
  type IphoneSimulatorCommandOutput,
  type IphoneSimulatorExecutor,
} from "#synapse/modules/iphone/adapters/simulator-discovery"
import { type IphoneSessionQueue } from "#synapse/modules/iphone/internal/session-lifecycle"
import { type IphoneHost } from "#synapse/modules/iphone/public/contracts"
import { type IphoneSessionDouble, type TestIphoneFactory } from "./doubles"

export type IphoneConfigurationTestScenario = (directory: string) => void

export interface IphoneSessionTestSut {
  factory: TestIphoneFactory
  queue: IphoneSessionQueue<IphoneSessionDouble>
}

export type IphoneSimulatorCommandResult = IphoneSimulatorCommandOutput | Error

export interface IphoneSimulatorCall {
  command: string
  arguments: string[]
}

export interface IphoneSimulatorCommandRecorder {
  calls: IphoneSimulatorCall[]
}

export interface IphoneSimulatorDiscoverySut {
  executor: IphoneSimulatorCommandRecorder
  run: IphoneSimulatorExecutor
}

export interface IphoneAppiumExecutorCall {
  command: string
  arguments: string[]
}

export interface IphoneAppiumExecutorRecorder {
  calls: IphoneAppiumExecutorCall[]
  execute(command: string, argumentsValue: string[]): Promise<IphoneAppiumCommandOutput>
}

export interface IphoneAppiumProcessSut {
  appium: IphoneAppiumProcess
  directory: string
  stateDirectory: string
  binDirectory: string
  port: number
  host: IphoneHost
}
