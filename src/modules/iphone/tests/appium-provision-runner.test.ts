import childProcess from "node:child_process"
import { once } from "node:events"
import { syncBuiltinESMExports } from "node:module"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { runProvisionFixture } from "./appium-provision-runner-command"
import * as scenario from "./appium-provision-runner-constants"
import * as runnerPlatform from "./appium-provision-runner-platform"
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

async function nodeArgumentsRemainQuoted(): Promise<void> {
  const spawn = vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  syncBuiltinESMExports()
  const result = runProvisionFixture("C:/Program Files/node/node.exe", controller.signal)
  Object.defineProperty(child, "exitCode", { value: 0 })
  child.emit("close")
  expect(await result).toBe("success")
  expect(spawn.mock.calls[0]?.[2]?.windowsVerbatimArguments).toBe(false)
}

async function cmdArgumentsRemainVerbatim(): Promise<void> {
  runnerPlatform.mockProvisionWindows()
  const spawn = vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  syncBuiltinESMExports()
  const result = runProvisionFixture("cmd.exe", controller.signal)
  Object.defineProperty(child, "exitCode", { value: 0 })
  child.emit("close")
  expect(await result).toBe("success")
  expect(spawn.mock.calls[0]?.[2]?.windowsVerbatimArguments).toBe(true)
}

async function deniedKillSettlesUncertainty(): Promise<void> {
  runnerPlatform.mockProvisionPosix()
  vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  const kill = vi.spyOn(process, "kill").mockImplementation(runnerPlatform.denyProvisionKill)
  syncBuiltinESMExports()
  const result = runProvisionFixture("node", controller.signal)
  controller.abort()
  expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_UNCERTAIN_TERMINATION)
  expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_HOME)
  expect(await result).not.toContain(scenario.IPHONE_PROVISION_RUNNER_SECRET)
  expect(kill).toHaveBeenCalledTimes(1)
}

async function missingCloseHasBoundedSettlement(): Promise<void> {
  runnerPlatform.mockProvisionPosix()
  vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  vi.spyOn(process, "kill").mockReturnValue(true)
  syncBuiltinESMExports()
  const unref = vi.spyOn(child, "unref")
  const result = runProvisionFixture("node", controller.signal)
  controller.abort()
  await vi.advanceTimersByTimeAsync(1000)
  expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_CANCELLED)
  expect(child.stdout?.destroyed).toBe(true)
  expect(child.stderr?.destroyed).toBe(true)
  expect(child.stdout?.listenerCount("data")).toBe(0)
  expect(child.listenerCount("close")).toBe(0)
  expect(unref).toHaveBeenCalledTimes(1)
  child.emit("error", new Error(scenario.IPHONE_PROVISION_RUNNER_LATE_CHILD_FAILURE))
  child.emit("close")
  expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_UNCERTAIN)
}

async function outputOverflowOnlyTerminatesOnce(): Promise<void> {
  runnerPlatform.mockProvisionPosix()
  vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  const kill = vi.spyOn(process, "kill").mockReturnValue(true)
  syncBuiltinESMExports()
  const result = runProvisionFixture("node", controller.signal)
  child.stdout?.emit("data", "x".repeat(2_097_153))
  child.stdout?.emit("data", "x")
  child.stderr?.emit("data", "x")
  await vi.advanceTimersByTimeAsync(1000)
  expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_OVERFLOW)
  expect(kill).toHaveBeenCalledTimes(1)
}

async function timeoutIdentifiesReason(): Promise<void> {
  runnerPlatform.mockProvisionPosix()
  vi.spyOn(childProcess, "spawn").mockReturnValue(child)
  vi.spyOn(process, "kill").mockReturnValue(true)
  syncBuiltinESMExports()
  const result = runProvisionFixture("node", controller.signal)
  await vi.advanceTimersByTimeAsync(601000)
  expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_TIMEOUT)
}

async function taskkillErrorSettles(): Promise<void> {
  runnerPlatform.mockProvisionWindows()
  vi.spyOn(process, "kill").mockReturnValue(true)
  const spawn = vi.spyOn(childProcess, "spawn").mockReturnValueOnce(child).mockReturnValue(terminator)
  syncBuiltinESMExports()
  const result = runProvisionFixture("node.exe", controller.signal)
  controller.abort()
  terminator.emit("error", new Error(scenario.IPHONE_PROVISION_RUNNER_TERMINATOR_FAILURE))
  child.stdout?.emit("data", "x".repeat(2_097_153))
  child.emit("close")
  expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_UNCERTAIN)
  expect(await result).not.toContain(scenario.IPHONE_PROVISION_RUNNER_TERMINATOR_FAILURE)
  expect(spawn).toHaveBeenCalledTimes(2)
  expectTaskkill()
}

