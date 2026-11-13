import * as childProcesses from "node:child_process"
import { afterEach, describe, expect, test, vi } from "vitest"
import {
  COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS,
  computerDisposeTestProcess,
  makeComputerProcessTestSut,
} from "./driver-process-support"

vi.mock("node:child_process", { spy: true })

let stopResolved = false

function markStopped(): void {
  stopResolved = true
}

async function adapterWaitsForCloseAfterExit(): Promise<void> {
  const spawn = vi.mocked(childProcesses.spawn)
  const sut = await makeComputerProcessTestSut("normal", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    await sut.driver.start()
    const result = spawn.mock.results[0]
    if (result?.type !== "return") {
      throw new Error("Processo falso ausente")
    }
    const child = result.value
    child.emit("exit", 0, null)
    const stopping = sut.driver.stop().then(markStopped)
    await Promise.resolve()
    expect(stopResolved).toBe(false)
    await stopping
    expect(stopResolved).toBe(true)
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

function cleanup(): void {
  vi.restoreAllMocks()
  stopResolved = false
}

function register(): void {
  afterEach(cleanup)
  test("adapter aguarda close mesmo após exit", adapterWaitsForCloseAfterExit)
}

describe("encerramento do adapter falso", register)
