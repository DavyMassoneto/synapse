import { describe, expect, test } from "vitest"
import {
  COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS,
  COMPUTER_PROCESS_TEST_TIMEOUT_MS,
  computerDisposeTestProcess,
  computerReadTestCalls,
  makeComputerProcessTestSut,
} from "./driver-process-support"

async function cancelledBeforeRpcWrite(): Promise<void> {
  const sut = await makeComputerProcessTestSut("normal", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    await sut.session.start()
    const controller = new AbortController()
    controller.abort()
    await expect(
      sut.driver.call("click", { pid: 10, window_id: 20, element_index: 1 }, controller.signal),
    ).rejects.toThrow("cancelada")
    expect(await computerReadTestCalls(sut)).not.toContain('"name":"click"')
    const result = await sut.session.call("click", { pid: 10, window_id: 20, element_index: 1 })
    expect(result).toMatchObject({ kind: "driver-response", envelope: { verified: true } })
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

function register(): void {
  test(
    "não escreve RPC cancelado e mantém driver utilizável",
    cancelledBeforeRpcWrite,
    COMPUTER_PROCESS_TEST_TIMEOUT_MS,
  )
}

describe("cancelamento com processo falso", register)
