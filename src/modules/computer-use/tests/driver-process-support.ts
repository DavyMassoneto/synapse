import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ComputerDriverProcess } from "../adapters"
import { ComputerDriverSession } from "../internal"
import { type ComputerDriverLaunch } from "../public"
import {
  COMPUTER_FAKE_LOG_VARIABLE,
  COMPUTER_FAKE_MARKER_VARIABLE,
  COMPUTER_FAKE_SCENARIO_VARIABLE,
} from "./fake-driver"
import { computerFakeDriverArguments } from "./fake-driver-launch"
import { type ComputerProcessTestSut } from "./types"

export const COMPUTER_PROCESS_TEST_TIMEOUT_MS = 60_000

export const COMPUTER_PROCESS_TEST_STARTUP_TIMEOUT_MS = 30_000

export const COMPUTER_PROCESS_TEST_TIMEOUT_SCENARIO_MS = 15_000

export async function makeComputerProcessTestSut(
  scenario: string,
  timeoutMilliseconds: number,
): Promise<ComputerProcessTestSut> {
  const directory = await mkdtemp(join(tmpdir(), "synapse-computer-"))
  const log = join(directory, "calls.txt")
  const launch: ComputerDriverLaunch = {
    command: process.execPath,
    arguments: computerFakeDriverArguments(),
    environment: {
      ...process.env,
      [COMPUTER_FAKE_SCENARIO_VARIABLE]: scenario,
      [COMPUTER_FAKE_LOG_VARIABLE]: log,
      [COMPUTER_FAKE_MARKER_VARIABLE]: join(directory, "once"),
    },
    timeoutMilliseconds,
    windowsHide: true,
  }
  const driver = new ComputerDriverProcess(launch)
  return { driver, session: new ComputerDriverSession(driver, "test", true), directory, log, launch }
}

export async function computerReadTestCalls(sut: ComputerProcessTestSut): Promise<string> {
  return readFile(sut.log, "utf8")
}

export async function computerDisposeTestProcess(sut: ComputerProcessTestSut): Promise<void> {
  await sut.session.stop()
  await rm(sut.directory, { recursive: true, force: true })
}
