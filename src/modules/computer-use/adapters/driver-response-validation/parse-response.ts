import { Value } from "typebox/value"
import {
  COMPUTER_INVALID_RPC,
  COMPUTER_INVALID_RPC_MESSAGE,
  COMPUTER_RPC_NOTIFICATION,
  COMPUTER_VALID_RPC,
} from "./constants"
import { COMPUTER_RAW_NOTIFICATION_SCHEMA, COMPUTER_RAW_RPC_SCHEMA } from "./schemas"
import { type ComputerParsedRpc } from "./types"

export function computerParseRpcResponse(line: string): ComputerParsedRpc {
  try {
    return { kind: COMPUTER_VALID_RPC, response: Value.Parse(COMPUTER_RAW_RPC_SCHEMA, JSON.parse(line)) }
  } catch {
    return computerParseRpcNotification(line)
  }
}

function computerParseRpcNotification(line: string): ComputerParsedRpc {
  try {
    Value.Parse(COMPUTER_RAW_NOTIFICATION_SCHEMA, JSON.parse(line))
    return { kind: COMPUTER_RPC_NOTIFICATION }
  } catch {
    return { kind: COMPUTER_INVALID_RPC, message: COMPUTER_INVALID_RPC_MESSAGE }
  }
}
