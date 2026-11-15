import {
  COMPUTER_UNITY_BRIDGE_PID_PLACEHOLDER,
  COMPUTER_UNITY_BRIDGE_WINDOW_PLACEHOLDER,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeTarget } from "./types"

export function computerUnityBridgeCommandArguments(
  argumentsValue: string[],
  target: ComputerUnityBridgeTarget,
): string[] {
  return argumentsValue.map((argument) => computerUnityBridgeCommandArgument(argument, target))
}

function computerUnityBridgeCommandArgument(argument: string, target: ComputerUnityBridgeTarget): string {
  const withPid = argument.replaceAll(COMPUTER_UNITY_BRIDGE_PID_PLACEHOLDER, `${target.pid}`)
  return withPid.replaceAll(COMPUTER_UNITY_BRIDGE_WINDOW_PLACEHOLDER, `${target.windowId}`)
}
