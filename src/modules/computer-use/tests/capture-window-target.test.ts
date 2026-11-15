import { expect, test } from "vitest"
import { ComputerActionDispatch } from "../internal"
import { ComputerTestCaptureStorage, ComputerTestWait } from "./doubles"
import {
  COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS,
  COMPUTER_PROCESS_TEST_TIMEOUT_MS,
  computerDisposeTestProcess,
  computerReadTestCalls,
  makeComputerProcessTestSut,
} from "./driver-process-support"
import { type ComputerDispatchTestSut } from "./types"

async function makeSut(): Promise<ComputerDispatchTestSut> {
  const processSut = await makeComputerProcessTestSut("normal", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  const wait = new ComputerTestWait()
  return {
    ...processSut,
    dispatch: new ComputerActionDispatch(processSut.session, "darwin", wait, new ComputerTestCaptureStorage()),
    wait,
  }
}

async function windowIdOnlyCaptureResolvesPid(): Promise<void> {
  const sut = await makeSut()
  try {
    const result = await sut.dispatch.execute(
      { action: "capture", windowId: 20 },
      { sessionId: "s", modelSupportsImages: true },
    )
    expect(result.kind).toBe("computer-captured")
    const calls = await computerReadTestCalls(sut)
    expect(calls).toContain('"name":"list_windows"')
    expect(calls).toContain('"pid":10')
    expect(calls).toContain('"window_id":20')
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

test("captura só com window_id resolve o pid", windowIdOnlyCaptureResolvesPid, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
