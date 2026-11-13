import { type IphoneSimulatorCommandOutput } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_SIMULATOR_TEST_EXHAUSTED } from "./constants"
import { type IphoneSimulatorTestCall, type IphoneSimulatorTestCommandResult } from "./types"

export class IphoneSimulatorCommandDouble {
  readonly calls: IphoneSimulatorTestCall[] = []

  private readonly results: IphoneSimulatorTestCommandResult[]

  constructor(results: IphoneSimulatorTestCommandResult[]) {
    this.results = results
  }

  execute(command: string, argumentsValue: string[]): Promise<IphoneSimulatorCommandOutput> {
    this.calls.push({ command, arguments: argumentsValue })
    const result = this.results.shift()
    if (!result) {
      return Promise.reject(new Error(IPHONE_SIMULATOR_TEST_EXHAUSTED))
    }
    if (result instanceof Error) {
      return Promise.reject(result)
    }
    return Promise.resolve(result)
  }
}
