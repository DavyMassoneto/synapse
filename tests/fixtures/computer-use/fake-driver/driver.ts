import { appendFileSync } from "node:fs"
import { createInterface } from "node:readline"
import { Value } from "typebox/value"
import {
  COMPUTER_FIXTURE_DRIVER_2_0,
  COMPUTER_FIXTURE_DRIVER_CALL,
  COMPUTER_FIXTURE_DRIVER_GET_WINDOW_STATE,
  COMPUTER_FIXTURE_DRIVER_INFO_LEVEL,
  COMPUTER_FIXTURE_DRIVER_INTEGER_TYPE,
  COMPUTER_FIXTURE_DRIVER_LINE,
  COMPUTER_FIXTURE_DRIVER_LIST_APPS,
  COMPUTER_FIXTURE_DRIVER_LIST_WINDOWS,
  COMPUTER_FIXTURE_DRIVER_LOG_VARIABLE,
  COMPUTER_FIXTURE_DRIVER_MANIFEST,
  COMPUTER_FIXTURE_DRIVER_MISSING_PROTOCOL,
  COMPUTER_FIXTURE_DRIVER_NOTIFICATIONS_MESSAGE,
  COMPUTER_FIXTURE_DRIVER_PROTOCOL_SCHEMA,
  COMPUTER_FIXTURE_DRIVER_REQUEST_SCHEMA,
  COMPUTER_FIXTURE_DRIVER_SERVER_NAME,
  COMPUTER_FIXTURE_DRIVER_STRING_TYPE,
  COMPUTER_FIXTURE_DRIVER_TOOL_NAMES,
  COMPUTER_FIXTURE_DRIVER_VERSION,
} from "./constants"
import { type ComputerFixtureDriverRequest, type ComputerFixtureDriverTool } from "./types"

const protocolArgument = process.argv[2]
if (!protocolArgument) {
  throw new Error(COMPUTER_FIXTURE_DRIVER_MISSING_PROTOCOL)
}
const protocol = Value.Parse(COMPUTER_FIXTURE_DRIVER_PROTOCOL_SCHEMA, JSON.parse(protocolArgument))

function respond(request: ComputerFixtureDriverRequest): void {
  if (request.method === protocol.initialize) {
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: COMPUTER_FIXTURE_DRIVER_2_0, method: COMPUTER_FIXTURE_DRIVER_NOTIFICATIONS_MESSAGE, params: { level: COMPUTER_FIXTURE_DRIVER_INFO_LEVEL, data: COMPUTER_FIXTURE_DRIVER_SERVER_NAME } })}\n`,
    )
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: COMPUTER_FIXTURE_DRIVER_2_0, id: request.id, result: { protocolVersion: protocol.version, capabilities: {}, serverInfo: { name: COMPUTER_FIXTURE_DRIVER_SERVER_NAME, version: COMPUTER_FIXTURE_DRIVER_VERSION } } })}\n`,
    )
  } else if (request.method === protocol.toolsList) {
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: COMPUTER_FIXTURE_DRIVER_2_0, id: request.id, result: { tools: COMPUTER_FIXTURE_DRIVER_TOOL_NAMES.map(makeTool) } })}\n`,
    )
  } else if (request.method === protocol.toolsCall) {
    respondCall(request)
  }
}

function makeTool(name: string): ComputerFixtureDriverTool {
  return {
    name,
    inputSchema: {
      properties: {
        element_token: { type: COMPUTER_FIXTURE_DRIVER_STRING_TYPE },
        delivery_mode: { type: COMPUTER_FIXTURE_DRIVER_STRING_TYPE },
        x: { type: COMPUTER_FIXTURE_DRIVER_INTEGER_TYPE },
      },
    },
  }
}

function respondCall(request: ComputerFixtureDriverRequest): void {
  const log = process.env[COMPUTER_FIXTURE_DRIVER_LOG_VARIABLE]
  if (log) {
    appendFileSync(log, `${JSON.stringify(request)}\n`)
  }
  respondEnvelope(request)
}

function respondEnvelope(request: ComputerFixtureDriverRequest): void {
  const name = request.params?.name
  const structuredContent = {
    verified: true,
    message: "feito",
    windows:
      name === COMPUTER_FIXTURE_DRIVER_LIST_WINDOWS
        ? [{ app_name: "Editor", pid: 10, window_id: 20, is_on_screen: true, title: "Documento", z_index: 1 }]
        : [],
    apps: name === COMPUTER_FIXTURE_DRIVER_LIST_APPS ? [{ name: "Editor", pid: 10, running: true }] : [],
    elements:
      name === COMPUTER_FIXTURE_DRIVER_GET_WINDOW_STATE
        ? [{ element_index: 1, role: "AXButton", label: "Salvar", element_token: "snapshot-1" }]
        : [],
    tree_markdown: 'AXWindow "Documento"\n[1] AXButton "Salvar"',
  }
  process.stdout.write(
    `${JSON.stringify({ jsonrpc: COMPUTER_FIXTURE_DRIVER_2_0, id: request.id, result: { content: [], structuredContent, isError: false } })}\n`,
  )
}

function onLine(line: string): void {
  respond(Value.Parse(COMPUTER_FIXTURE_DRIVER_REQUEST_SCHEMA, JSON.parse(line)))
}

function main(): void {
  if (process.argv.includes(COMPUTER_FIXTURE_DRIVER_MANIFEST)) {
    process.stdout.write(
      JSON.stringify({
        binary_version: COMPUTER_FIXTURE_DRIVER_VERSION,
        mcp_invocation: { command: process.execPath, args: [] },
      }),
    )
  } else if (process.argv.includes(COMPUTER_FIXTURE_DRIVER_CALL)) {
    process.stdout.write(JSON.stringify({ content: [], structuredContent: { message: "feito", verified: true } }))
  } else {
    createInterface({ input: process.stdin }).on(COMPUTER_FIXTURE_DRIVER_LINE, onLine)
  }
}

main()
