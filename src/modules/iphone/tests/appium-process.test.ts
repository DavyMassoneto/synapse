import { spawn } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  IPHONE_APPIUM_LOG_FILE,
  IPHONE_APPIUM_REMOTE,
  IPHONE_APPIUM_STARTED,
  IPHONE_APPIUM_WINDOWS,
  IphoneAppiumProcess,
  iphoneAppiumCommand,
  runIphoneAppiumCommand,
} from "#synapse/modules/iphone/adapters/appium-process"
import {
  IPHONE_APPIUM_TEST_ARGUMENT_FILE,
  IPHONE_APPIUM_TEST_BIN_DIRECTORY,
  IPHONE_APPIUM_TEST_CRASH_SCRIPT,
  IPHONE_APPIUM_TEST_EXIT_GRACE_MS,
  IPHONE_APPIUM_TEST_HOME_FILE,
  IPHONE_APPIUM_TEST_MARKER_FILE,
  IPHONE_APPIUM_TEST_POLL_MS,
  IPHONE_APPIUM_TEST_PORT_DEADLINE_MS,
  IPHONE_APPIUM_TEST_SERVER_SCRIPT,
  IPHONE_APPIUM_TEST_SPACED_ARGUMENT,
  IPHONE_APPIUM_TEST_STOP_LIMIT_MS,
  IPHONE_APPIUM_TEST_UNREACHABLE,
  iphoneAppiumTestHost,
  iphoneAppiumTestScriptName,
  readIphoneAppiumArguments,
  reserveIphoneAppiumTestPort,
  sleepIphoneAppiumTest,
  writeIphoneAppiumScript,
} from "./appium-process-support"
import { type IphoneAppiumProcessSut } from "./types"

let sut: IphoneAppiumProcessSut

async function makeSut(): Promise<IphoneAppiumProcessSut> {
  const directory = mkdtempSync(join(tmpdir(), "iphone-appium-process-"))
  const binDirectory = join(directory, IPHONE_APPIUM_TEST_BIN_DIRECTORY)
  const stateDirectory = join(directory, "estado")
  const host = iphoneAppiumTestHost()
  writeIphoneAppiumScript(binDirectory, host, IPHONE_APPIUM_TEST_SERVER_SCRIPT)
  const port = await reserveIphoneAppiumTestPort()
  return {
    appium: new IphoneAppiumProcess(runIphoneAppiumCommand),
    directory,
    stateDirectory,
    binDirectory,
    port,
    host,
  }
}

async function prepare(): Promise<void> {
  sut = await makeSut()
}

async function dispose(): Promise<void> {
  await sut.appium.stop()
  rmSync(sut.directory, { recursive: true, force: true })
}

function serverUrl(): string {
  return `http://127.0.0.1:${sut.port}`
}

async function isReachable(url: string): Promise<boolean> {
  return fetch(url).then(
    () => true,
    () => false,
  )
}

async function waitForPort(url: string): Promise<void> {
  const deadline = Date.now() + IPHONE_APPIUM_TEST_PORT_DEADLINE_MS
  let ready = await isReachable(url)
  while (!ready && Date.now() < deadline) {
    await sleepIphoneAppiumTest(IPHONE_APPIUM_TEST_POLL_MS)
    ready = await isReachable(url)
  }
  if (!ready) {
    throw new Error(IPHONE_APPIUM_TEST_UNREACHABLE)
  }
}

async function waitForMarker(marker: string): Promise<void> {
  const deadline = Date.now() + IPHONE_APPIUM_TEST_PORT_DEADLINE_MS
  let found = existsSync(marker)
  while (!found && Date.now() < deadline) {
    await sleepIphoneAppiumTest(IPHONE_APPIUM_TEST_POLL_MS)
    found = existsSync(marker)
  }
  if (!found) {
    throw new Error(IPHONE_APPIUM_TEST_UNREACHABLE)
  }
}

async function startsFromDirectoryWithSpaceAndAmpersand(): Promise<void> {
  expect(sut.appium.start(serverUrl(), sut.stateDirectory, sut.binDirectory, sut.host)).toStrictEqual({
    kind: IPHONE_APPIUM_STARTED,
  })
  await waitForPort(serverUrl())
  const response = await fetch(serverUrl())
  expect(await response.text()).toBe("ok")
  expect(readFileSync(join(sut.stateDirectory, IPHONE_APPIUM_LOG_FILE), "utf8")).toContain("fake appium")
  const received = readIphoneAppiumArguments(sut.binDirectory)
  expect(received[1]?.replaceAll("\\", "/")).toContain("appium fake & co")
  expect(received.slice(2)).toStrictEqual(["--port", String(sut.port), "--log-timestamp"])
}

