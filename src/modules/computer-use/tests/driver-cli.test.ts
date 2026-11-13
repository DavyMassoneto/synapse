import { describe, expect, test } from "vitest"
import { ComputerDriverCli } from "../adapters"
import {
  COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS,
  COMPUTER_PROCESS_TEST_TIMEOUT_MS,
  computerDisposeTestProcess,
  makeComputerProcessTestSut,
} from "./driver-process-support"

async function manifest(): Promise<void> {
  const sut = await makeComputerProcessTestSut("normal", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    expect((await new ComputerDriverCli(sut.launch).manifest()).binary_version).toBe("0.21.0")
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

async function rejectsManifest(): Promise<void> {
  const sut = await makeComputerProcessTestSut("normal", COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS)
  try {
    const launch = { ...sut.launch, arguments: ["--eval", "process.stdout.write('{}')"] }
    await expect(new ComputerDriverCli(launch).manifest()).rejects.toThrow()
  } finally {
    await computerDisposeTestProcess(sut)
  }
}

function register(): void {
  test("valida manifesto do processo falso", manifest, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
  test("recusa manifesto inválido", rejectsManifest, COMPUTER_PROCESS_TEST_TIMEOUT_MS)
}

describe("CLI do driver falso", register)
