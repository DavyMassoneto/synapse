import { Buffer } from "node:buffer"
import { createConnection, type Socket } from "node:net"
import { type ComputerUnityBridgeRequest } from "./action"
import {
  COMPUTER_UNITY_BRIDGE_CLOSED_TEXT,
  COMPUTER_UNITY_BRIDGE_LOOPBACK_HOST,
  COMPUTER_UNITY_BRIDGE_MAX_RESPONSE_BYTES,
  COMPUTER_UNITY_BRIDGE_REQUEST_END,
  COMPUTER_UNITY_BRIDGE_RESPONSE_END,
  COMPUTER_UNITY_BRIDGE_RESPONSE_TOO_LARGE_TEXT,
  COMPUTER_UNITY_BRIDGE_STRING_EMPTY,
  COMPUTER_UNITY_BRIDGE_UTF8,
} from "./constants"
import { type ComputerUnityBridgeSettlement, type ComputerUnityBridgeTransportResult } from "./types"

export class ComputerUnityBridgeConnection {
  private readonly timeoutMilliseconds: number
  private readonly request: ComputerUnityBridgeRequest
  private readonly socket: Socket
  private buffer = COMPUTER_UNITY_BRIDGE_STRING_EMPTY
  private receivedBytes = 0
  private settlement?: ComputerUnityBridgeSettlement
  private settled = false

  constructor(port: number, request: ComputerUnityBridgeRequest, timeoutMilliseconds: number) {
    this.request = request
    this.timeoutMilliseconds = timeoutMilliseconds
    this.socket = createConnection({ host: COMPUTER_UNITY_BRIDGE_LOOPBACK_HOST, port })
  }

  transact(): Promise<ComputerUnityBridgeTransportResult> {
    return new Promise((resolve) => {
      this.settlement = resolve
      this.listen()
    })
  }

  private listen(): void {
    this.socket.setEncoding(COMPUTER_UNITY_BRIDGE_UTF8)
    this.socket.setTimeout(this.timeoutMilliseconds, () => this.finish({ kind: "transport-timeout" }))
    this.socket.on("connect", () => this.write())
    this.socket.on("data", (chunk: string) => this.read(chunk))
    this.socket.on("error", (error: Error) => this.finish({ kind: "transport-failure", message: error.message }))
    this.socket.on("close", () =>
      this.finish({ kind: "transport-failure", message: COMPUTER_UNITY_BRIDGE_CLOSED_TEXT }),
    )
  }

  private write(): void {
    this.socket.write(`${JSON.stringify(this.request)}${COMPUTER_UNITY_BRIDGE_REQUEST_END}`)
  }

  private read(chunk: string): void {
    const end = chunk.indexOf(COMPUTER_UNITY_BRIDGE_RESPONSE_END)
    if (end >= 0) {
      this.readLine(chunk.slice(0, end))
    } else {
      this.readPartial(chunk)
    }
  }

  private readLine(body: string): void {
    const bodyBytes = this.receivedBytes + Buffer.byteLength(body, COMPUTER_UNITY_BRIDGE_UTF8)
    if (bodyBytes > COMPUTER_UNITY_BRIDGE_MAX_RESPONSE_BYTES) {
      this.finish({ kind: "transport-failure", message: COMPUTER_UNITY_BRIDGE_RESPONSE_TOO_LARGE_TEXT })
    } else {
      this.buffer += body
      this.finish({ kind: "transport-response", body: this.buffer })
    }
  }

  private readPartial(chunk: string): void {
    this.receivedBytes += Buffer.byteLength(chunk, COMPUTER_UNITY_BRIDGE_UTF8)
    if (this.receivedBytes > COMPUTER_UNITY_BRIDGE_MAX_RESPONSE_BYTES) {
      this.finish({ kind: "transport-failure", message: COMPUTER_UNITY_BRIDGE_RESPONSE_TOO_LARGE_TEXT })
    } else {
      this.buffer += chunk
    }
  }

  private finish(result: ComputerUnityBridgeTransportResult): void {
    if (!this.settled) {
      this.settled = true
      this.socket.destroy()
      this.settlement?.(result)
    }
  }
}