async function passesAppiumHome(): Promise<void> {
  const home = join(sut.directory, "appium-home")
  sut.appium.start(serverUrl(), sut.stateDirectory, sut.binDirectory, sut.host, home)
  await waitForPort(serverUrl())
  expect(readFileSync(join(sut.binDirectory, IPHONE_APPIUM_TEST_HOME_FILE), "utf8")).toBe(home)
}

async function passesSpacedArgumentAsSingleToken(): Promise<void> {
  const directory = join(sut.directory, "argumento")
  writeIphoneAppiumScript(directory, sut.host, IPHONE_APPIUM_TEST_SERVER_SCRIPT)
  const port = await reserveIphoneAppiumTestPort()
  const command = iphoneAppiumCommand(
    join(directory, iphoneAppiumTestScriptName(sut.host)),
    ["--port", String(port), IPHONE_APPIUM_TEST_SPACED_ARGUMENT],
    sut.host,
  )
  const child = spawn(command.command, command.arguments, {
    stdio: "ignore",
    windowsHide: sut.host === IPHONE_APPIUM_WINDOWS,
    windowsVerbatimArguments: sut.host === IPHONE_APPIUM_WINDOWS,
  })
  try {
    await waitForMarker(join(directory, IPHONE_APPIUM_TEST_ARGUMENT_FILE))
    expect(readIphoneAppiumArguments(directory).slice(2)).toStrictEqual([
      "--port",
      String(port),
      IPHONE_APPIUM_TEST_SPACED_ARGUMENT,
    ])
  } finally {
    child.kill()
  }
}

function keepsRemoteServer(): void {
  expect(sut.appium.start("http://10.0.0.7:4723", sut.stateDirectory, sut.binDirectory, sut.host)).toStrictEqual({
    kind: IPHONE_APPIUM_REMOTE,
  })
  expect(existsSync(join(sut.stateDirectory, IPHONE_APPIUM_LOG_FILE))).toBe(false)
}

async function stopsProcess(): Promise<void> {
  sut.appium.start(serverUrl(), sut.stateDirectory, sut.binDirectory, sut.host)
  await waitForPort(serverUrl())
  await sut.appium.stop()
  expect(await isReachable(serverUrl())).toBe(false)
}

async function stopsTwice(): Promise<void> {
  sut.appium.start(serverUrl(), sut.stateDirectory, sut.binDirectory, sut.host)
  await waitForPort(serverUrl())
  await sut.appium.stop()
  await expect(sut.appium.stop()).resolves.toBeUndefined()
}

async function stopsExitedChild(): Promise<void> {
  const directory = join(sut.directory, "falha")
  writeIphoneAppiumScript(directory, sut.host, IPHONE_APPIUM_TEST_CRASH_SCRIPT)
  sut.appium.start(serverUrl(), sut.stateDirectory, directory, sut.host)
  await waitForMarker(join(directory, IPHONE_APPIUM_TEST_MARKER_FILE))
  await sleepIphoneAppiumTest(IPHONE_APPIUM_TEST_EXIT_GRACE_MS)
  const started = Date.now()
  await sut.appium.stop()
  expect(Date.now() - started).toBeLessThan(IPHONE_APPIUM_TEST_STOP_LIMIT_MS)
}

function registerTests(): void {
  test("sobe o Appium falso de uma pasta com espaço e &", startsFromDirectoryWithSpaceAndAmpersand)
  test("entrega o APPIUM_HOME ao processo", passesAppiumHome)
  test("entrega argumento com espaço como um só token", passesSpacedArgumentAsSingleToken)
  test("não sobe processo para servidor remoto", keepsRemoteServer)
  test("para o processo e libera a porta", stopsProcess)
  test("parar duas vezes não falha", stopsTwice)
  test("para sem esperar o prazo quando o filho já morreu", stopsExitedChild)
}

describe("processo do Appium", () => {
  beforeEach(prepare)
  afterEach(dispose)
  registerTests()
})
