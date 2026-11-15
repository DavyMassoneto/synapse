import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { Value } from "typebox/value"
import { COMPUTER_ERROR_CODE_MISSING_FILE, isErrorWithCode } from "../command-execution"
import {
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_FILE,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_RETRY_DELAY_MILLISECONDS,
  COMPUTER_UNITY_BRIDGE_RUN_DIRECTORY,
  COMPUTER_UNITY_BRIDGE_UTF8,
} from "./constants"
import { computerUnityBridgeDelay } from "./delay"
import { type ComputerUnityBridgeHandshakeResult } from "./handshake"
import { COMPUTER_UNITY_BRIDGE_HANDSHAKE_SCHEMA } from "./schemas"

export async function computerReadUnityBridgeHandshake(directory: string): Promise<ComputerUnityBridgeHandshakeResult> {
  const path = computerUnityBridgeHandshakePath(directory)
  const first = await computerParseUnityBridgeHandshake(path)
  if (first.kind !== "handshake-unread") {
    return first
  }
  await computerUnityBridgeDelay(COMPUTER_UNITY_BRIDGE_HANDSHAKE_RETRY_DELAY_MILLISECONDS)
  return computerParseUnityBridgeHandshake(path)
}

export function computerUnityBridgeHandshakePath(directory: string): string {
  return join(directory, COMPUTER_UNITY_BRIDGE_RUN_DIRECTORY, COMPUTER_UNITY_BRIDGE_HANDSHAKE_FILE)
}

async function computerParseUnityBridgeHandshake(path: string): Promise<ComputerUnityBridgeHandshakeResult> {
  try {
    const text = await readFile(path, COMPUTER_UNITY_BRIDGE_UTF8)
    const record = Value.Parse(COMPUTER_UNITY_BRIDGE_HANDSHAKE_SCHEMA, JSON.parse(text))
    return { kind: "handshake-read", record }
  } catch (error) {
    if (error instanceof Error && isErrorWithCode(error, COMPUTER_ERROR_CODE_MISSING_FILE)) {
      return { kind: "handshake-absent" }
    }
    if (error instanceof Error) {
      return { kind: "handshake-unread", detail: error.message }
    }
    throw error
  }
}
