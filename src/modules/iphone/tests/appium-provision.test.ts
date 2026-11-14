import { mkdtemp, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  checkIphoneProvisionNode,
  IPHONE_PROVISION_ACTIVE,
  IPHONE_PROVISION_DIRECTORY,
  IphoneProvisionInterrupted,
  provisionIphoneAppium,
} from "#synapse/modules/iphone/adapters/appium-provision"
import { IphoneProvisionExecutorDouble } from "./appium-provision-support"

let directory = ""
let executor = new IphoneProvisionExecutorDouble()

async function prepare(): Promise<void> {
  directory = await mkdtemp(join(tmpdir(), "synapse-appium-provision-"))
  executor = new IphoneProvisionExecutorDouble()
}

async function dispose(): Promise<void> {
  await rm(directory, { recursive: true, force: true })
}

async function provision(signal: AbortSignal): Promise<string> {
  const result = await provisionIphoneAppium(
    {
      stateDirectory: directory,
      path: "",
      host: "darwin",
    },
    signal,
    executor.execute.bind(executor),
  )
  return result.executable
}

async function installsPinnedStack(): Promise<void> {
  const executable = await provision(new AbortController().signal)
  expect(executable).toContain("/home/node_modules/appium/index.js")
  expect(executor.commands.map((command) => command.arguments)).toContainEqual(expect.arrayContaining(["appium@3.9.0"]))
  expect(executor.commands.map((command) => command.arguments)).toContainEqual(
    expect.arrayContaining(["xcuitest@12.22.8"]),
  )
  expect(executor.commands.every((command) => command.environment.APPIUM_HOME === command.directory)).toBe(true)
}

async function reusesWithoutCommands(): Promise<void> {
  const first = await provision(new AbortController().signal)
  const count = executor.commands.length
  expect(await provision(new AbortController().signal)).toBe(first)
  expect(executor.commands).toHaveLength(count)
}

async function rejectsBadIntegrity(): Promise<void> {
  executor.wrongIntegrity = true
  await expect(provision(new AbortController().signal)).rejects.toThrow()
  await expect(readFile(join(directory, IPHONE_PROVISION_DIRECTORY, IPHONE_PROVISION_ACTIVE))).rejects.toThrow()
}

async function rejectsOldNpm(): Promise<void> {
  executor.npmVersion = "9.9.0"
  await expect(provision(new AbortController().signal)).rejects.toThrow("npm >=10")
  expect(executor.commands).toHaveLength(1)
}

async function rejectsSuccessfulIncompleteCommand(): Promise<void> {
  executor.incomplete = true
  await expect(provision(new AbortController().signal)).rejects.toThrow()
}

async function retriesInterruptedDownload(): Promise<void> {
  executor.fail = true
  await expect(provision(new AbortController().signal)).rejects.toThrow("download failed")
  executor.fail = false
  expect(await provision(new AbortController().signal)).toContain("appium/index.js")
}

async function doesNotRepairCorruptWinner(): Promise<void> {
  const executable = await provision(new AbortController().signal)
  await writeFile(executable, "corrupt")
  const count = executor.commands.length
  await expect(provision(new AbortController().signal)).rejects.toThrow()
  expect(executor.commands).toHaveLength(count)
  expect(await readFile(executable, "utf8")).toBe("corrupt")
}

async function concurrentFactoriesChooseOneWinner(): Promise<void> {
  const signal = new AbortController().signal
  const results = await Promise.all([provision(signal), provision(signal)])
  expect(results[0]).toBe(results[1])
  const active = join(directory, IPHONE_PROVISION_DIRECTORY, IPHONE_PROVISION_ACTIVE)
  expect((await readFile(active, "utf8")).length).toBeGreaterThan(0)
  expect(await readdir(join(directory, IPHONE_PROVISION_DIRECTORY))).toHaveLength(2)
}

