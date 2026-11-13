import { type IphoneSimulatorCommandOutput } from "#synapse/modules/iphone/public/contracts"
import { IphoneSimulatorCommandDouble } from "./command-double"
import { type IphoneSimulatorTestCommandResult, type IphoneSimulatorTestSut } from "./types"

export function simulatorOutput(stdout: string): IphoneSimulatorCommandOutput {
  return { stdout, stderr: "" }
}

export function makeSimulatorSut(results: IphoneSimulatorTestCommandResult[]): IphoneSimulatorTestSut {
  const executor = new IphoneSimulatorCommandDouble(results)
  return { executor, run: executor.execute.bind(executor) }
}
