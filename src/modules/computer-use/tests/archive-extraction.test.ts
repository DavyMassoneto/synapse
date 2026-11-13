import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  COMPUTER_ARCHIVE_DIRECTORY_FLAG,
  COMPUTER_ARCHIVE_EXECUTABLE_MISSING,
  COMPUTER_ARCHIVE_EXTRACT_FLAG,
  COMPUTER_ARCHIVE_EXTRACTED,
  COMPUTER_ARCHIVE_REFUSED,
  COMPUTER_ARCHIVE_TAR_EXECUTABLE,
  computerExtractArchive,
} from "#synapse/modules/computer-use/adapters/archive-extraction"
import {
  COMPUTER_COMMAND_ARCHIVE_TIMEOUT_MILLISECONDS,
  computerRunCommand,
} from "#synapse/modules/computer-use/adapters/command-execution"
import { COMPUTER_ARCHIVE_TEST_CREATE_FLAG, COMPUTER_ARCHIVE_TEST_PREFIX } from "./archive-extraction-constants"
import { ComputerArchiveCommandDouble } from "./archive-extraction-support"
import { type ComputerArchiveExtractionSut } from "./archive-extraction-types"

const CONTENT = "conteudo do pacote"
const FILE_NAME = "pacote.txt"

let sut: ComputerArchiveExtractionSut

function makeSut(): ComputerArchiveExtractionSut {
  const directory = mkdtempSync(join(tmpdir(), COMPUTER_ARCHIVE_TEST_PREFIX))
  return {
    directory,
    source: join(directory, "origem"),
    archive: join(directory, "pacote.tar.gz"),
    destination: join(directory, "destino"),
  }
}

function prepare(): void {
  sut = makeSut()
}

async function createArchive(): Promise<void> {
  mkdirSync(sut.source, { recursive: true })
  writeFileSync(join(sut.source, FILE_NAME), CONTENT)
  await computerRunCommand(
    COMPUTER_ARCHIVE_TAR_EXECUTABLE,
    [COMPUTER_ARCHIVE_TEST_CREATE_FLAG, sut.archive, COMPUTER_ARCHIVE_DIRECTORY_FLAG, sut.source, FILE_NAME],
    { timeout: COMPUTER_COMMAND_ARCHIVE_TIMEOUT_MILLISECONDS },
  )
}

async function extractedArchive(): Promise<void> {
  await createArchive()
  mkdirSync(sut.destination, { recursive: true })
  const result = await computerExtractArchive({ archive: sut.archive, directory: sut.destination }, computerRunCommand)
  expect(result).toStrictEqual({ kind: COMPUTER_ARCHIVE_EXTRACTED })
  expect(readFileSync(join(sut.destination, FILE_NAME), "utf8")).toBe(CONTENT)
}

async function missingArchiveRefused(): Promise<void> {
  mkdirSync(sut.destination, { recursive: true })
  const result = await computerExtractArchive({ archive: sut.archive, directory: sut.destination }, computerRunCommand)
  expect(result.kind).toBe(COMPUTER_ARCHIVE_REFUSED)
}

async function missingExecutableRefused(): Promise<void> {
  const executor = new ComputerArchiveCommandDouble()
  const result = await computerExtractArchive(
    { archive: sut.archive, directory: sut.destination },
    executor.execute.bind(executor),
  )
  expect(result).toStrictEqual({ kind: COMPUTER_ARCHIVE_REFUSED, message: COMPUTER_ARCHIVE_EXECUTABLE_MISSING })
  expect(executor.calls).toStrictEqual([
    {
      command: COMPUTER_ARCHIVE_TAR_EXECUTABLE,
      arguments: [COMPUTER_ARCHIVE_EXTRACT_FLAG, sut.archive, COMPUTER_ARCHIVE_DIRECTORY_FLAG, sut.destination],
    },
  ])
}

function registerTests(): void {
  test("extrai um pacote tar.gz", extractedArchive)
  test("recusa pacote inexistente", missingArchiveRefused)
  test("recusa quando o tar não existe no sistema", missingExecutableRefused)
}

describe("extração do pacote do cua-driver", () => {
  beforeEach(prepare)
  afterEach(() => rmSync(sut.directory, { recursive: true, force: true }))
  registerTests()
})