async function explicitHomeRemainsUntouched(): Promise<void> {
  const home = join(directory, "external")
  await expect(
    provisionIphoneAppium(
      {
        stateDirectory: directory,
        path: "",
        host: "darwin",
        appiumHome: home,
      },
      new AbortController().signal,
      executor.execute.bind(executor),
    ),
  ).rejects.toThrow("explicitamente")
  expect(await readdir(directory)).toStrictEqual([])
  expect(executor.commands).toHaveLength(0)
}

async function rejectsPointerTraversal(): Promise<void> {
  await provision(new AbortController().signal)
  await writeFile(
    join(directory, IPHONE_PROVISION_DIRECTORY, IPHONE_PROVISION_ACTIVE),
    '{"installation":"../outside","files":[]}',
  )
  const count = executor.commands.length
  await expect(provision(new AbortController().signal)).rejects.toThrow()
  expect(executor.commands).toHaveLength(count)
}

async function refusesSymlinkManagedRoot(): Promise<void> {
  await symlink(directory, join(directory, IPHONE_PROVISION_DIRECTORY))
  await expect(provision(new AbortController().signal)).rejects.toThrow()
  expect(executor.commands).toHaveLength(0)
}

async function cancellationNeverPublishesPartial(): Promise<void> {
  const controller = new AbortController()
  executor.abortAfterProbe = controller
  await expect(provision(controller.signal)).rejects.toThrow()
  await expect(readFile(join(directory, IPHONE_PROVISION_DIRECTORY, IPHONE_PROVISION_ACTIVE))).rejects.toThrow()
}

function rejectsUnsupportedNode(): void {
  expect(() => checkIphoneProvisionNode("20.18.0")).toThrow("Node.js")
  expect(() => checkIphoneProvisionNode("22.11.0")).toThrow("Node.js")
  expect(() => checkIphoneProvisionNode("garbage")).toThrow("Node.js")
}

async function uncertainInterruptionPreservesOrphan(): Promise<void> {
  await expect(
    provisionIphoneAppium(
      { stateDirectory: directory, path: "", host: "darwin" },
      new AbortController().signal,
      interruptProvision,
    ),
  ).rejects.toThrow()
  const entries = await readdir(join(directory, IPHONE_PROVISION_DIRECTORY))
  expect(entries).toHaveLength(1)
  expect(entries).not.toContain(IPHONE_PROVISION_ACTIVE)
}

async function interruptProvision(): Promise<never> {
  throw new IphoneProvisionInterrupted("cancelamento solicitado", directory)
}

function acceptsSupportedNode(): void {
  expect(() => checkIphoneProvisionNode("24.22.1")).not.toThrow()
}

function suite(): void {
  beforeEach(prepare)
  afterEach(dispose)
  test("instala versões fixas por npm e Appium oficiais", installsPinnedStack)
  test("reutiliza pronto sem CLI nem download", reusesWithoutCommands)
  test("recusa integridade diferente sem publicar", rejectsBadIntegrity)
  test("recusa npm incompatível antes do install", rejectsOldNpm)
  test("não confunde exit zero com instalação pronta", rejectsSuccessfulIncompleteCommand)
  test("repete após download interrompido sem usar parcial", retriesInterruptedDownload)
  test("não repara instalação publicada corrompida", doesNotRepairCorruptWinner)
  test("duas factories publicam um único vencedor", concurrentFactoriesChooseOneWinner)
  test("preserva APPIUM_HOME explícito", explicitHomeRemainsUntouched)
  test("recusa travessia no ponteiro", rejectsPointerTraversal)
  test("recusa root gerenciado simbólico", refusesSymlinkManagedRoot)
  test("cancelamento antes de pronto não publica", cancellationNeverPublishesPartial)
  test("recusa Node incompatível", rejectsUnsupportedNode)
  test("aceita faixa Node compatível declarada", acceptsSupportedNode)
  test("preserva parcial quando término da árvore é incerto", uncertainInterruptionPreservesOrphan)
}

describe("provisionamento privado do Appium", suite)
