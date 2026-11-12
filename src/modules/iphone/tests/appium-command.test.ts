import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  findIphoneAppium,
  IPHONE_APPIUM_HOME_VARIABLE,
  IPHONE_APPIUM_NOT_FOUND,
  IPHONE_APPIUM_TASKKILL,
  IPHONE_APPIUM_TASKKILL_FORCE_FLAG,
  IPHONE_APPIUM_TASKKILL_PID_FLAG,
  IPHONE_APPIUM_TASKKILL_TREE_FLAG,
  IPHONE_APPIUM_WINDOWS_PERCENT_MESSAGE,
  iphoneAppiumCommand,
  iphoneAppiumEnvironment,
  iphoneAppiumKillCommand,
  terminateIphoneAppiumTree,
} from "#synapse/modules/iphone/adapters/appium-process"
import { IphoneAppiumExecutorDouble } from "./appium-executor-double"
import {
  IPHONE_APPIUM_TEST_BIN_DIRECTORY,
  IPHONE_APPIUM_TEST_EXECUTABLE_MODE,
  IPHONE_APPIUM_TEST_SERVER_SCRIPT,
  iphoneAppiumTestHost,
  iphoneAppiumTestScriptName,
  writeIphoneAppiumScript,
} from "./appium-process-support"

const APP_POSIX_EXECUTABLE = join("ferramentas", "appium")

const APP_WINDOWS_EXECUTABLE = "C:\\ferramentas\\appium.cmd"

const APP_WINDOWS_SPACED_EXECUTABLE = "C:\\Program Files\\cua&appium\\appium.cmd"

const APP_WINDOWS_PERCENT_EXECUTABLE = "C:\\a%20b\\appium.cmd"

const APP_WINDOWS_BINARY = "C:\\ferramentas\\cua-driver.exe"

const APP_ARGUMENTS = ["--port", "4723", "--log-timestamp"]

const WINDOWS_BATCH_SCRIPT = "appium.bat"

let directory = ""
let binDirectory = ""

function prepareDirectories(): void {
  directory = mkdtempSync(join(tmpdir(), "iphone-appium-command-"))
  binDirectory = join(directory, IPHONE_APPIUM_TEST_BIN_DIRECTORY)
  writeIphoneAppiumScript(binDirectory, iphoneAppiumTestHost(), IPHONE_APPIUM_TEST_SERVER_SCRIPT)
}

function findsAppium(): void {
  const host = iphoneAppiumTestHost()
  expect(findIphoneAppium(binDirectory, host)).toBe(join(binDirectory, iphoneAppiumTestScriptName(host)))
}

function findsWindowsBatch(): void {
  const batchDirectory = join(directory, "windows")
  mkdirSync(batchDirectory, { recursive: true })
  const script = join(batchDirectory, WINDOWS_BATCH_SCRIPT)
  writeFileSync(script, "")
  chmodSync(script, IPHONE_APPIUM_TEST_EXECUTABLE_MODE)
  expect(findIphoneAppium(batchDirectory, "win32")).toBe(script)
}

function refusesMissingAppium(): void {
  const emptyDirectory = join(directory, "vazio")
  mkdirSync(emptyDirectory, { recursive: true })
  expect(() => findIphoneAppium(emptyDirectory, iphoneAppiumTestHost())).toThrow(IPHONE_APPIUM_NOT_FOUND)
}

function buildsPosixCommand(): void {
  expect(iphoneAppiumCommand(APP_POSIX_EXECUTABLE, APP_ARGUMENTS, "linux")).toStrictEqual({
    command: APP_POSIX_EXECUTABLE,
    arguments: APP_ARGUMENTS,
  })
}

function buildsWindowsCommand(): void {
  expect(iphoneAppiumCommand(APP_WINDOWS_EXECUTABLE, APP_ARGUMENTS, "win32")).toStrictEqual({
    command: "cmd.exe",
    arguments: ["/d", "/s", "/c", `""${APP_WINDOWS_EXECUTABLE}" "--port" "4723" "--log-timestamp""`],
  })
}

