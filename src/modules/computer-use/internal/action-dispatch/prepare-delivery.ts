import { COMPUTER_FOREGROUND, type ComputerDriverTool } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DISPATCH_DELIVERY_PROPERTY,
  COMPUTER_DISPATCH_DRIVER_DELIVERY_PROPERTY,
  COMPUTER_DISPATCH_UNSUPPORTED_FOREGROUND,
} from "./constants"
import { type ComputerDispatchPreparedInput, type ComputerInputAction } from "./types"

export function computerPrepareDelivery(
  action: ComputerInputAction,
  prepared: ComputerDispatchPreparedInput,
  tools: ComputerDriverTool[],
): void {
  if (COMPUTER_DISPATCH_DELIVERY_PROPERTY in action && action.deliveryMode === COMPUTER_FOREGROUND) {
    const tool = tools.find((tool) => tool.name === prepared.tool)
    if (!tool?.inputProperties.includes(COMPUTER_DISPATCH_DRIVER_DELIVERY_PROPERTY)) {
      throw new Error(COMPUTER_DISPATCH_UNSUPPORTED_FOREGROUND)
    }
    prepared.arguments.delivery_mode = COMPUTER_FOREGROUND
  }
}