async function taskkillNonzeroSettles(): Promise<void> {
  runnerPlatform.mockProvisionWindows()
  vi.spyOn(process, "kill").mockReturnValue(true)
  vi.spyOn(childProcess, "spawn").mockReturnValueOnce(child).mockReturnValue(terminator)
  syncBuiltinESMExports()
  const result = runProvisionFixture("node.exe", controller.signal)
  controller.abort()
  expectTaskkill()
  terminator.emit("close", 1)
  expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_UNCERTAIN)
}

async function livePosixChildReleasesLocalResources(): Promise<void> {
  vi.useRealTimers()
  const live = childProcess.spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  })
  runnerPlatform.mockProvisionPosix()
  const unref = vi.spyOn(live, "unref")
  vi.spyOn(childProcess, "spawn").mockReturnValue(live)
  vi.spyOn(process, "kill").mockImplementation(runnerPlatform.denyProvisionKill)
  syncBuiltinESMExports()
  try {
    const result = runProvisionFixture("node", controller.signal)
    controller.abort()
    expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_UNCERTAIN)
    expect(live.exitCode).toBeNull()
    expect(live.killed).toBe(false)
    expect(live.stdout?.destroyed).toBe(true)
    expect(live.stderr?.destroyed).toBe(true)
    expect(live.stdout?.listenerCount("data")).toBe(0)
    expect(live.listenerCount("close")).toBe(0)
    expect(unref).toHaveBeenCalledTimes(1)
    live.emit("error", new Error(scenario.IPHONE_PROVISION_RUNNER_LATE_CHILD_FAILURE))
  } finally {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    syncBuiltinESMExports()
    const closed = once(live, "close")
    live.kill("SIGKILL")
    await closed
  }
}

async function liveTerminatorHandleIsReleased(): Promise<void> {
  runnerPlatform.mockProvisionWindows()
  vi.spyOn(process, "kill").mockReturnValue(true)
  vi.spyOn(childProcess, "spawn").mockReturnValueOnce(child).mockReturnValue(terminator)
  const unrefChild = vi.spyOn(child, "unref")
  const unrefTerminator = vi.spyOn(terminator, "unref")
  syncBuiltinESMExports()
  const result = runProvisionFixture("node.exe", controller.signal)
  controller.abort()
  await vi.advanceTimersByTimeAsync(1000)
  expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_UNCERTAIN)
  expect(unrefChild).toHaveBeenCalledTimes(1)
  expect(unrefTerminator).toHaveBeenCalledTimes(1)
  expectTaskkill()
  expect(terminator.listenerCount("close")).toBe(0)
  terminator.emit("error", new Error(scenario.IPHONE_PROVISION_RUNNER_LATE_TERMINATOR_FAILURE))
  terminator.emit("close")
  expect(await result).toContain(scenario.IPHONE_PROVISION_RUNNER_UNCERTAIN)
}

function expectTaskkill(): void {
  expect(childProcess.spawn).toHaveBeenCalledTimes(2)
  expect(childProcess.spawn).toHaveBeenNthCalledWith(2, "taskkill", ["/pid", "321", "/T", "/F"], {
    windowsHide: true,
    stdio: "ignore",
  })
  expect(process.kill).not.toHaveBeenCalled()
}

function suite(): void {
  beforeEach(prepare)
  afterEach(dispose)
  test(scenario.IPHONE_PROVISION_RUNNER_NODE_ARGUMENTS_TEST, nodeArgumentsRemainQuoted)
  test(scenario.IPHONE_PROVISION_RUNNER_CMD_ARGUMENTS_TEST, cmdArgumentsRemainVerbatim)
  test(scenario.IPHONE_PROVISION_RUNNER_DENIED_KILL_TEST, deniedKillSettlesUncertainty)
  test(scenario.IPHONE_PROVISION_RUNNER_MISSING_CLOSE_TEST, missingCloseHasBoundedSettlement)
  test(scenario.IPHONE_PROVISION_RUNNER_OVERFLOW_TEST, outputOverflowOnlyTerminatesOnce)
  test(scenario.IPHONE_PROVISION_RUNNER_TIMEOUT_TEST, timeoutIdentifiesReason)
  test(scenario.IPHONE_PROVISION_RUNNER_TASKKILL_ERROR_TEST, taskkillErrorSettles)
  test(scenario.IPHONE_PROVISION_RUNNER_TASKKILL_NONZERO_TEST, taskkillNonzeroSettles)
  test(scenario.IPHONE_PROVISION_RUNNER_LIVE_CHILD_TEST, livePosixChildReleasesLocalResources)
  test(scenario.IPHONE_PROVISION_RUNNER_LIVE_TERMINATOR_TEST, liveTerminatorHandleIsReleased)
}

describe(scenario.IPHONE_PROVISION_RUNNER_SUITE, suite)