function quotesWindowsPathWithSpaceAndAmpersand(): void {
  expect(iphoneAppiumCommand(APP_WINDOWS_SPACED_EXECUTABLE, APP_ARGUMENTS, "win32")).toStrictEqual({
    command: "cmd.exe",
    arguments: ["/d", "/s", "/c", `""${APP_WINDOWS_SPACED_EXECUTABLE}" "--port" "4723" "--log-timestamp""`],
  })
}

function refusesWindowsPercentPath(): void {
  expect(() => iphoneAppiumCommand(APP_WINDOWS_PERCENT_EXECUTABLE, APP_ARGUMENTS, "win32")).toThrow(
    IPHONE_APPIUM_WINDOWS_PERCENT_MESSAGE,
  )
}

function keepsWindowsBinaryWithoutShell(): void {
  expect(iphoneAppiumCommand(APP_WINDOWS_BINARY, APP_ARGUMENTS, "win32")).toStrictEqual({
    command: APP_WINDOWS_BINARY,
    arguments: APP_ARGUMENTS,
  })
}

function addsAppiumHomeToEnvironment(): void {
  expect(iphoneAppiumEnvironment("/opt/appium")[IPHONE_APPIUM_HOME_VARIABLE]).toBe("/opt/appium")
}

function keepsEnvironmentWithoutAppiumHome(): void {
  expect(iphoneAppiumEnvironment()[IPHONE_APPIUM_HOME_VARIABLE]).toBeUndefined()
}

function buildsKillCommand(): void {
  expect(iphoneAppiumKillCommand(4242)).toStrictEqual({
    command: IPHONE_APPIUM_TASKKILL,
    arguments: [
      IPHONE_APPIUM_TASKKILL_PID_FLAG,
      "4242",
      IPHONE_APPIUM_TASKKILL_TREE_FLAG,
      IPHONE_APPIUM_TASKKILL_FORCE_FLAG,
    ],
  })
}

async function terminatesTreeThroughExecutor(): Promise<void> {
  const executor = new IphoneAppiumExecutorDouble()
  await terminateIphoneAppiumTree(4242, executor.execute.bind(executor))
  expect(executor.calls).toStrictEqual([
    {
      command: IPHONE_APPIUM_TASKKILL,
      arguments: [
        IPHONE_APPIUM_TASKKILL_PID_FLAG,
        "4242",
        IPHONE_APPIUM_TASKKILL_TREE_FLAG,
        IPHONE_APPIUM_TASKKILL_FORCE_FLAG,
      ],
    },
  ])
}

function registerTests(): void {
  test("acha o Appium no PATH informado", findsAppium)
  test("acha o Appium com extensão .bat no Windows", findsWindowsBatch)
  test("recusa PATH sem Appium", refusesMissingAppium)
  test("monta o comando em POSIX", buildsPosixCommand)
  test("monta o comando de script no Windows", buildsWindowsCommand)
  test("cita caminho do Windows com espaço e &", quotesWindowsPathWithSpaceAndAmpersand)
  test("recusa caminho do Windows com %", refusesWindowsPercentPath)
  test("chama binário .exe do Windows sem shell", keepsWindowsBinaryWithoutShell)
  test("define APPIUM_HOME no ambiente do processo", addsAppiumHomeToEnvironment)
  test("não define APPIUM_HOME sem configuração", keepsEnvironmentWithoutAppiumHome)
  test("monta o encerramento da árvore no Windows", buildsKillCommand)
  test("encerra a árvore pelo executor injetado", terminatesTreeThroughExecutor)
}

describe("comando do Appium", () => {
  beforeEach(prepareDirectories)
  afterEach(() => rmSync(directory, { recursive: true, force: true }))
  registerTests()
})
