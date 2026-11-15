import {
  COMPUTER_DRIVER_PID_PROPERTY,
  COMPUTER_DRIVER_WINDOW_PROPERTY,
  type ComputerDriverArguments,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_UNITY_BRIDGE_TARGET_KEY_SEPARATOR } from "./constants"
import { type ComputerUnityBridgeTarget, type ComputerUnityBridgeTargetLookup } from "./types"

export function computerUnityBridgeTargetLookup(
  argumentsValue: ComputerDriverArguments,
): ComputerUnityBridgeTargetLookup {
  if (COMPUTER_DRIVER_PID_PROPERTY in argumentsValue && COMPUTER_DRIVER_WINDOW_PROPERTY in argumentsValue) {
    return { target: { pid: argumentsValue.pid, windowId: argumentsValue.window_id } }
  }
  return {}
}

export function computerUnityBridgeTargetKey(target: ComputerUnityBridgeTarget): string {
  return `${target.pid}${COMPUTER_UNITY_BRIDGE_TARGET_KEY_SEPARATOR}${target.windowId}`
}
