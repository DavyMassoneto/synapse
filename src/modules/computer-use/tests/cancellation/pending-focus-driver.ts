import {
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverTool,
} from "#synapse/modules/computer-use/public/contracts"
import { ComputerCancellationDriver } from "./driver"

export class ComputerPendingFocusDriver extends ComputerCancellationDriver {
  readonly focusEntered = Promise.withResolvers<void>()

  readonly focusResponse = Promise.withResolvers<ComputerDriverCallResult>()

  override async start(): Promise<ComputerDriverTool[]> {
    this.calls.push("start")
    return [
      { name: "bring_to_front", inputProperties: [] },
      { name: "click", inputProperties: ["delivery_mode"] },
    ]
  }

  override call(
    name: string,
    argumentsValue: ComputerDriverArguments,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    if (name === "bring_to_front") {
      this.calls.push(name)
      this.focusEntered.resolve()
      return this.focusResponse.promise
    }
    return super.call(name, argumentsValue, signal)
  }
}
