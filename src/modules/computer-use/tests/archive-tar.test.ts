import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, test } from "vitest"
import {
  COMPUTER_ARCHIVE_REFUSED,
  COMPUTER_ARCHIVE_TAR_EXECUTABLE,
  COMPUTER_ARCHIVE_TAR_MISSING,
  COMPUTER_ARCHIVE_TAR_RESOLVED,
  COMPUTER_ARCHIVE_WIN32_SYSTEM_ROOT_MISSING,
  COMPUTER_ARCHIVE_WIN32_SYSTEM_ROOT_VARIABLE,
  COMPUTER_ARCHIVE_WIN32_TAR_DIRECTORY,
  COMPUTER_ARCHIVE_WIN32_TAR_EXECUTABLE,
  COMPUTER_ARCHIVE_WIN32_TAR_MISSING,
  computerExtractArchive,
  computerResolveArchiveTar,
} from "#synapse/modules/computer-use/adapters/archive-extraction"
import {
  COMPUTER_DARWIN,
  COMPUTER_LINUX,
  COMPUTER_WIN32,
  type ComputerPlatform,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_ARCHIVE_TEST_PREFIX } from "./archive-extraction-constants"
import { ComputerArchiveCommandDouble } from "./archive-extraction-support"

const ARCHIVE = "pacote.zip"
const DESTINATION = "destino"

const roots: string[] = []

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), COMPUTER_ARCHIVE_TEST_PREFIX))
  roots.push(root)
  return root
}

function windowsTarPath(root: string): string {
  return join(root, COMPUTER_ARCHIVE_WIN32_TAR_DIRECTORY, COMPUTER_ARCHIVE_WIN32_TAR_EXECUTABLE)
}

function systemRootEnvironment(root: string): NodeJS.ProcessEnv {
  return { [COMPUTER_ARCHIVE_WIN32_SYSTEM_ROOT_VARIABLE]: root }
}

function resolvesPathTarOutsideWindows(): void {
  const platforms: ComputerPlatform[] = [COMPUTER_LINUX, COMPUTER_DARWIN]
  for (const platform of platforms) {
    const result = computerResolveArchiveTar({ platform, environment: process.env })
    expect(result).toStrictEqual({ kind: COMPUTER_ARCHIVE_TAR_RESOLVED, command: COMPUTER_ARCHIVE_TAR_EXECUTABLE })
  }
}

function resolvesWindowsSystemTar(): void {
  const root = makeRoot()
  mkdirSync(join(root, COMPUTER_ARCHIVE_WIN32_TAR_DIRECTORY))
  writeFileSync(windowsTarPath(root), "")
  const result = computerResolveArchiveTar({ platform: COMPUTER_WIN32, environment: systemRootEnvironment(root) })
  expect(result).toStrictEqual({ kind: COMPUTER_ARCHIVE_TAR_RESOLVED, command: windowsTarPath(root) })
}

function refusesWindowsWithoutSystemRoot(): void {
  const result = computerResolveArchiveTar({ platform: COMPUTER_WIN32, environment: {} })
  expect(result).toStrictEqual({
    kind: COMPUTER_ARCHIVE_TAR_MISSING,
    message: COMPUTER_ARCHIVE_WIN32_SYSTEM_ROOT_MISSING,
  })
}

function refusesWindowsWithoutSystemTar(): void {
  const root = makeRoot()
  const expected = `${COMPUTER_ARCHIVE_WIN32_TAR_MISSING} ${windowsTarPath(root)}.`
  const result = computerResolveArchiveTar({ platform: COMPUTER_WIN32, environment: systemRootEnvironment(root) })
  expect(result).toStrictEqual({ kind: COMPUTER_ARCHIVE_TAR_MISSING, message: expected })
}

async function refusesExtractionWithoutSystemTar(): Promise<void> {
  const root = makeRoot()
  const executor = new ComputerArchiveCommandDouble()
  const result = await computerExtractArchive(
    { archive: ARCHIVE, directory: DESTINATION, platform: COMPUTER_WIN32, environment: systemRootEnvironment(root) },
    executor.execute.bind(executor),
  )
  expect(result).toStrictEqual({
    kind: COMPUTER_ARCHIVE_REFUSED,
    message: `${COMPUTER_ARCHIVE_WIN32_TAR_MISSING} ${windowsTarPath(root)}.`,
  })
  expect(executor.calls).toStrictEqual([])
}

function cleanup(): void {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
}

function registerTests(): void {
  test("usa o tar do PATH fora do Windows", resolvesPathTarOutsideWindows)
  test("usa o tar.exe do sistema no Windows", resolvesWindowsSystemTar)
  test("recusa no Windows sem SystemRoot", refusesWindowsWithoutSystemRoot)
  test("recusa no Windows sem o tar.exe do sistema", refusesWindowsWithoutSystemTar)
  test("não extrai no Windows sem o tar.exe do sistema", refusesExtractionWithoutSystemTar)
}

describe("resolução do executável de extração", () => {
  afterEach(cleanup)
  registerTests()
})
