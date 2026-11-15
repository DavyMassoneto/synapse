import {
  COMPUTER_DRIVER_MAX_ELEMENTS_PROPERTY,
  COMPUTER_DRIVER_TREE_FORMAT_PROPERTY,
  type ComputerDriverTool,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_DISPATCH_WINDOW_STATE } from "../internal"

export function computerCurrentWindowStateTools(): ComputerDriverTool[] {
  return [
    {
      name: COMPUTER_DISPATCH_WINDOW_STATE,
      inputProperties: [COMPUTER_DRIVER_TREE_FORMAT_PROPERTY, COMPUTER_DRIVER_MAX_ELEMENTS_PROPERTY],
    },
  ]
}

export function computerLegacyWindowStateTools(): ComputerDriverTool[] {
  return [{ name: COMPUTER_DISPATCH_WINDOW_STATE, inputProperties: ["x", "delivery_mode"] }]
}
