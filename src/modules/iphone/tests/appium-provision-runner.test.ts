import childProcess from "node:child_process"
import { once } from "node:events"
import { syncBuiltinESMExports } from "node:module"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { runIphoneProvisionCommand } from "#synapse/modules/iphone/adapters/appium-provision"
import { IphoneProvisionChildDouble } from "./appium-provision-runner-support"

let child = new IphoneProvisionChildDouble()
let terminator = new IphoneProvisionChildDouble()
let controller = new AbortController()

function prepare(): void {
  child = new IphoneProvisionChildDouble()
  terminator = new IphoneProvisionChildDouble()
  controller = new AbortController()
  vi.useFakeTimers()
}

function dispose(): void {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  syncBuiltinESMExports()
  vi.useRealTimers()
}

function run(executable: string): Promise<string> {
  const result = runIphoneProvisionCommand({
    executable,
    arguments: ["path with spaces/index.js"],
    directory: "/private/own-home",
    environment: {},
    signal: controller.signal,
  })
  return result.then(successText, failureText)
}

function successText(): string {
  return "success"
}

function failureText(error: Error): string {
  return error.message
}

function mockWindows(): void {
  vi.stubGlobal("process", { ...process, platform: "win32" })
}

async function nodeArgumentsRemainQuoted(): Promise<void> {
  const spawn = vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  syncBuiltinESMExports()
  const result = run("C:/Program Files/node/node.exe")
  Object.defineProperty(child, "exitCode", { value: 0 })
  child.emit("close")
  expect(await result).toBe("success")
  expect(spawn.mock.calls[0]?.[2]?.windowsVerbatimArguments).toBe(false)
}

async function cmdArgumentsRemainVerbatim(): Promise<void> {
  mockWindows()
  const spawn = vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  syncBuiltinESMExports()
  const result = run("cmd.exe")
  Object.defineProperty(child, "exitCode", { value: 0 })
  child.emit("close")
  expect(await result).toBe("success")
  expect(spawn.mock.calls[0]?.[2]?.windowsVerbatimArguments).toBe(true)
}

async function deniedKillSettlesUncertainty(): Promise<void> {
  vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  const kill = vi.spyOn(process, "kill").mockImplementation(denyKill)
  syncBuiltinESMExports()
  const result = run("node")
  controller.abort()
  expect(await result).toContain("término da árvore de processos é incerto")
  expect(await result).toContain("/private/own-home")
  expect(kill).toHaveBeenCalledTimes(1)
}

function denyKill(): never {
  throw new Error("EPERM secret-do-not-log")
}

async function missingCloseHasBoundedSettlement(): Promise<void> {
  vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  vi.spyOn(process, "kill").mockReturnValue(true)
  syncBuiltinESMExports()
  const unref = vi.spyOn(child, "unref")
  const result = run("node")
  controller.abort()
  await vi.advanceTimersByTimeAsync(1000)
  expect(await result).toContain("cancelamento solicitado")
  expect(child.stdout?.destroyed).toBe(true)
  expect(child.stderr?.destroyed).toBe(true)
  expect(child.stdout?.listenerCount("data")).toBe(0)
  expect(child.listenerCount("close")).toBe(0)
  expect(unref).toHaveBeenCalledTimes(1)
  child.emit("error", new Error("late error"))
  child.emit("close")
  expect(await result).toContain("incerto")
}

async function outputOverflowOnlyTerminatesOnce(): Promise<void> {
  vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  const kill = vi.spyOn(process, "kill").mockReturnValue(true)
  syncBuiltinESMExports()
  const result = run("node")
  child.stdout?.emit("data", "x".repeat(2_097_153))
  child.stdout?.emit("data", "x")
  child.stderr?.emit("data", "x")
  await vi.advanceTimersByTimeAsync(1000)
  expect(await result).toContain("limite de saída")
  expect(kill).toHaveBeenCalledTimes(1)
}

