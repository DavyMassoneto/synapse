import { describe, expect, test } from "vitest"
import { ComputerActionDispatch } from "../internal"
import { ComputerTestCaptureStorage, ComputerTestWait } from "./doubles"
import {
  COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS,
  COMPUTER_PROCESS_TEST_TIMEOUT_MS,
  computerDisposeTestProcess,
  computerReadTestCalls,
  makeComputerProcessTestSut,
} from "./driver-process-support"

async function legacyCaptureOmitsUndeclaredArguments(): Promise<void> {
  const sut = await makeComputerProcessTestSut("normal", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  const dispatch = new ComputerActionDispatch(
    sut.session,
    "darwin",
    new ComputerTestWait(),
    new ComputerTestCaptureStorage(),
  )
  try {
    await dispatch.execute({ action: "capture" }, { sessionId: "s", modelSupportsImages: true })
    const calls = await computerReadTestCalls(sut)
    expect(calls).toContain('"name":"get_window_state"')
    expect(calls).not.toContain("tree_format")
    expect(calls).not.toContain("max_elements")
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

describe("negociação de capacidades no despacho", () => {
  test(
    "captura do driver antigo omite argumentos não declarados",
    legacyCaptureOmitsUndeclaredArguments,
    COMPUTER_PROCESS_TEST_TIMEOUT_MS,
  )
})
