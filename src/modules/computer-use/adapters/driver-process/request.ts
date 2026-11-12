import { COMPUTER_PROCESS_JSONRPC } from "./constants"
import { type ComputerRpcRequest, type ComputerRpcRequestParameters } from "./types"

export function computerRpcRequest(id: number, method: string, parameters?: ComputerRpcRequestParameters): string {
  const request: ComputerRpcRequest = { jsonrpc: COMPUTER_PROCESS_JSONRPC, id, method }
  if (parameters) {
    request.params = parameters
  }
  return JSON.stringify(request)
}
