import {
  COMPUTER_DRIVER_MAX_ELEMENTS_PROPERTY,
  COMPUTER_DRIVER_TREE_FORMAT_PROPERTY,
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverTool,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_DISPATCH_WINDOW_STATE } from "../internal"
import { ComputerResultsDriver } from "./results"

export class ComputerCapabilityDriver extends ComputerResultsDriver {
  readonly windowStateCalls: ComputerDriverArguments[] = []

  start(): Promise<ComputerDriverTool[]> {
    return Promise.resolve([
      {
        name: COMPUTER_DISPATCH_WINDOW_STATE,
        inputProperties: [COMPUTER_DRIVER_TREE_FORMAT_PROPERTY, COMPUTER_DRIVER_MAX_ELEMENTS_PROPERTY],
      },
    ])
  }

  call(name: string, argumentsValue: ComputerDriverArguments): Promise<ComputerDriverCallResult> {
    if (name === COMPUTER_DISPATCH_WINDOW_STATE) {
      this.windowStateCalls.push(argumentsValue)
    }
    return super.call(name, argumentsValue)
  }
}
