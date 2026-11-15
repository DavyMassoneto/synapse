import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_BINARY_FOLDERS,
  COMPUTER_DRIVER_CURRENT_FILE,
  COMPUTER_DRIVER_OVERRIDE_MISSING,
  COMPUTER_DRIVER_RECEIPT_ABSENT,
  COMPUTER_DRIVER_RECEIPT_FOUND,
  COMPUTER_DRIVER_RECEIPT_INVALID,
  COMPUTER_DRIVER_RECEIPT_INVALID_MESSAGE,
  computerDriverBinaryPath,
  computerDriverCommandPath,
  computerDriverExecutablePath,
  computerFindInstalledVersion,
  computerLocateDriver,
  computerReadCurrentVersion,
  computerReadDriverReceipt,
  computerWriteCurrentVersion,
} from "#synapse/modules/computer-use/adapters/driver-location"
import { COMPUTER_DRIVER_MINIMUM_VERSION } from "#synapse/modules/computer-use/internal"
import { COMPUTER_DARWIN, COMPUTER_LINUX, COMPUTER_WIN32 } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT,
  COMPUTER_DRIVER_LOCATION_TEST_PREFIX,
  COMPUTER_DRIVER_LOCATION_TEST_VERSION,
  computerLocationTestInstallation,
  computerLocationTestSelection,
} from "./driver-location-support"

const OLDER_VERSION = "0.9.0"
const INVALID_RECEIPT_CONTENT = "{ nao é um recibo"

let directory = ""

function prepareDirectory(): void {
  directory = mkdtempSync(join(tmpdir(), COMPUTER_DRIVER_LOCATION_TEST_PREFIX))
}

function disposeDirectory(): void {
  rmSync(directory, { recursive: true, force: true })
}

function installVersion(version: string): void {
  mkdirSync(join(directory, version), { recursive: true })
  writeFileSync(join(directory, version, ...COMPUTER_DRIVER_BINARY_FOLDERS[COMPUTER_LINUX]), "")
}

function darwinBinaryPath(): void {
  expect(computerDriverBinaryPath(directory, COMPUTER_DARWIN, COMPUTER_DRIVER_LOCATION_TEST_VERSION)).toBe(
    join(directory, COMPUTER_DRIVER_LOCATION_TEST_VERSION, ...COMPUTER_DRIVER_BINARY_FOLDERS[COMPUTER_DARWIN]),
  )
}

function linuxBinaryPath(): void {
  expect(computerDriverBinaryPath(directory, COMPUTER_LINUX, COMPUTER_DRIVER_LOCATION_TEST_VERSION)).toBe(
    join(directory, COMPUTER_DRIVER_LOCATION_TEST_VERSION, ...COMPUTER_DRIVER_BINARY_FOLDERS[COMPUTER_LINUX]),
  )
}

function windowsBinaryPath(): void {
  expect(computerDriverBinaryPath(directory, COMPUTER_WIN32, COMPUTER_DRIVER_LOCATION_TEST_VERSION)).toBe(
    join(directory, COMPUTER_DRIVER_LOCATION_TEST_VERSION, ...COMPUTER_DRIVER_BINARY_FOLDERS[COMPUTER_WIN32]),
  )
}

function executablePath(): void {
  expect(computerDriverExecutablePath(COMPUTER_LINUX)).toBe(COMPUTER_DRIVER_BINARY_FOLDERS[COMPUTER_LINUX].join("/"))
}

function foreignSeparatorPath(): void {
  expect(computerDriverCommandPath("a\\b/c")).toBe(join("a", "b", "c"))
}

function missingCurrentVersion(): void {
  expect(computerReadCurrentVersion(directory)).toStrictEqual({ kind: "version-absent" })
}

function invalidCurrentVersion(): void {
  writeFileSync(join(directory, COMPUTER_DRIVER_CURRENT_FILE), "beta\n")
  expect(computerReadCurrentVersion(directory)).toStrictEqual({ kind: "version-absent" })
}

