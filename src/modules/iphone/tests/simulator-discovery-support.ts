import { type IphoneSimulatorCommandOutput } from "#synapse/modules/iphone/adapters/simulator-discovery"
import { type IphoneSimulatorCall, type IphoneSimulatorCommandResult } from "./types"

export const IPHONE_SIMULATOR_TEST_EXHAUSTED = "O dublê de comandos não tem resposta para esta chamada."

export class IphoneSimulatorCommandDouble {
  readonly calls: IphoneSimulatorCall[] = []

  private readonly results: IphoneSimulatorCommandResult[]

  constructor(results: IphoneSimulatorCommandResult[]) {
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
