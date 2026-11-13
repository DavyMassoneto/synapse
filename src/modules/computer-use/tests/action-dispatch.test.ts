import { readFile } from "node:fs/promises"
import { describe, expect, test } from "vitest"
import { ComputerActionDispatch } from "../internal"
import { type ComputerAction, createComputerUse } from "../public"
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

async function assertAction(action: ComputerAction, tool: string): Promise<void> {
  const sut = await makeSut()
  try {
    await sut.dispatch.execute({ action: "capture" }, { sessionId: "s", modelSupportsImages: true })
    const result = await sut.dispatch.execute(action, { sessionId: "s", modelSupportsImages: true })
    expect(result.kind).toBe("computer-executed")
    expect(await computerReadTestCalls(sut)).toContain(`"name":"${tool}"`)
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function click(): Promise<void> {
  await assertAction({ action: "click", element: 1 }, "click")
}

async function elementTokenAttached(): Promise<void> {
  const sut = await makeSut()
  try {
    await sut.dispatch.execute({ action: "capture" }, { sessionId: "s", modelSupportsImages: true })
    await sut.dispatch.execute({ action: "click", element: 1 }, { sessionId: "s", modelSupportsImages: true })
    expect(await computerReadTestCalls(sut)).toContain('"element_token":"snapshot-1"')
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function unknownElementProceedsWithoutToken(): Promise<void> {
  const sut = await makeSut()
  try {
    await sut.dispatch.execute({ action: "capture" }, { sessionId: "s", modelSupportsImages: true })
    const result = await sut.dispatch.execute(
      { action: "click", element: 2 },
      { sessionId: "s", modelSupportsImages: true },
    )
    expect(result.kind).toBe("computer-executed")
    const calls = await computerReadTestCalls(sut)
    expect(calls).toContain('"name":"click"')
    expect(calls).not.toContain("element_token")
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function doubleClick(): Promise<void> {
  await assertAction({ action: "double_click", element: 1 }, "double_click")
}

async function rightClick(): Promise<void> {
  await assertAction({ action: "right_click", element: 1 }, "click")
}

async function middleClick(): Promise<void> {
  await assertAction({ action: "middle_click", element: 1 }, "click")
}

async function drag(): Promise<void> {
  await assertAction({ action: "drag", fromElement: 1, toElement: 2 }, "drag")
}

async function scroll(): Promise<void> {
  await assertAction({ action: "scroll", direction: "down", amount: 2 }, "scroll")
}

async function type(): Promise<void> {
  await assertAction({ action: "type", text: "Olá" }, "type_text")
}

async function key(): Promise<void> {
  await assertAction({ action: "key", keys: "cmd+s" }, "hotkey")
}

async function singleKey(): Promise<void> {
  await assertAction({ action: "key", keys: "return" }, "press_key")
}

async function setValue(): Promise<void> {
  await assertAction({ action: "set_value", element: 1, value: "Nome" }, "set_value")
}

async function focus(): Promise<void> {
  await assertAction({ action: "focus_app", app: "Editor", raiseWindow: true }, "bring_to_front")
}

async function lists(): Promise<void> {
  const sut = await makeSut()
  try {
    expect(
      (await sut.dispatch.execute({ action: "list_apps" }, { sessionId: "s", modelSupportsImages: false })).kind,
    ).toBe("computer-apps-listed")
    expect(
      (await sut.dispatch.execute({ action: "list_windows" }, { sessionId: "s", modelSupportsImages: false })).kind,
    ).toBe("computer-windows-listed")
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function capture(): Promise<void> {
  const sut = await makeSut()
  try {
    expect(
      (await sut.dispatch.execute({ action: "capture" }, { sessionId: "s", modelSupportsImages: true })).kind,
    ).toBe("computer-captured")
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function pause(): Promise<void> {
  const sut = await makeSut()
  try {
    await sut.dispatch.execute({ action: "wait", seconds: 2 }, { sessionId: "s", modelSupportsImages: false })
    expect(sut.wait.milliseconds).toEqual([2000])
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function unsafe(): Promise<void> {
  const sut = await makeSut()
  try {
    const service = createComputerUse({
      platform: "darwin",
      installationDirectory: sut.directory,
      captureDirectory: sut.directory,
      wait: sut.wait,
      environment: process.env,
      driverLaunch: sut.launch,
    })
    const result = await service.execute(
      { action: "key", keys: "cmd+shift+q" },
      { sessionId: "s", modelSupportsImages: true },
    )
    expect(result).toMatchObject({ kind: "computer-executed", result: { kind: "refused" } })
    await expect(readFile(sut.log)).rejects.toThrow()
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function publicMount(): Promise<void> {
  const sut = await makeSut()
  const service = createComputerUse({
    platform: "darwin",
    installationDirectory: sut.directory,
    captureDirectory: sut.directory,
    wait: sut.wait,
    environment: process.env,
    driverLaunch: sut.launch,
  })
  try {
    expect((await service.diagnose()).kind).toBe("computer-ready")
    expect((await service.execute({ action: "list_apps" }, { sessionId: "s", modelSupportsImages: true })).kind).toBe(
      "computer-apps-listed",
    )
  } finally {
    await service.stop()
    await computerDisposeTestProcess(sut)
  }
}

function register(): void {
  test("captura", capture, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("clique", click, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("anexa o token do snapshot", elementTokenAttached, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("índice sem token segue sem token", unknownElementProceedsWithoutToken, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("duplo clique", doubleClick, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("clique direito", rightClick, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("clique central", middleClick, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("arrasta", drag, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("rola", scroll, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("digita", type, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("atalho", key, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("tecla simples", singleKey, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("define valor", setValue, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("seleciona e traz janela", focus, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("lista aplicativos e janelas", lists, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("espera pela porta", pause, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("recusa antes de qualquer chamada", unsafe, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("monta interface pública", publicMount, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
}

describe("despacho com driver falso", register)
