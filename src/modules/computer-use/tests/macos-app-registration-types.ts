import {
  type ComputerCommandOutput,
  type ComputerCommandRunner,
} from "#synapse/modules/computer-use/adapters/command-execution"

export type ComputerCommandTestResult = ComputerCommandOutput | Error

export interface ComputerCommandCall {
  command: string
  arguments: string[]
}

export interface ComputerCommandRecorder {
  calls: ComputerCommandCall[]
}

export interface ComputerAppRegistrationSut {
  appDirectory: string
  executor: ComputerCommandRecorder
  commandExecutor: ComputerCommandRunner
}
