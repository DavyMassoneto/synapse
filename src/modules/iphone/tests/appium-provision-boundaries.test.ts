import { mkdtemp, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { IphoneAppiumProcess, runIphoneAppiumCommand } from "#synapse/modules/iphone/adapters/appium-process"
import { provisionIphoneAppium } from "#synapse/modules/iphone/adapters/appium-provision"
import { startIphoneServer } from "#synapse/modules/iphone/adapters/webdriver-http"
import { IPHONE_APPIUM_TEST_SERVER_SCRIPT, writeIphoneAppiumScript } from "./appium-process-support"
import { IphoneProvisionExecutorDouble } from "./appium-provision-support"
import { TestIphoneHttpServer } from "./doubles"

let directory = ""
let http = new TestIphoneHttpServer()
let appium = new IphoneAppiumProcess(runIphoneAppiumCommand)
let base = ""

async function prepare(): Promise<void> {
  directory = await mkdtemp(join(tmpdir(), "synapse-appium-boundaries-"))
  http = new TestIphoneHttpServer()
  base = await http.start()
  appium = new IphoneAppiumProcess(runIphoneAppiumCommand)
}

async function dispose(): Promise<void> {
  vi.restoreAllMocks()
  await appium.stop()
  await http.stop()
  await rm(directory, { recursive: true, force: true })
}

async function existingServerRemainsUntouched(): Promise<void> {
  http.response = '{"value":{"ready":true}}'
  await startIphoneServer(
    {
      serverUrl: base,
      target: { kind: "device", udid: "test", deviceName: "test", wdaInstalled: true },
    },
    {
      stateDirectory: directory,
      configPath: join(directory, "config.json"),
      path: "",
      host: "darwin",
      executeSimulatorCommand: forbiddenSimulatorCommand,
    },
    appium,
    new AbortController().signal,
  )
  expect(await readdir(directory)).toStrictEqual([])
  expect(http.paths).toStrictEqual(["/status"])
}

async function remoteServerRemainsUntouched(): Promise<void> {
  const controller = new AbortController()
  controller.abort()
  await expect(
    startIphoneServer(
      {
        serverUrl: "http://192.0.2.1:4723",
        target: { kind: "device", udid: "test", deviceName: "test", wdaInstalled: true },
      },
      {
        stateDirectory: directory,
        configPath: join(directory, "config.json"),
        path: "",
        host: "darwin",
        executeSimulatorCommand: forbiddenSimulatorCommand,
      },
      appium,
      controller.signal,
    ),
  ).rejects.toThrow()
  expect(await readdir(directory)).toStrictEqual([])
}

async function existingExecutablePreserved(): Promise<void> {
  const bin = join(directory, "bin")
  const state = join(directory, "state")
  writeIphoneAppiumScript(bin, "darwin", IPHONE_APPIUM_TEST_SERVER_SCRIPT)
  const execute = new IphoneProvisionExecutorDouble()
  const installation = await provisionIphoneAppium(
    {
      stateDirectory: state,
      path: bin,
      host: "darwin",
      appiumHome: join(directory, "external-home"),
    },
    new AbortController().signal,
    execute.execute.bind(execute),
  )
  expect(installation.executable).toBe(join(bin, "appium"))
  expect(installation.appiumHome).toBe(join(directory, "external-home"))
  expect(execute.commands).toHaveLength(0)
  expect(await readdir(directory)).toStrictEqual(["bin"])
}

async function remoteBecomesReadyWithoutLocalInstallation(): Promise<void> {
  const request = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response('{"value":{"ready":false}}', { status: 503 }))
    .mockResolvedValue(new Response('{"value":{"ready":true}}', { status: 200 }))
  await startIphoneServer(
    {
      serverUrl: "http://192.0.2.1:4723",
      target: { kind: "device", udid: "test", deviceName: "test", wdaInstalled: true },
    },
    {
      stateDirectory: directory,
      configPath: join(directory, "config.json"),
      path: "",
      host: "darwin",
      executeSimulatorCommand: forbiddenSimulatorCommand,
    },
    appium,
    new AbortController().signal,
  )
  expect(request.mock.calls.length).toBeGreaterThan(1)
  expect(await readdir(directory)).toStrictEqual([])
}

async function forbiddenSimulatorCommand(): Promise<never> {
  throw new Error("simulator command must not run")
}

function suite(): void {
  beforeEach(prepare)
  afterEach(dispose)
  test("não altera servidor local ativo", existingServerRemainsUntouched)
  test("não instala dependências para remoto", remoteServerRemainsUntouched)
  test("preserva Appium e home explícitos existentes", existingExecutablePreserved)
  test("remoto indisponível fica pronto sem instalação local", remoteBecomesReadyWithoutLocalInstallation)
}

describe("fronteiras do provisionamento Appium", suite)
