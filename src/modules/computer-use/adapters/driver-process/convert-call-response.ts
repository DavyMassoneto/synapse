import {
  COMPUTER_DRIVER_ERROR,
  COMPUTER_DRIVER_INVALID,
  COMPUTER_DRIVER_RESPONSE,
  type ComputerDriverCallResult,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_PROCESS_RPC_SUCCESS, computerConvertEnvelope } from "../driver-response-validation"
import { COMPUTER_PROCESS_INVALID_MESSAGE } from "./constants"
import { type ComputerProcessRpcResult } from "./types"

export function computerConvertCallResponse(response: ComputerProcessRpcResult): ComputerDriverCallResult {
  if (response.kind !== COMPUTER_PROCESS_RPC_SUCCESS) {
    return response
  }
  if (response.response.error) {
    return { kind: COMPUTER_DRIVER_ERROR, message: response.response.error.message }
  }
  const result = response.response.result
  if (result && "content" in result) {
    try {
      return { kind: COMPUTER_DRIVER_RESPONSE, envelope: computerConvertEnvelope(result) }
    } catch {
      return { kind: COMPUTER_DRIVER_INVALID, message: COMPUTER_PROCESS_INVALID_MESSAGE }
    }
  }
  return { kind: COMPUTER_DRIVER_INVALID, message: COMPUTER_PROCESS_INVALID_MESSAGE }
}
