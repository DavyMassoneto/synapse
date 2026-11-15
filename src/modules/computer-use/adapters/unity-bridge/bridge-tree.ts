import { Value } from "typebox/value"
import { type ComputerUnityBridgeRequest, type ComputerUnityBridgeTreeResult } from "./action"
import {
  COMPUTER_UNITY_BRIDGE_INVALID_RESPONSE_TEXT,
  COMPUTER_UNITY_BRIDGE_TREE_INCLUDE_OFFSCREEN,
  COMPUTER_UNITY_BRIDGE_TREE_INCLUDE_TEXTS,
  COMPUTER_UNITY_BRIDGE_TREE_OP,
  COMPUTER_UNITY_BRIDGE_TREE_TEXT_MAX_RESPONSE,
} from "./constants"
import { COMPUTER_UNITY_BRIDGE_TREE_SCHEMA } from "./schemas"

export function computerUnityBridgeTreeRequest(
  token: string,
  max: number,
  maxTexts: number,
): ComputerUnityBridgeRequest {
  return {
    op: COMPUTER_UNITY_BRIDGE_TREE_OP,
    token,
    max,
    max_texts: maxTexts,
    include_texts: COMPUTER_UNITY_BRIDGE_TREE_INCLUDE_TEXTS,
    include_offscreen: COMPUTER_UNITY_BRIDGE_TREE_INCLUDE_OFFSCREEN,
  }
}

export function computerUnityBridgeTreeParse(body: string): ComputerUnityBridgeTreeResult {
  if (Buffer.byteLength(body) > COMPUTER_UNITY_BRIDGE_TREE_TEXT_MAX_RESPONSE) {
    return { kind: "tree-invalid", message: COMPUTER_UNITY_BRIDGE_INVALID_RESPONSE_TEXT }
  }
  try {
    const record = Value.Parse(COMPUTER_UNITY_BRIDGE_TREE_SCHEMA, JSON.parse(body))
    return { kind: "tree-parsed", record }
  } catch {
    return { kind: "tree-invalid", message: COMPUTER_UNITY_BRIDGE_INVALID_RESPONSE_TEXT }
  }
}
