import {
  COMPUTER_DRIVER_RESPONSE,
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeCapturedWindow } from "./action"
import { COMPUTER_UNITY_BRIDGE_TREE_MAX_ITEMS, COMPUTER_UNITY_BRIDGE_WINDOW_STATE_TOOL } from "./constants"

export function computerUnityBridgeRoom(
  name: string,
  argumentsValue: ComputerDriverArguments,
  result: ComputerDriverCallResult,
): number {
  if (name !== COMPUTER_UNITY_BRIDGE_WINDOW_STATE_TOOL || result.kind !== COMPUTER_DRIVER_RESPONSE) {
    return 0
  }
  let limit = COMPUTER_UNITY_BRIDGE_TREE_MAX_ITEMS
  if (typeof argumentsValue.max_elements === "number") {
    limit = argumentsValue.max_elements
  }
  const room = limit - result.envelope.elements.length
  if (room <= 0) {
    return 0
  }
  return Math.min(room, COMPUTER_UNITY_BRIDGE_TREE_MAX_ITEMS)
}

export function computerUnityBridgeMerged(
  name: string,
  result: ComputerDriverCallResult,
  captured: ComputerUnityBridgeCapturedWindow,
): ComputerDriverCallResult {
  if (
    name === COMPUTER_UNITY_BRIDGE_WINDOW_STATE_TOOL &&
    result.kind === COMPUTER_DRIVER_RESPONSE &&
    !result.envelope.isError
  ) {
    result.envelope.elements.push(...captured.elements)
  }
  return result
}

export function computerUnityBridgeNativeCount(result: ComputerDriverCallResult): number {
  if (result.kind === COMPUTER_DRIVER_RESPONSE) {
    return result.envelope.elements.length
  }
  return 0
}
