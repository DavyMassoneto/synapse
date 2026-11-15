import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_INSTALLATION_ABSENT,
  COMPUTER_DRIVER_INSTALLATION_CONFLICT,
  COMPUTER_DRIVER_INSTALLATION_CORRUPT,
  COMPUTER_DRIVER_INSTALLATION_CORRUPT_MESSAGE,
  COMPUTER_DRIVER_INSTALLATION_DESTINATION_CONFLICT,
  COMPUTER_DRIVER_INSTALLATION_REUSABLE,
  COMPUTER_DRIVER_INSTALLATION_SELECTION_CONFLICT,
  COMPUTER_DRIVER_RECEIPT_INVALID_MESSAGE,
  computerVerifyDriverInstallation,
} from "#synapse/modules/computer-use/adapters/driver-location"
import {
  COMPUTER_DRIVER_LOCATION_TEST_ALTERED_CONTENT,
  COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT,
  COMPUTER_DRIVER_LOCATION_TEST_OTHER_VERSION,
  COMPUTER_DRIVER_LOCATION_TEST_PREFIX,
  COMPUTER_DRIVER_LOCATION_TEST_VERSION,
  computerLocationTestInstallation,
  computerLocationTestSelection,
} from "./driver-location-support"

const INVALID_RECEIPT_CONTENT = "{ nao é um recibo"

let directory = ""

function prepareDirectory(): void {
  directory = mkdtempSync(join(tmpdir(), COMPUTER_DRIVER_LOCATION_TEST_PREFIX))
}

function disposeDirectory(): void {
  rmSync(directory, { recursive: true, force: true })
}

function absentInstallation(): void {
  expect(
    computerVerifyDriverInstallation(directory, computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)),
  ).toStrictEqual({ kind: COMPUTER_DRIVER_INSTALLATION_ABSENT })
}

function reusableInstallation(): void {
  const selection = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  const binary = computerLocationTestInstallation(directory, selection, COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  expect(computerVerifyDriverInstallation(directory, selection)).toStrictEqual({
    kind: COMPUTER_DRIVER_INSTALLATION_REUSABLE,
    binary,
  })
}

function destinationWithoutReceipt(): void {
  mkdirSync(join(directory, COMPUTER_DRIVER_LOCATION_TEST_VERSION), { recursive: true })
  expect(
    computerVerifyDriverInstallation(directory, computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)),
  ).toStrictEqual({
    kind: COMPUTER_DRIVER_INSTALLATION_CONFLICT,
    message: COMPUTER_DRIVER_INSTALLATION_DESTINATION_CONFLICT,
  })
}

function selectionDivergence(): void {
  const selection = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  computerLocationTestInstallation(directory, selection, COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  const republished = { ...selection, expectedSha256: "b".repeat(64) }
  expect(computerVerifyDriverInstallation(directory, republished)).toStrictEqual({
    kind: COMPUTER_DRIVER_INSTALLATION_CONFLICT,
    message: COMPUTER_DRIVER_INSTALLATION_SELECTION_CONFLICT,
  })
}

function alteredExecutable(): void {
  const selection = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  const binary = computerLocationTestInstallation(directory, selection, COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  writeFileSync(binary, COMPUTER_DRIVER_LOCATION_TEST_ALTERED_CONTENT)
  expect(computerVerifyDriverInstallation(directory, selection)).toStrictEqual({
    kind: COMPUTER_DRIVER_INSTALLATION_CORRUPT,
    message: COMPUTER_DRIVER_INSTALLATION_CORRUPT_MESSAGE,
  })
}

function invalidReceiptInstallation(): void {
  const selection = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  computerLocationTestInstallation(directory, selection, COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  writeFileSync(join(directory, selection.version, "installation.json"), INVALID_RECEIPT_CONTENT)
  expect(computerVerifyDriverInstallation(directory, selection)).toStrictEqual({
    kind: COMPUTER_DRIVER_INSTALLATION_CORRUPT,
    message: COMPUTER_DRIVER_RECEIPT_INVALID_MESSAGE,
  })
}

function newVersionDoesNotShadowPublished(): void {
  const selection = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  const other = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_OTHER_VERSION)
  computerLocationTestInstallation(directory, selection, COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  computerLocationTestInstallation(directory, other, COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  expect(computerVerifyDriverInstallation(directory, selection).kind).toBe(COMPUTER_DRIVER_INSTALLATION_REUSABLE)
  expect(computerVerifyDriverInstallation(directory, other).kind).toBe(COMPUTER_DRIVER_INSTALLATION_REUSABLE)
}

function registerTests(): void {
  test("informa ausência da instalação gerenciada", absentInstallation)
  test("reutiliza a instalação íntegra", reusableInstallation)
  test("recusa destino sem recibo", destinationWithoutReceipt)
  test("recusa instalação divergente da release selecionada", selectionDivergence)
  test("recusa executável alterado", alteredExecutable)
  test("recusa instalação com recibo inválido", invalidReceiptInstallation)
  test("mantém duas versões publicadas verificáveis", newVersionDoesNotShadowPublished)
}

describe("verificação da instalação do cua-driver", () => {
  beforeEach(prepareDirectory)
  afterEach(disposeDirectory)
  registerTests()
})
