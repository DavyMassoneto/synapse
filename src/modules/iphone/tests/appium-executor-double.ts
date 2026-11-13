import { type IphoneAppiumCommandOutput } from "#synapse/modules/iphone/adapters/appium-process"
import { type IphoneAppiumExecutorCall } from "./types"

export class IphoneAppiumExecutorDouble {
  readonly calls: IphoneAppiumExecutorCall[] = []

  execute(command: string, argumentsValue: string[]): Promise<IphoneAppiumCommandOutput> {
    this.calls.push({ command, arguments: argumentsValue })
    return Promise.resolve({ stdout: "", stderr: "" })
  }
}
