import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import {
  COMPUTER_DRIVER_DISCONNECTED,
  COMPUTER_DRIVER_PROTOCOL_VERSION,
  COMPUTER_RPC_INITIALIZE,
  COMPUTER_RPC_INITIALIZED,
  COMPUTER_RPC_TOOLS_CALL,
  COMPUTER_RPC_TOOLS_LIST,
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverLaunch,
  type ComputerDriverPort,
  type ComputerDriverTool,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_ERROR_CODE_BROKEN_PIPE, isErrorWithCode } from "../command-execution"
import {
  COMPUTER_INVALID_RPC,
  COMPUTER_PROCESS_RPC_SUCCESS,
  COMPUTER_VALID_RPC,
  computerConvertTools,
  computerParseRpcResponse,
} from "../driver-response-validation"
import {
  COMPUTER_PROCESS_CLIENT_NAME,
  COMPUTER_PROCESS_CLIENT_VERSION,
  COMPUTER_PROCESS_DATA_EVENT,
  COMPUTER_PROCESS_DISCONNECTED_MESSAGE,
  COMPUTER_PROCESS_ENCODING,
  COMPUTER_PROCESS_ERROR_EVENT,
  COMPUTER_PROCESS_EXIT_EVENT,
  COMPUTER_PROCESS_INVALID_MESSAGE,
  COMPUTER_PROCESS_JSONRPC,
  COMPUTER_PROCESS_LINE_BREAK,
  COMPUTER_PROCESS_STDIO,
  COMPUTER_RPC_PROTOCOL_PROPERTY,
  COMPUTER_RPC_TOOLS_PROPERTY,
} from "./constants"
import { computerConvertCallResponse } from "./convert-call-response"
import { ComputerProcessLineReader } from "./line-reader"
import { ComputerProcessPendingCalls } from "./pending-calls"
import { computerRpcRequest } from "./request"
import { type ComputerProcessResolver, type ComputerProcessRpcResult, type ComputerRpcRequestParameters } from "./types"

export class ComputerDriverProcess implements ComputerDriverPort {
  private readonly launch: ComputerDriverLaunch

  private process?: ChildProcessWithoutNullStreams

  private readonly lines = new ComputerProcessLineReader(this.receiveLine.bind(this))

  private nextId = 0

  private readonly calls = new ComputerProcessPendingCalls()

  constructor(launch: ComputerDriverLaunch) {
    this.launch = launch
  }

  async start(): Promise<ComputerDriverTool[]> {
    this.spawn()
    await this.negotiate()
    const tools = await this.rpc(COMPUTER_RPC_TOOLS_LIST)
    if (
      tools.kind === COMPUTER_PROCESS_RPC_SUCCESS &&
      tools.response.result &&
      COMPUTER_RPC_TOOLS_PROPERTY in tools.response.result
    ) {
      return computerConvertTools(tools.response.result)
    }
    await this.stop()
    throw new Error(COMPUTER_PROCESS_INVALID_MESSAGE)
  }

  private async negotiate(): Promise<void> {
    const initialized = await this.rpc(COMPUTER_RPC_INITIALIZE, {
      protocolVersion: COMPUTER_DRIVER_PROTOCOL_VERSION,
      capabilities: { tools: true },
      clientInfo: { name: COMPUTER_PROCESS_CLIENT_NAME, version: COMPUTER_PROCESS_CLIENT_VERSION },
    })
    if (
      initialized.kind !== COMPUTER_PROCESS_RPC_SUCCESS ||
      !initialized.response.result ||
      !(COMPUTER_RPC_PROTOCOL_PROPERTY in initialized.response.result) ||
      initialized.response.result.protocolVersion !== COMPUTER_DRIVER_PROTOCOL_VERSION
    ) {
      await this.stop()
      throw new Error(COMPUTER_PROCESS_INVALID_MESSAGE)
    }
    this.process?.stdin.write(
      `${JSON.stringify({ jsonrpc: COMPUTER_PROCESS_JSONRPC, method: COMPUTER_RPC_INITIALIZED })}${COMPUTER_PROCESS_LINE_BREAK}`,
    )
  }

  async call(name: string, argumentsValue: ComputerDriverArguments): Promise<ComputerDriverCallResult> {
    const response = await this.rpc(COMPUTER_RPC_TOOLS_CALL, { name, arguments: argumentsValue })
    return computerConvertCallResponse(response)
  }

  async stop(): Promise<void> {
    const child = this.process
    this.exited()
    if (child) {
      child.stdout.removeAllListeners(COMPUTER_PROCESS_DATA_EVENT)
      child.stdin.removeAllListeners(COMPUTER_PROCESS_ERROR_EVENT)
      child.removeAllListeners(COMPUTER_PROCESS_ERROR_EVENT)
      child.removeAllListeners(COMPUTER_PROCESS_EXIT_EVENT)
      child.on(COMPUTER_PROCESS_ERROR_EVENT, this.ignoreStoppedError)
      child.stdin.on(COMPUTER_PROCESS_ERROR_EVENT, this.ignoreStoppedError)
      if (!child.killed) {
        child.kill()
      }
    }
  }

  private ignoreStoppedError(error: Error): void {
    if (!isErrorWithCode(error, COMPUTER_ERROR_CODE_BROKEN_PIPE)) {
      this.exited()
    }
  }

  private spawn(): void {
    const child = spawn(this.launch.command, this.launch.arguments, {
      env: this.launch.environment,
      stdio: COMPUTER_PROCESS_STDIO,
      windowsHide: this.launch.windowsHide,
    })
    this.process = child
    this.lines.reset()
    child.stdout.setEncoding(COMPUTER_PROCESS_ENCODING)
    child.stdout.on(COMPUTER_PROCESS_DATA_EVENT, this.receive.bind(this))
    child.stderr.resume()
    child.stdin.on(COMPUTER_PROCESS_ERROR_EVENT, this.disconnect.bind(this))
    child.on(COMPUTER_PROCESS_ERROR_EVENT, this.exited.bind(this))
    child.on(COMPUTER_PROCESS_EXIT_EVENT, this.exited.bind(this))
  }

  private rpc(method: string, parameters?: ComputerRpcRequestParameters): Promise<ComputerProcessRpcResult> {
    this.nextId += 1
    const request = computerRpcRequest(this.nextId, method, parameters)
    return new Promise<ComputerProcessRpcResult>(this.register.bind(this, this.nextId, request))
  }

  private register(id: number, request: string, resolve: ComputerProcessResolver): void {
    const child = this.process
    if (child && !child.stdin.destroyed) {
      this.calls.add(id, this.launch.timeoutMilliseconds, resolve)
      child.stdin.write(`${request}${COMPUTER_PROCESS_LINE_BREAK}`)
    } else {
      resolve({ kind: COMPUTER_DRIVER_DISCONNECTED, message: COMPUTER_PROCESS_DISCONNECTED_MESSAGE })
    }
  }

  private exited(): void {
    delete this.process
    this.lines.reset()
    this.disconnect()
  }

  private disconnect(): void {
    this.calls.disconnect()
  }

  private receive(chunk: string): void {
    if (!this.lines.receive(chunk)) {
      this.disconnect()
      this.process?.kill()
    }
  }

  private receiveLine(line: string): void {
    const parsed = computerParseRpcResponse(line)
    if (parsed.kind === COMPUTER_INVALID_RPC) {
      this.calls.invalidate(parsed.message)
    } else if (parsed.kind === COMPUTER_VALID_RPC) {
      this.calls.settle(parsed.response.id, { kind: COMPUTER_PROCESS_RPC_SUCCESS, response: parsed.response })
    }
  }
}
