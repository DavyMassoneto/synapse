import {
  type ComputerDriverArguments,
  type ComputerDriverFailure,
} from "#synapse/modules/computer-use/public/contracts"
import { type COMPUTER_PROCESS_RPC_SUCCESS, type ComputerRawRpc } from "../driver-response-validation"

export interface ComputerRpcInitializeParameters {
  protocolVersion: string
  capabilities: ComputerRpcCapabilities
  clientInfo: ComputerRpcClientInfo
}

export interface ComputerRpcCallParameters {
  name: string
  arguments: ComputerDriverArguments
}

export type ComputerRpcRequestParameters = ComputerRpcInitializeParameters | ComputerRpcCallParameters

export interface ComputerRpcRequest {
  jsonrpc: string
  id: number
  method: string
  params?: ComputerRpcRequestParameters
}

export interface ComputerRpcCapabilities {
  tools?: boolean
}

export interface ComputerRpcClientInfo {
  name: string
  version: string
}

export interface ComputerProcessRpcSuccess {
  kind: typeof COMPUTER_PROCESS_RPC_SUCCESS
  response: ComputerRawRpc
}

export type ComputerProcessRpcResult = ComputerProcessRpcSuccess | ComputerDriverFailure

export interface ComputerProcessPendingCall {
  resolve: ComputerProcessResolver
  timer: ReturnType<typeof setTimeout>
}

export type ComputerProcessResolver = (result: ComputerProcessRpcResult) => void

export type ComputerProcessLineHandler = (line: string) => void
