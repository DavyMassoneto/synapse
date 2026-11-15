import { type ComputerUnityBridgeCommand } from "#synapse/modules/computer-use/public/contracts"
import { computerRunCommand } from "../command-execution"
import { computerUnityBridgeCommandArguments } from "./command-arguments"
import {
  COMPUTER_UNITY_BRIDGE_COMMAND_DETAIL_MAX_CHARS,
  COMPUTER_UNITY_BRIDGE_COMMAND_MAX_OUTPUT_BYTES,
  COMPUTER_UNITY_BRIDGE_COMMAND_TIMEOUT_MILLISECONDS,
  COMPUTER_UNITY_BRIDGE_COMMAND_UNKNOWN_DETAIL,
  COMPUTER_UNITY_BRIDGE_DETAIL_SEPARATOR,
  COMPUTER_UNITY_BRIDGE_UTF8,
  COMPUTER_UNITY_BRIDGE_WHITESPACE_PATTERN,
  COMPUTER_UNITY_BRIDGE_WINDOWS_HIDE,
} from "./constants"
import { type ComputerUnityBridgeCommandResult, type ComputerUnityBridgeTarget } from "./types"

export async function computerRunUnityBridgeCommand(
  command: ComputerUnityBridgeCommand,
  target: ComputerUnityBridgeTarget,
  signal?: AbortSignal,
): Promise<ComputerUnityBridgeCommandResult> {
  const argumentsValue = computerUnityBridgeCommandArguments(command.arguments, target)
  try {
    await computerRunCommand(command.command, argumentsValue, {
      signal,
      timeout: COMPUTER_UNITY_BRIDGE_COMMAND_TIMEOUT_MILLISECONDS,
      windowsHide: COMPUTER_UNITY_BRIDGE_WINDOWS_HIDE,
      maxBuffer: COMPUTER_UNITY_BRIDGE_COMMAND_MAX_OUTPUT_BYTES,
      encoding: COMPUTER_UNITY_BRIDGE_UTF8,
    })
    return { kind: "command-succeeded" }
  } catch (error) {
    if (error instanceof Error) {
      return computerUnityBridgeCommandFailure(error)
    }
    throw error
  }
}

function computerUnityBridgeCommandFailure(error: Error): ComputerUnityBridgeCommandResult {
  const detail = computerUnityBridgeCommandDetail(error.message)
  if ("code" in error && typeof error.code === "number") {
    return { kind: "command-exited", exitCode: error.code, detail }
  }
  return { kind: "command-unavailable", detail }
}

function computerUnityBridgeCommandDetail(message: string): string {
  const compact = message.replace(COMPUTER_UNITY_BRIDGE_WHITESPACE_PATTERN, COMPUTER_UNITY_BRIDGE_DETAIL_SEPARATOR)
  return compact.slice(0, COMPUTER_UNITY_BRIDGE_COMMAND_DETAIL_MAX_CHARS)
}

export function computerUnityBridgeFailureDetail(result: ComputerUnityBridgeCommandResult): string {
  if (result.kind === "command-exited") {
    return result.detail
  }
  if (result.kind === "command-unavailable") {
    return result.detail
  }
  return COMPUTER_UNITY_BRIDGE_COMMAND_UNKNOWN_DETAIL
}