function writtenCurrentVersion(): void {
  computerWriteCurrentVersion(directory, COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  expect(computerReadCurrentVersion(directory)).toStrictEqual({
    kind: "version-found",
    version: COMPUTER_DRIVER_LOCATION_TEST_VERSION,
  })
}

function newestInstalledVersion(): void {
  installVersion(OLDER_VERSION)
  installVersion(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  installVersion(COMPUTER_DRIVER_MINIMUM_VERSION.join("."))
  expect(computerFindInstalledVersion(directory)).toStrictEqual({
    kind: "version-found",
    version: COMPUTER_DRIVER_LOCATION_TEST_VERSION,
  })
}

function pointerBeforeInstalledVersions(): void {
  const minimum = COMPUTER_DRIVER_MINIMUM_VERSION.join(".")
  installVersion(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  computerWriteCurrentVersion(directory, minimum)
  expect(computerFindInstalledVersion(directory)).toStrictEqual({ kind: "version-found", version: minimum })
}

function noInstalledVersion(): void {
  expect(computerFindInstalledVersion(directory)).toStrictEqual({ kind: "version-absent" })
}

async function locatedDriver(): Promise<void> {
  installVersion(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  expect(await computerLocateDriver(directory, COMPUTER_LINUX)).toStrictEqual({
    kind: "driver-found",
    command: join(directory, COMPUTER_DRIVER_LOCATION_TEST_VERSION, ...COMPUTER_DRIVER_BINARY_FOLDERS[COMPUTER_LINUX]),
  })
}

async function missingDriverRefused(): Promise<void> {
  expect(await computerLocateDriver(directory, COMPUTER_LINUX)).toStrictEqual({ kind: "driver-absent" })
}

async function missingOverrideRefused(): Promise<void> {
  await expect(computerLocateDriver(directory, COMPUTER_LINUX, join(directory, "outro", "cua-driver"))).rejects.toThrow(
    COMPUTER_DRIVER_OVERRIDE_MISSING,
  )
}

async function overrideAccepted(): Promise<void> {
  const command = join(directory, "cua-driver")
  writeFileSync(command, "")
  expect(await computerLocateDriver(directory, COMPUTER_LINUX, command)).toStrictEqual({
    kind: "driver-found",
    command,
  })
}

function receiptRoundTrip(): void {
  const selection = computerLocationTestSelection(COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  computerLocationTestInstallation(directory, selection, COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT)
  const receipt = computerReadDriverReceipt(join(directory, selection.version))
  expect(receipt).toMatchObject({
    kind: COMPUTER_DRIVER_RECEIPT_FOUND,
    receipt: {
      version: selection.version,
      tag: selection.tag,
      executable: computerDriverExecutablePath(COMPUTER_LINUX),
    },
  })
}

function missingReceipt(): void {
  expect(computerReadDriverReceipt(join(directory, COMPUTER_DRIVER_LOCATION_TEST_VERSION))).toStrictEqual({
    kind: COMPUTER_DRIVER_RECEIPT_ABSENT,
  })
}

function invalidReceipt(): void {
  const versionDirectory = join(directory, COMPUTER_DRIVER_LOCATION_TEST_VERSION)
  mkdirSync(versionDirectory, { recursive: true })
  writeFileSync(join(versionDirectory, "installation.json"), INVALID_RECEIPT_CONTENT)
  expect(computerReadDriverReceipt(versionDirectory)).toStrictEqual({
    kind: COMPUTER_DRIVER_RECEIPT_INVALID,
    message: COMPUTER_DRIVER_RECEIPT_INVALID_MESSAGE,
  })
}

function registerTests(): void {
  test("monta o caminho do binário no macOS", darwinBinaryPath)
  test("monta o caminho do binário no Linux", linuxBinaryPath)
  test("monta o caminho do binário no Windows", windowsBinaryPath)
  test("monta o caminho relativo do executável", executablePath)
  test("aceita caminho informado com separador de outro sistema", foreignSeparatorPath)
  test("informa ausência do ponteiro de versão", missingCurrentVersion)
  test("recusa ponteiro de versão inválido", invalidCurrentVersion)
  test("grava e lê o ponteiro de versão", writtenCurrentVersion)
  test("escolhe a versão instalada mais nova", newestInstalledVersion)
  test("prefere a versão do ponteiro", pointerBeforeInstalledVersions)
  test("informa ausência de versão instalada", noInstalledVersion)
  test("localiza o binário da versão instalada", locatedDriver)
  test("informa ausência do driver gerenciado", missingDriverRefused)
  test("recusa caminho informado inexistente", missingOverrideRefused)
  test("aceita caminho informado existente", overrideAccepted)
  test("grava e lê o recibo da instalação", receiptRoundTrip)
  test("informa ausência do recibo", missingReceipt)
  test("recusa recibo inválido", invalidReceipt)
}

describe("localização do cua-driver", () => {
  beforeEach(prepareDirectory)
  afterEach(disposeDirectory)
  registerTests()
})
