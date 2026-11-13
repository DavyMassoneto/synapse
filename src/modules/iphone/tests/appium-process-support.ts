import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createServer } from "node:net"
import { join } from "node:path"
import { Type } from "typebox"
import { Value } from "typebox/value"
import { IPHONE_APPIUM_WINDOWS } from "#synapse/modules/iphone/adapters/appium-process"
import { IPHONE_MACOS, type IphoneHost } from "#synapse/modules/iphone/public/contracts"

export const IPHONE_APPIUM_TEST_PACKAGE_FILE = "package.json"

export const IPHONE_APPIUM_TEST_PACKAGE_CONTENT = '{"type":"commonjs"}'

export const IPHONE_APPIUM_TEST_SCRIPT_NAME = "appium"

export const IPHONE_APPIUM_TEST_WINDOWS_SCRIPT_NAME = "appium.cmd"

export const IPHONE_APPIUM_TEST_WINDOWS_MODULE_NAME = "appium.js"

export const IPHONE_APPIUM_TEST_SHEBANG = "#!/usr/bin/env node\n"

export const IPHONE_APPIUM_TEST_WINDOWS_WRAPPER = '@echo off\nnode "%~dp0appium.js" %*\n'

export const IPHONE_APPIUM_TEST_EXECUTABLE_MODE = 0o755

export const IPHONE_APPIUM_TEST_MARKER_FILE = "crash-marker"

export const IPHONE_APPIUM_TEST_ARGUMENT_FILE = "argv.json"

export const IPHONE_APPIUM_TEST_HOME_FILE = "appium-home.txt"

export const IPHONE_APPIUM_TEST_ARGUMENT_SCHEMA = Type.Array(Type.String())

export const IPHONE_APPIUM_TEST_BIN_DIRECTORY = "appium fake & co"

export const IPHONE_APPIUM_TEST_SPACED_ARGUMENT = "valor com espaço"

export const IPHONE_APPIUM_TEST_POLL_MS = 50

export const IPHONE_APPIUM_TEST_PORT_DEADLINE_MS = 15_000

export const IPHONE_APPIUM_TEST_STOP_LIMIT_MS = 2000

export const IPHONE_APPIUM_TEST_EXIT_GRACE_MS = 200

export const IPHONE_APPIUM_TEST_UNREACHABLE = "O Appium falso não respondeu a tempo."

export const IPHONE_APPIUM_TEST_ADDRESS_FAILED = "Porta de teste indisponível."

export const IPHONE_APPIUM_TEST_SERVER_SCRIPT = `const fs = require("node:fs")
const http = require("node:http")
const path = require("node:path")
const args = process.argv.slice(2)
const port = Number(args[args.indexOf("--port") + 1])
fs.writeFileSync(path.join(__dirname, "${IPHONE_APPIUM_TEST_ARGUMENT_FILE}"), JSON.stringify(process.argv))
fs.writeFileSync(path.join(__dirname, "${IPHONE_APPIUM_TEST_HOME_FILE}"), process.env.APPIUM_HOME || "")
console.log("fake appium on " + port)
http.createServer((request, response) => {
  response.writeHead(200, { "content-type": "text/plain" })
  response.end("ok")
}).listen(port, "127.0.0.1")
`

export const IPHONE_APPIUM_TEST_CRASH_SCRIPT = `const fs = require("node:fs")
const path = require("node:path")
fs.writeFileSync(path.join(__dirname, "${IPHONE_APPIUM_TEST_MARKER_FILE}"), "")
process.exit(1)
`

export function iphoneAppiumTestHost(): IphoneHost {
  if (process.platform === "win32") {
    return IPHONE_APPIUM_WINDOWS
  }
  if (process.platform === IPHONE_MACOS) {
    return IPHONE_MACOS
  }
  return "linux"
}

export function iphoneAppiumTestScriptName(host: IphoneHost): string {
  return host === IPHONE_APPIUM_WINDOWS ? IPHONE_APPIUM_TEST_WINDOWS_SCRIPT_NAME : IPHONE_APPIUM_TEST_SCRIPT_NAME
}

export function writeIphoneAppiumScript(directory: string, host: IphoneHost, body: string): void {
  mkdirSync(directory, { recursive: true })
  writeFileSync(join(directory, IPHONE_APPIUM_TEST_PACKAGE_FILE), IPHONE_APPIUM_TEST_PACKAGE_CONTENT)
  if (host === IPHONE_APPIUM_WINDOWS) {
    writeFileSync(join(directory, IPHONE_APPIUM_TEST_WINDOWS_MODULE_NAME), body)
    writeFileSync(join(directory, IPHONE_APPIUM_TEST_WINDOWS_SCRIPT_NAME), IPHONE_APPIUM_TEST_WINDOWS_WRAPPER)
  } else {
    const script = join(directory, IPHONE_APPIUM_TEST_SCRIPT_NAME)
    writeFileSync(script, `${IPHONE_APPIUM_TEST_SHEBANG}${body}`)
    chmodSync(script, IPHONE_APPIUM_TEST_EXECUTABLE_MODE)
  }
}

export function readIphoneAppiumArguments(directory: string): string[] {
  const text = readFileSync(join(directory, IPHONE_APPIUM_TEST_ARGUMENT_FILE), "utf8")
  return Value.Parse(IPHONE_APPIUM_TEST_ARGUMENT_SCHEMA, JSON.parse(text))
}

export async function reserveIphoneAppiumTestPort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  const address = server.address()
  await new Promise<void>((resolve) => server.close(() => resolve()))
  if (!address || typeof address === "string") {
    throw new Error(IPHONE_APPIUM_TEST_ADDRESS_FAILED)
  }
  return address.port
}

export function sleepIphoneAppiumTest(milliseconds: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
}