async function timeoutIdentifiesReason(): Promise<void> {
  vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  vi.spyOn(process, "kill").mockReturnValue(true)
  syncBuiltinESMExports()
  const result = run("node")
  await vi.advanceTimersByTimeAsync(601000)
  expect(await result).toContain("prazo do comando excedido")
}

async function taskkillErrorSettles(): Promise<void> {
  mockWindows()
  const spawn = vi.spyOn(childProcess, "spawn").mockReturnValueOnce(child).mockReturnValue(terminator)
  syncBuiltinESMExports()
  const result = run("node.exe")
  controller.abort()
  terminator.emit("error", new Error("secret failure"))
  child.stdout?.emit("data", "x".repeat(2_097_153))
  child.emit("close")
  expect(await result).toContain("incerto")
  expect(await result).not.toContain("secret failure")
  expect(spawn).toHaveBeenCalledTimes(2)
}

async function taskkillNonzeroSettles(): Promise<void> {
  mockWindows()
  vi.spyOn(childProcess, "spawn").mockReturnValueOnce(child).mockReturnValue(terminator)
  syncBuiltinESMExports()
  const result = run("node.exe")
  controller.abort()
  terminator.emit("close", 1)
  expect(await result).toContain("incerto")
}

async function livePosixChildReleasesLocalResources(): Promise<void> {
  vi.useRealTimers()
  const live = childProcess.spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  })
  const unref = vi.spyOn(live, "unref")
  vi.spyOn(childProcess, "spawn").mockReturnValue(live)
  vi.spyOn(process, "kill").mockImplementation(denyKill)
  syncBuiltinESMExports()
  try {
    const result = run("node")
    controller.abort()
    expect(await result).toContain("incerto")
    expect(live.exitCode).toBeNull()
    expect(live.killed).toBe(false)
    expect(live.stdout?.destroyed).toBe(true)
    expect(live.stderr?.destroyed).toBe(true)
    expect(live.stdout?.listenerCount("data")).toBe(0)
    expect(live.listenerCount("close")).toBe(0)
    expect(unref).toHaveBeenCalledTimes(1)
    live.emit("error", new Error("late error"))
  } finally {
    const closed = once(live, "close")
    live.kill("SIGKILL")
    await closed
  }
}

async function liveTerminatorHandleIsReleased(): Promise<void> {
  mockWindows()
  vi.spyOn(childProcess, "spawn").mockReturnValueOnce(child).mockReturnValue(terminator)
  const unrefChild = vi.spyOn(child, "unref")
  const unrefTerminator = vi.spyOn(terminator, "unref")
  syncBuiltinESMExports()
  const result = run("node.exe")
  controller.abort()
  await vi.advanceTimersByTimeAsync(1000)
  expect(await result).toContain("incerto")
  expect(unrefChild).toHaveBeenCalledTimes(1)
  expect(unrefTerminator).toHaveBeenCalledTimes(1)
  expect(terminator.listenerCount("close")).toBe(0)
  terminator.emit("error", new Error("late terminator error"))
  terminator.emit("close")
  expect(await result).toContain("incerto")
}

function suite(): void {
  beforeEach(prepare)
  afterEach(dispose)
  test("Node usa argv normal mesmo em caminho com espaços", nodeArgumentsRemainQuoted)
  test("somente cmd pré-cotado usa verbatim", cmdArgumentsRemainVerbatim)
  test("EPERM não deixa promise pendente nem expõe causa secreta", deniedKillSettlesUncertainty)
  test("child sem close tem settlement limitado e eventos tardios inofensivos", missingCloseHasBoundedSettlement)
  test("overflow repetido termina árvore uma só vez", outputOverflowOnlyTerminatesOnce)
  test("timeout preserva motivo específico", timeoutIdentifiesReason)
  test("erro taskkill resolve incerto uma só vez", taskkillErrorSettles)
  test("taskkill não zero resolve sem close do filho", taskkillNonzeroSettles)
  test("EPERM com Node vivo solta pipes e referências locais", livePosixChildReleasesLocalResources)
  test("taskkill sem close solta handle e tolera eventos tardios", liveTerminatorHandleIsReleased)
}

describe("execução do provisionamento", suite)
