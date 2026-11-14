import * as fileSystem from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { IphoneAppiumProcess, runIphoneAppiumCommand } from "#synapse/modules/iphone/adapters/appium-process"
import {
  IPHONE_PROVISION_FILE_BYTES,
  IPHONE_PROVISION_INVALID_INSTALLATION,
  provisionIphoneAppium,
  readIphoneProvisionFile,
} from "#synapse/modules/iphone/adapters/appium-provision"
import { startIphoneServer } from "#synapse/modules/iphone/adapters/webdriver-http"
import { IPHONE_APPIUM_TEST_SERVER_SCRIPT, writeIphoneAppiumScript } from "./appium-process-support"
import * as scenario from "./appium-provision-boundaries-constants"
import { IphoneProvisionExecutorDouble } from "./appium-provision-support"
import { TestIphoneHttpServer } from "./doubles"

vi.mock("node:fs/promises", { spy: true })

let directory = ""
let http = new TestIphoneHttpServer()
let appium = new IphoneAppiumProcess(runIphoneAppiumCommand)
let base = ""

async function prepare(): Promise<void> {
  directory = await fileSystem.mkdtemp(join(tmpdir(), "synapse-appium-boundaries-"))
  http = new TestIphoneHttpServer()
  base = await http.start()
  appium = new IphoneAppiumProcess(runIphoneAppiumCommand)
}

async function dispose(): Promise<void> {
  vi.restoreAllMocks()
  await appium.stop()
  await http.stop()
  await fileSystem.rm(directory, { recursive: true, force: true })
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
  expect(await fileSystem.readdir(directory)).toStrictEqual([])
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
  expect(await fileSystem.readdir(directory)).toStrictEqual([])
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
  expect(await fileSystem.readdir(directory)).toStrictEqual(["bin"])
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
  expect(await fileSystem.readdir(directory)).toStrictEqual([])
}

async function forbiddenSimulatorCommand(): Promise<never> {
  throw new Error(scenario.IPHONE_PROVISION_BOUNDARY_FORBIDDEN_SIMULATOR)
}

async function readsSmallFileWithoutMaximumAllocation(): Promise<void> {
  const content = Buffer.from(scenario.IPHONE_PROVISION_BOUNDARY_SMALL_CONTENT)
  await fileSystem.writeFile(join(directory, "receipt"), content)
  const allocation = vi.spyOn(Buffer, "alloc")
  const read = await readIphoneProvisionFile(directory, "receipt")
  expect(read.equals(content)).toBe(true)
  expect(allocation).toHaveBeenCalledWith(content.length + 1)
  expect(allocation).not.toHaveBeenCalledWith(IPHONE_PROVISION_FILE_BYTES + 1)
}

async function readsGrowthAfterStatCompletely(): Promise<void> {
  const path = join(directory, "receipt")
  await fileSystem.writeFile(path, "x")
  const initial = await fileSystem.lstat(path)
  const root = await fileSystem.lstat(directory)
  const content = Buffer.alloc(IPHONE_PROVISION_FILE_BYTES, "x")
  await fileSystem.writeFile(path, content)
  vi.spyOn(fileSystem, "lstat").mockResolvedValueOnce(root).mockResolvedValueOnce(initial)
  const read = await readIphoneProvisionFile(directory, "receipt")
  expect(read.equals(content)).toBe(true)
  content[content.length - 1] = 0
  expect(read.equals(content)).toBe(false)
}

async function rejectsGrowthBeyondLimitAfterStat(): Promise<void> {
  const path = join(directory, "receipt")
  await fileSystem.writeFile(path, "x")
  const initial = await fileSystem.lstat(path)
  const root = await fileSystem.lstat(directory)
  await fileSystem.writeFile(path, Buffer.alloc(IPHONE_PROVISION_FILE_BYTES + 1, "x"))
  vi.spyOn(fileSystem, "lstat").mockResolvedValueOnce(root).mockResolvedValueOnce(initial)
  await expect(readIphoneProvisionFile(directory, "receipt")).rejects.toThrow(IPHONE_PROVISION_INVALID_INSTALLATION)
}

function suite(): void {
  beforeEach(prepare)
  afterEach(dispose)
  test(scenario.IPHONE_PROVISION_BOUNDARY_SMALL_FILE_TEST, readsSmallFileWithoutMaximumAllocation)
  test(scenario.IPHONE_PROVISION_BOUNDARY_GROWING_FILE_TEST, readsGrowthAfterStatCompletely)
  test(scenario.IPHONE_PROVISION_BOUNDARY_OVERSIZED_FILE_TEST, rejectsGrowthBeyondLimitAfterStat)
  test(scenario.IPHONE_PROVISION_BOUNDARY_LOCAL_SERVER_TEST, existingServerRemainsUntouched)
  test(scenario.IPHONE_PROVISION_BOUNDARY_REMOTE_SERVER_TEST, remoteServerRemainsUntouched)
  test(scenario.IPHONE_PROVISION_BOUNDARY_EXISTING_EXECUTABLE_TEST, existingExecutablePreserved)
  test(scenario.IPHONE_PROVISION_BOUNDARY_REMOTE_READY_TEST, remoteBecomesReadyWithoutLocalInstallation)
}

describe(scenario.IPHONE_PROVISION_BOUNDARY_SUITE, suite)
