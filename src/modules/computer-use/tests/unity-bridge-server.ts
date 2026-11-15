import { createServer, type Server, type Socket } from "node:net"
import { Value } from "typebox/value"
import {
  COMPUTER_UNITY_BRIDGE_LOOPBACK_HOST,
  COMPUTER_UNITY_BRIDGE_PING_OP,
  COMPUTER_UNITY_BRIDGE_RESPONSE_END,
  COMPUTER_UNITY_BRIDGE_TREE_OP,
  COMPUTER_UNITY_BRIDGE_UTF8,
  type ComputerUnityBridgeRequest,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import { COMPUTER_UNITY_BRIDGE_TEST_REQUEST_SCHEMA } from "./unity-bridge-schemas"
import { computerUnityBridgeTestGeometry, computerUnityBridgeTestPing } from "./unity-bridge-support"
import { type ComputerUnityBridgeTestServerOptions } from "./unity-bridge-types"

export class ComputerUnityBridgeTestServer {
  readonly requests: ComputerUnityBridgeRequest[] = []
  private readonly options: ComputerUnityBridgeTestServerOptions
  private readonly server: Server
  private readonly sockets: Socket[] = []
  private port = 0

  constructor(options: ComputerUnityBridgeTestServerOptions) {
    this.options = options
    this.server = createServer()
    this.server.on("connection", (socket) => this.accept(socket))
  }

  async start(): Promise<number> {
    await new Promise<void>((resolve) => this.server.listen(0, COMPUTER_UNITY_BRIDGE_LOOPBACK_HOST, () => resolve()))
    const address = this.server.address()
    if (address && typeof address === "object") {
      this.port = address.port
    }
    return this.port
  }

  moveTo(clientY: number): void {
    this.options.geometry = computerUnityBridgeTestGeometry(clientY)
  }

  replaceInstance(instance: string): void {
    this.options.instance = instance
  }

  bumpGeneration(): void {
    this.options.generation += 1
  }

  async close(): Promise<void> {
    for (const socket of this.sockets) {
      socket.destroy()
    }
    await new Promise<void>((resolve) => this.server.close(() => resolve()))
  }

  private accept(socket: Socket): void {
    this.sockets.push(socket)
    socket.setEncoding(COMPUTER_UNITY_BRIDGE_UTF8)
    socket.on("data", (chunk: string) => this.receive(socket, chunk))
  }

  private receive(socket: Socket, chunk: string): void {
    const request = Value.Parse(COMPUTER_UNITY_BRIDGE_TEST_REQUEST_SCHEMA, JSON.parse(chunk))
    this.requests.push(request)
    if (this.options.clickDrop && request.op !== COMPUTER_UNITY_BRIDGE_PING_OP) {
      socket.destroy()
    } else {
      socket.write(`${this.reply(request)}${COMPUTER_UNITY_BRIDGE_RESPONSE_END}`)
    }
  }

  private reply(request: ComputerUnityBridgeRequest): string {
    if (request.op === COMPUTER_UNITY_BRIDGE_PING_OP) {
      return JSON.stringify(computerUnityBridgeTestPing(this.options))
    }
    if (request.op === COMPUTER_UNITY_BRIDGE_TREE_OP) {
      return JSON.stringify(this.options.tree)
    }
    return JSON.stringify(this.options.action)
  }
}
