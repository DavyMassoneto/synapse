import { type ChildProcessWithoutNullStreams } from "node:child_process"
import {
  type ComputerDriverArguments,
  type ComputerDriverFailure,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerRawRpc } from "../driver-response-validation"

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
  kind: "process-rpc-success"
  response: ComputerRawRpc
}

export type ComputerProcessRpcResult = ComputerProcessRpcSuccess | ComputerDriverFailure

export interface ComputerProcessPendingCall {
  resolve: ComputerProcessResolver
  timer: ReturnType<typeof setTimeout>
}

export type ComputerProcessResolver = (result: ComputerProcessRpcResult) => void

export type ComputerProcessLineHandler = (line: string) => void

export interface ComputerStoppableProcess extends NodeJS.EventEmitter {
  readonly exitCode: ChildProcessWithoutNullStreams["exitCode"]
  readonly signalCode: ChildProcessWithoutNullStreams["signalCode"]
  kill(signal?: NodeJS.Signals): boolean
}

export type ComputerProcessCloseResolver = () => void
