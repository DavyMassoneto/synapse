import { type ComputerCommandOutput } from "#synapse/modules/computer-use/adapters/command-execution"
import { COMPUTER_COMMAND_DOUBLE_EXHAUSTED } from "./macos-app-registration-constants"
import { type ComputerCommandCall, type ComputerCommandTestResult } from "./macos-app-registration-types"

export class ComputerCommandDouble {
  readonly calls: ComputerCommandCall[] = []

  private readonly results: ComputerCommandTestResult[]

  constructor(results: ComputerCommandTestResult[]) {
    this.results = results
  }

  execute(command: string, argumentsValue: string[]): Promise<ComputerCommandOutput> {
    this.calls.push({ command, arguments: argumentsValue })
    const result = this.results.shift()
    if (!result) {
      return Promise.reject(new Error(COMPUTER_COMMAND_DOUBLE_EXHAUSTED))
    }
    if (result instanceof Error) {
      return Promise.reject(result)
    }
    return Promise.resolve(result)
  }
}
