import { describe, expect, test } from "vitest"
import { computerCheckDriverVersion } from "../internal"
import { COMPUTER_DRIVER_READ_TOOLS } from "../public"
import {
  COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS,
  COMPUTER_PROCESS_TEST_TIMEOUT_MS,
  COMPUTER_PROCESS_TEST_TIMEOUT_SCENARIO_MS,
  computerDisposeTestProcess,
  computerReadTestCalls,
  makeComputerProcessTestSut,
} from "./driver-process-support"

async function handshake(): Promise<void> {
  const sut = await makeComputerProcessTestSut("normal", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    expect(await sut.session.start()).toContainEqual({
      name: "click",
      inputProperties: ["element_token", "delivery_mode", "x"],
    })
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function readRetry(): Promise<void> {
  const sut = await makeComputerProcessTestSut("disconnect-once", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    expect((await sut.session.call("list_windows", {})).kind).toBe("driver-response")
    expect((await computerReadTestCalls(sut)).match(/"name":"list_windows"/g)).toHaveLength(2)
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function noTimeoutReplay(): Promise<void> {
  const sut = await makeComputerProcessTestSut("timeout", COMPUTER_PROCESS_TEST_TIMEOUT_SCENARIO_MS)
  try {
    expect((await sut.session.call("click", { element_index: 1 })).kind).toBe("driver-timeout")
    expect((await computerReadTestCalls(sut)).match(/"name":"click"/g)).toHaveLength(1)
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function invalidResponse(): Promise<void> {
  const sut = await makeComputerProcessTestSut("invalid", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    expect((await sut.session.call("list_windows", {})).kind).toBe("driver-invalid")
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function reopen(): Promise<void> {
  const sut = await makeComputerProcessTestSut("disconnect", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    expect((await sut.session.call("click", {})).kind).toBe("driver-disconnected")
    expect((await sut.session.call("list_apps", {})).kind).toBe("driver-response")
    expect((await computerReadTestCalls(sut)).match(/"name":"start_session"/g)).toHaveLength(2)
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function rpcError(): Promise<void> {
  const sut = await makeComputerProcessTestSut("rpc-error", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    expect(await sut.session.call("click", {})).toEqual({
      kind: "driver-error",
      message: "Ação recusada pelo driver falso",
    })
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function concurrentStart(): Promise<void> {
  const sut = await makeComputerProcessTestSut("normal", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    await Promise.all([sut.session.start(), sut.session.start()])
    expect((await computerReadTestCalls(sut)).match(/"name":"start_session"/g)).toHaveLength(1)
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

function oldVersion(): void {
  expect(computerCheckDriverVersion("0.19.9").kind).toBe("driver-incompatible")
}

async function cursorReadName(): Promise<void> {
  const sut = await makeComputerProcessTestSut("normal", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    const tools = await sut.session.start()
    const cursor = tools.find((tool) => tool.name === "get_cursor_position")
    expect(cursor).toBeDefined()
    if (!cursor) {
      throw new Error("Ferramenta do cursor ausente")
    }
    expect(COMPUTER_DRIVER_READ_TOOLS).toContain(cursor.name)
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

function validVersion(): void {
  expect(computerCheckDriverVersion("0.21.0").kind).toBe("driver-compatible")
}

function register(): void {
  test("negocia protocolo e ferramentas", handshake, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("início concorrente cria uma sessão", concurrentStart, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("preserva erro JSON-RPC do driver", rpcError, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("repete leitura após queda", readRetry, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("não repete ação após timeout", noTimeoutReplay, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("recusa resposta fora do esquema", invalidResponse, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("reabre processo na chamada seguinte", reopen, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("recusa versão antiga", oldVersion, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("aceita versão atual", validVersion, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("nome de leitura corresponde ao driver", cursorReadName, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
}

describe("sessão do driver falso", register)
