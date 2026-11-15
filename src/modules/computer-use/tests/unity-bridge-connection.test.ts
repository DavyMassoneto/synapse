import { createServer } from "node:net"
import { expect, test } from "vitest"
import {
  COMPUTER_UNITY_BRIDGE_LOOPBACK_HOST,
  COMPUTER_UNITY_BRIDGE_MAX_RESPONSE_BYTES,
  COMPUTER_UNITY_BRIDGE_RESPONSE_TOO_LARGE_TEXT,
  ComputerUnityBridgeConnection,
  type ComputerUnityBridgeTransportResult,
} from "#synapse/modules/computer-use/adapters/unity-bridge"

const TIMEOUT_MILLISECONDS = 1_000

const PING_REQUEST = { op: "ping", token: "fixture" }

const ACCEPTED_BODY = "{}\n"

function oversizedAsciiBody(): string {
  return `${"a".repeat(COMPUTER_UNITY_BRIDGE_MAX_RESPONSE_BYTES + 1)}\n`
}

function oversizedMultibyteBody(): string {
  return `${"é".repeat(COMPUTER_UNITY_BRIDGE_MAX_RESPONSE_BYTES / 2 + 1)}\n`
}

function unterminatedOversizedBody(): string {
  return "a".repeat(COMPUTER_UNITY_BRIDGE_MAX_RESPONSE_BYTES + 1)
}

async function transactWith(body: string): Promise<ComputerUnityBridgeTransportResult> {
  const server = createServer()
  server.on("connection", (socket) => {
    socket.once("data", () => socket.write(body))
  })
  await new Promise<void>((resolve) => server.listen(0, COMPUTER_UNITY_BRIDGE_LOOPBACK_HOST, () => resolve()))
  const address = server.address()
  if (!(address instanceof Object)) {
    throw new Error("esperava porta do servidor de teste")
  }
  const connection = new ComputerUnityBridgeConnection(address.port, PING_REQUEST, TIMEOUT_MILLISECONDS)
  const result = await connection.transact()
  await new Promise<void>((resolve) => server.close(() => resolve()))
  return result
}

async function acceptsLineWithinByteLimit(): Promise<void> {
  const result = await transactWith(ACCEPTED_BODY)
  expect(result).toEqual({ kind: "transport-response", body: "{}" })
}

async function rejectsTerminatedLineAboveByteLimit(): Promise<void> {
  const result = await transactWith(oversizedAsciiBody())
  expect(result).toEqual({ kind: "transport-failure", message: COMPUTER_UNITY_BRIDGE_RESPONSE_TOO_LARGE_TEXT })
}

async function rejectsTerminatedMultibyteLineAboveByteLimit(): Promise<void> {
  const result = await transactWith(oversizedMultibyteBody())
  expect(result).toEqual({ kind: "transport-failure", message: COMPUTER_UNITY_BRIDGE_RESPONSE_TOO_LARGE_TEXT })
}

async function rejectsUnterminatedLineAboveByteLimit(): Promise<void> {
  const result = await transactWith(unterminatedOversizedBody())
  expect(result).toEqual({ kind: "transport-failure", message: COMPUTER_UNITY_BRIDGE_RESPONSE_TOO_LARGE_TEXT })
}

test("resposta dentro do teto em bytes é aceita", acceptsLineWithinByteLimit)

test("linha delimitada acima do teto em bytes é recusada", rejectsTerminatedLineAboveByteLimit)

test("linha multibyte delimitada acima do teto em bytes é recusada", rejectsTerminatedMultibyteLineAboveByteLimit)

test("linha sem delimitador acima do teto em bytes é recusada", rejectsUnterminatedLineAboveByteLimit)
