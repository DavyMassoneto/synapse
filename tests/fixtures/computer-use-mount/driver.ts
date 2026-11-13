import { appendFileSync } from "node:fs"
import { createInterface } from "node:readline"
import { Value } from "typebox/value"
import {
  COMPUTER_MOUNT_DRIVER_CLOSED,
  COMPUTER_MOUNT_ELEMENTS,
  COMPUTER_MOUNT_EOF_EVENT,
  COMPUTER_MOUNT_GET_WINDOW,
  COMPUTER_MOUNT_INITIALIZE,
  COMPUTER_MOUNT_JSONRPC,
  COMPUTER_MOUNT_LINE_EVENT,
  COMPUTER_MOUNT_LOG_MISSING,
  COMPUTER_MOUNT_MANIFEST,
  COMPUTER_MOUNT_NEWLINE,
  COMPUTER_MOUNT_PROTOCOL,
  COMPUTER_MOUNT_STATE,
  COMPUTER_MOUNT_TERMINATE_SIGNAL,
  COMPUTER_MOUNT_TOOLS,
  COMPUTER_MOUNT_TOOLS_CALL,
  COMPUTER_MOUNT_TOOLS_LIST,
  COMPUTER_MOUNT_UTF8,
  COMPUTER_MOUNT_VERSION,
} from "./constants"
import { COMPUTER_MOUNT_INPUT_SCHEMA, COMPUTER_MOUNT_REQUEST_SCHEMA } from "./schemas"
import { type ComputerMountFakeTool, type ComputerMountRequest, type ComputerMountResponseResult } from "./types"

function logPath(): string {
  const path = process.argv[2]
  if (!path) {
    throw new Error(COMPUTER_MOUNT_LOG_MISSING)
  }
  return path
}

function logEvent(name: string): void {
  appendFileSync(logPath(), JSON.stringify({ name }) + COMPUTER_MOUNT_NEWLINE, COMPUTER_MOUNT_UTF8)
}

function fakeTool(name: string): ComputerMountFakeTool {
  return { name, inputSchema: COMPUTER_MOUNT_INPUT_SCHEMA }
}

function onLine(line: string): void {
  const request = Value.Parse(COMPUTER_MOUNT_REQUEST_SCHEMA, JSON.parse(line))
  switch (request.method) {
    case COMPUTER_MOUNT_INITIALIZE: {
      const result = {
        protocolVersion: COMPUTER_MOUNT_PROTOCOL,
        capabilities: {},
        serverInfo: { name: COMPUTER_MOUNT_DRIVER_CLOSED, version: COMPUTER_MOUNT_VERSION },
      }
      writeResponse(request, result)
      break
    }
    case COMPUTER_MOUNT_TOOLS_LIST:
      writeResponse(request, { tools: COMPUTER_MOUNT_TOOLS.map(fakeTool) })
      break
    case COMPUTER_MOUNT_TOOLS_CALL:
      respondCall(request)
      break
  }
}

function respondCall(request: ComputerMountRequest): void {
  if (request.params?.name) {
    logEvent(request.params.name)
  }
  const elements = request.params?.name === COMPUTER_MOUNT_GET_WINDOW ? COMPUTER_MOUNT_ELEMENTS : []
  const structuredContent = { ...COMPUTER_MOUNT_STATE, elements }
  writeResponse(request, { content: [], structuredContent, isError: false })
}

function writeResponse(request: ComputerMountRequest, result: ComputerMountResponseResult): void {
  process.stdout.write(
    JSON.stringify({ jsonrpc: COMPUTER_MOUNT_JSONRPC, id: request.id, result }) + COMPUTER_MOUNT_NEWLINE,
  )
}

function closeDriver(): void {
  logEvent(COMPUTER_MOUNT_DRIVER_CLOSED)
  process.exit(0)
}

function main(): void {
  if (process.argv.includes(COMPUTER_MOUNT_MANIFEST)) {
    logEvent(COMPUTER_MOUNT_MANIFEST)
    process.stdout.write(
      JSON.stringify({
        binary_version: COMPUTER_MOUNT_VERSION,
        mcp_invocation: { command: process.execPath, args: [] },
      }),
    )
  } else {
    process.on(COMPUTER_MOUNT_TERMINATE_SIGNAL, closeDriver)
    createInterface({ input: process.stdin })
      .on(COMPUTER_MOUNT_LINE_EVENT, onLine)
      .on(COMPUTER_MOUNT_EOF_EVENT, closeDriver)
  }
}

main()
