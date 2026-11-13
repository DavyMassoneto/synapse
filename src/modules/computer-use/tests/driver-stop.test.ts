import { afterEach, describe, expect, test, vi } from "vitest"
import { COMPUTER_PROCESS_STOP_GRACE_MILLISECONDS, ComputerProcessTermination } from "../adapters"
import { LifecycleProcess } from "./lifecycle"

async function awaitsClose(): Promise<void> {
  const child = new LifecycleProcess()
  const termination = new ComputerProcessTermination(child)
  const closing = termination.stop()
  expect(child.signals).toEqual(["SIGTERM"])
  expect(child.listenerCount("close")).toBeGreaterThan(0)
  child.close()
  await closing
  expect(child.listenerCount("close")).toBe(0)
}

async function escalatesIgnoredTermination(): Promise<void> {
  vi.useFakeTimers()
  const child = new LifecycleProcess()
  const termination = new ComputerProcessTermination(child)
  const closing = termination.stop()
  await vi.advanceTimersByTimeAsync(COMPUTER_PROCESS_STOP_GRACE_MILLISECONDS)
  expect(child.signals).toEqual(["SIGTERM", "SIGKILL"])
  child.close()
  await closing
}

async function alreadyExited(): Promise<void> {
  const child = new LifecycleProcess()
  const termination = new ComputerProcessTermination(child)
  child.close()
  await termination.stop()
  expect(child.signals).toEqual([])
}

async function ignoresProcessErrorUntilClose(): Promise<void> {
  const child = new LifecycleProcess()
  child.on("error", consumeExpectedError)
  const termination = new ComputerProcessTermination(child)
  vi.useFakeTimers()
  const closing = termination.stop()
  child.emit("error", Object.assign(new Error("pipe"), { code: "EPIPE" }))
  await vi.advanceTimersByTimeAsync(COMPUTER_PROCESS_STOP_GRACE_MILLISECONDS)
  expect(child.signals).toEqual(["SIGTERM", "SIGKILL"])
  expect(child.listenerCount("close")).toBe(1)
  child.close()
  await closing
}

function consumeExpectedError(_error: Error): void {}

async function exitDoesNotReplaceClose(): Promise<void> {
  const child = new LifecycleProcess()
  const termination = new ComputerProcessTermination(child)
  child.exitCode = 0
  const closing = termination.stop()
  expect(child.listenerCount("close")).toBe(1)
  child.close()
  await closing
}

function cleanup(): void {
  vi.useRealTimers()
}

function register(): void {
  afterEach(cleanup)
  test("aguarda close antes de concluir", awaitsClose)
  test("erro esperado não substitui close", ignoresProcessErrorUntilClose)
  test("exit não equivale a stdio fechado", exitDoesNotReplaceClose)
  test("escalona processo que ignora término", escalatesIgnoredTermination)
  test("não sinaliza processo já encerrado", alreadyExited)
}

describe("encerramento do processo falso", register)
