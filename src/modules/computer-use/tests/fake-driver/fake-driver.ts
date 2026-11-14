import { appendFileSync, existsSync, writeFileSync } from "node:fs"
import { createInterface } from "node:readline"
import { Value } from "typebox/value"
import {
  COMPUTER_FAKE_2_0,
  COMPUTER_FAKE_CALL,
  COMPUTER_FAKE_CLICK,
  COMPUTER_FAKE_DISCONNECT,
  COMPUTER_FAKE_DISCONNECT_ONCE,
  COMPUTER_FAKE_GET_WINDOW_STATE,
  COMPUTER_FAKE_INFO_LEVEL,
  COMPUTER_FAKE_INITIALIZE,
  COMPUTER_FAKE_INTEGER_TYPE,
  COMPUTER_FAKE_INVALID,
  COMPUTER_FAKE_LINE,
  COMPUTER_FAKE_LIST_APPS,
  COMPUTER_FAKE_LIST_WINDOWS,
  COMPUTER_FAKE_LOG_VARIABLE,
  COMPUTER_FAKE_MANIFEST,
  COMPUTER_FAKE_MARKER_VARIABLE,
  COMPUTER_FAKE_NOTIFICATIONS_MESSAGE,
  COMPUTER_FAKE_PROTOCOL,
  COMPUTER_FAKE_RPC_ERROR,
  COMPUTER_FAKE_SCENARIO_VARIABLE,
  COMPUTER_FAKE_SERVER_NAME,
  COMPUTER_FAKE_STRING_TYPE,
  COMPUTER_FAKE_TIMEOUT,
  COMPUTER_FAKE_TOOL_NAMES,
  COMPUTER_FAKE_TOOLS_CALL,
  COMPUTER_FAKE_TOOLS_LIST,
  COMPUTER_FAKE_VERSION,
} from "./constants"
import { COMPUTER_FAKE_REQUEST_SCHEMA } from "./schemas"
import { type ComputerFakeRequest, type ComputerFakeTool } from "./types"

function respond(request: ComputerFakeRequest): void {
  if (request.method === COMPUTER_FAKE_INITIALIZE) {
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: COMPUTER_FAKE_2_0, method: COMPUTER_FAKE_NOTIFICATIONS_MESSAGE, params: { level: COMPUTER_FAKE_INFO_LEVEL, data: COMPUTER_FAKE_SERVER_NAME } })}\n`,
    )
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: COMPUTER_FAKE_2_0, id: request.id, result: { protocolVersion: COMPUTER_FAKE_PROTOCOL, capabilities: {}, serverInfo: { name: COMPUTER_FAKE_SERVER_NAME, version: COMPUTER_FAKE_VERSION } } })}\n`,
    )
  } else if (request.method === COMPUTER_FAKE_TOOLS_LIST) {
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: COMPUTER_FAKE_2_0, id: request.id, result: { tools: COMPUTER_FAKE_TOOL_NAMES.map(makeTool) } })}\n`,
    )
  } else if (request.method === COMPUTER_FAKE_TOOLS_CALL) {
    respondCall(request)
  }
}

function makeTool(name: string): ComputerFakeTool {
  return {
    name,
    inputSchema: {
      properties: {
        element_token: { type: COMPUTER_FAKE_STRING_TYPE },
        delivery_mode: { type: COMPUTER_FAKE_STRING_TYPE },
        x: { type: COMPUTER_FAKE_INTEGER_TYPE },
      },
    },
  }
}

function respondCall(request: ComputerFakeRequest): void {
  const name = request.params?.name
  const log = process.env[COMPUTER_FAKE_LOG_VARIABLE]
  if (log) {
    appendFileSync(log, `${JSON.stringify(request)}\n`)
  }
  const scenario = process.env[COMPUTER_FAKE_SCENARIO_VARIABLE]
  const marker = process.env[COMPUTER_FAKE_MARKER_VARIABLE]
  if (name === COMPUTER_FAKE_CLICK && scenario === COMPUTER_FAKE_RPC_ERROR) {
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: COMPUTER_FAKE_2_0, id: request.id, error: { code: -32000, message: "Ação recusada pelo driver falso" } })}\n`,
    )
  } else if (
    name === COMPUTER_FAKE_LIST_WINDOWS &&
    scenario === COMPUTER_FAKE_DISCONNECT_ONCE &&
    marker &&
    !existsSync(marker)
  ) {
    writeFileSync(marker, "closed")
    process.exit(0)
  } else if (name === COMPUTER_FAKE_CLICK && scenario === COMPUTER_FAKE_DISCONNECT) {
    process.exit(0)
  } else if (name === COMPUTER_FAKE_LIST_WINDOWS && scenario === COMPUTER_FAKE_INVALID) {
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: COMPUTER_FAKE_2_0, id: request.id, result: { content: [{ type: "text", text: "{}" }], structuredContent: { windows: COMPUTER_FAKE_INVALID } } })}\n`,
    )
  } else {
    respondEnvelope(request)
  }
}

function respondEnvelope(request: ComputerFakeRequest): void {
  const name = request.params?.name
  const silent = name === COMPUTER_FAKE_CLICK && process.env[COMPUTER_FAKE_SCENARIO_VARIABLE] === COMPUTER_FAKE_TIMEOUT
  const structuredContent = {
    verified: true,
    message: "feito",
    windows:
      name === COMPUTER_FAKE_LIST_WINDOWS
        ? [{ app_name: "Editor", pid: 10, window_id: 20, is_on_screen: true, title: "Documento", z_index: 1 }]
        : [],
    apps:
      name === COMPUTER_FAKE_LIST_APPS
        ? [
            { name: "Editor", pid: 10, running: true },
            { name: "Installed", pid: 0, running: false, bundle_id: "com.installed" },
          ]
        : [],
    elements:
      name === COMPUTER_FAKE_GET_WINDOW_STATE
        ? [
            { element_index: 0, role: "AXWindow", element_token: "snapshot-0" },
            { element_index: 1, role: "AXButton", label: "Salvar", element_token: "snapshot-1" },
          ]
        : [],
    tree_markdown: 'AXWindow "Documento"\n[1] AXButton "Salvar"',
  }
  if (!silent) {
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: COMPUTER_FAKE_2_0, id: request.id, result: { content: [], structuredContent, isError: false } })}\n`,
    )
  }
}

function onLine(line: string): void {
  respond(Value.Parse(COMPUTER_FAKE_REQUEST_SCHEMA, JSON.parse(line)))
}

function main(): void {
  if (process.argv.includes(COMPUTER_FAKE_MANIFEST)) {
    process.stdout.write(
      JSON.stringify({
        binary_version: COMPUTER_FAKE_VERSION,
        mcp_invocation: { command: process.execPath, args: [] },
      }),
    )
  } else if (process.argv.includes(COMPUTER_FAKE_CALL)) {
    process.stdout.write(JSON.stringify({ content: [], structuredContent: { message: "feito", verified: true } }))
  } else {
    createInterface({ input: process.stdin }).on(COMPUTER_FAKE_LINE, onLine)
  }
}

main()
