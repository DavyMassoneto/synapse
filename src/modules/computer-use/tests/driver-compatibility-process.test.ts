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

async function zeroElementTokenAttached(): Promise<void> {
  const sut = await makeSut()
  try {
    const capture = await sut.dispatch.execute({ action: "capture" }, { sessionId: "s", modelSupportsImages: true })
    expect(capture).toMatchObject({ kind: "computer-captured", capture: { elements: [{ index: 0 }, { index: 1 }] } })
    await sut.dispatch.execute({ action: "click", element: 0 }, { sessionId: "s", modelSupportsImages: true })
    expect(await computerReadTestCalls(sut)).toContain('"element_token":"snapshot-0"')
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function installedCannotFocus(): Promise<void> {
  const sut = await makeSut()
  try {
    const result = await sut.dispatch.execute(
      { action: "focus_app", app: "com.installed", raiseWindow: true },
      { sessionId: "s", modelSupportsImages: true },
    )
    expect(result).toMatchObject({ kind: "computer-executed", result: { kind: "refused" } })
    expect(await computerReadTestCalls(sut)).not.toContain('"name":"bring_to_front"')
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function invalidExactCapture(): Promise<void> {
  const sut = await makeSut()
  try {
    await expect(
      sut.dispatch.execute({ action: "capture", pid: 0, windowId: 20 }, { sessionId: "s", modelSupportsImages: true }),
    ).rejects.toThrow()
    expect(await computerReadTestCalls(sut)).not.toContain('"name":"get_window_state"')
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

function register(): void {
  test("índice zero usa token do snapshot", zeroElementTokenAttached, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("aplicativo inativo não provoca foco", installedCannotFocus, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("PID zero não provoca captura de processo", invalidExactCapture, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
}

describe("compatibilidade do driver em processo", register)
