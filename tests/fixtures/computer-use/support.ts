import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  type PiComputerInput,
  PiComputerToolHandler,
  type PiComputerToolOutput,
  registerComputerUse,
} from "#synapse/integration"
import { createComputerUse } from "#synapse/modules"
import { COMPUTER_INTEGRATION_SESSION } from "./constants"
import { COMPUTER_FIXTURE_DRIVER_LOG_VARIABLE, computerIntegrationDriverArguments } from "./fake-driver"
import { ComputerIntegrationHost } from "./host"
import { type ComputerIntegrationSut } from "./types"

export async function makeComputerIntegrationSut(): Promise<ComputerIntegrationSut> {
  const directory = await mkdtemp(join(tmpdir(), "synapse-computer-integration-"))
  const log = join(directory, "calls.txt")
  const computer = createComputerUse({
    platform: "darwin",
    installationDirectory: directory,
    captureDirectory: directory,
    wait: { wait: integrationWait },
    environment: process.env,
    driverLaunch: {
      command: process.execPath,
      arguments: computerIntegrationDriverArguments(),
      environment: { ...process.env, [COMPUTER_FIXTURE_DRIVER_LOG_VARIABLE]: log },
      timeoutMilliseconds: 10000,
      windowsHide: true,
    },
  })
  const host = new ComputerIntegrationHost()
  registerComputerUse(host, computer)
  return { host, computer, directory, log }
}

async function integrationWait(_milliseconds: number): Promise<void> {}

export async function disposeComputerIntegration(sut: ComputerIntegrationSut): Promise<void> {
  await sut.computer.stop()
  await rm(sut.directory, { recursive: true, force: true })
}

export async function executeComputerIntegration(
  sut: ComputerIntegrationSut,
  input: PiComputerInput,
  signal?: AbortSignal,
): Promise<PiComputerToolOutput> {
  return new PiComputerToolHandler(sut.computer).execute("call", input, signal, undefined, {
    sessionManager: { getSessionId: integrationSessionId },
  })
}

function integrationSessionId(): string {
  return COMPUTER_INTEGRATION_SESSION
}
