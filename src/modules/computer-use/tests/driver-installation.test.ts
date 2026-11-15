import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { computerInstallDriver } from "#synapse/modules/computer-use/adapters/driver-installation"
import {
  COMPUTER_DRIVER_INSTALLATION_CORRUPT_MESSAGE,
  COMPUTER_DRIVER_INSTALLATION_DESTINATION_CONFLICT,
  COMPUTER_DRIVER_INSTALLATION_SELECTION_CONFLICT,
} from "#synapse/modules/computer-use/adapters/driver-location"
import {
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  type ComputerDriverPolicy,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_INSTALL_DRIVER_TEST_PREFIX } from "./driver-installation-support"
import {
  COMPUTER_DRIVER_LOCATION_TEST_ALTERED_CONTENT,
  COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT,
  COMPUTER_DRIVER_LOCATION_TEST_VERSION,
  computerLocationTestInstallation,
  computerLocationTestSelection,
} from "./driver-location-support"

const POLICY: ComputerDriverPolicy = { mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE }

let directory = ""

const fetchMock = vi.fn<typeof fetch>()

function prepareDirectory(): void {
  directory = mkdtempSync(join(tmpdir(), COMPUTER_INSTALL_DRIVER_TEST_PREFIX))
  vi.stubGlobal("fetch", fetchMock)
}

function disposeDirectory(): void {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
  rmSync(directory, { recursive: true, force: true })
}

async function reusedInstallation(): Promise<void> {
  const selection = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  const binary = computerLocationTestInstallation(directory, selection, COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  expect(await computerInstallDriver({ directory, selection, policy: POLICY })).toBe(binary)
  expect(fetchMock).not.toHaveBeenCalled()
  expect(readFileSync(binary, "utf8")).toBe(COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
}

async function divergentReleaseRefused(): Promise<void> {
  const selection = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  computerLocationTestInstallation(directory, selection, COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  const republished = { ...selection, expectedSha256: "b".repeat(64) }
  await expect(computerInstallDriver({ directory, selection: republished, policy: POLICY })).rejects.toThrow(
    COMPUTER_DRIVER_INSTALLATION_SELECTION_CONFLICT,
  )
  expect(fetchMock).not.toHaveBeenCalled()
}

async function alteredExecutableRefused(): Promise<void> {
  const selection = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  const binary = computerLocationTestInstallation(directory, selection, COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  writeFileSync(binary, COMPUTER_DRIVER_LOCATION_TEST_ALTERED_CONTENT)
  await expect(computerInstallDriver({ directory, selection, policy: POLICY })).rejects.toThrow(
    COMPUTER_DRIVER_INSTALLATION_CORRUPT_MESSAGE,
  )
  expect(fetchMock).not.toHaveBeenCalled()
}

async function destinationWithoutReceiptRefused(): Promise<void> {
  const selection = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  const versionDirectory = join(directory, selection.version)
  mkdirSync(versionDirectory, { recursive: true })
  writeFileSync(join(versionDirectory, "parcial"), COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  await expect(computerInstallDriver({ directory, selection, policy: POLICY })).rejects.toThrow(
    COMPUTER_DRIVER_INSTALLATION_DESTINATION_CONFLICT,
  )
  expect(fetchMock).not.toHaveBeenCalled()
  expect(existsSync(join(versionDirectory, "parcial"))).toBe(true)
  expect(existsSync(join(versionDirectory, "installation.json"))).toBe(false)
}

function registerTests(): void {
  test("reutiliza a instalação íntegra sem baixar o pacote", reusedInstallation)
  test("recusa release republicada com digest divergente", divergentReleaseRefused)
  test("recusa instalação com executável alterado", alteredExecutableRefused)
  test("recusa destino sem recibo sem substituir o conteúdo", destinationWithoutReceiptRefused)
}

describe("instalação do cua-driver", () => {
  beforeEach(prepareDirectory)
  afterEach(disposeDirectory)
  registerTests()
})
