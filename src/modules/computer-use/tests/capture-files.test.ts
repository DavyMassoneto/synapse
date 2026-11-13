import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { COMPUTER_CAPTURE_FILE_MODE, COMPUTER_CAPTURE_FILE_ROTATION_LIMIT, ComputerCaptureFiles } from "../adapters"
import {
  COMPUTER_CAPTURE_NOT_STORED,
  COMPUTER_CAPTURE_STORED,
  COMPUTER_LINUX,
  COMPUTER_WIN32,
  type ComputerCaptureStorageResult,
} from "../public"
import { COMPUTER_CAPTURE_FILES_TEST_PREFIX, COMPUTER_CAPTURE_TEST_PIXELS } from "./capture-files-constants"
import { computerTestCaptureImage } from "./capture-files-support"
import { computerTestCapture } from "./support"

const PERMISSION_BITS = 0o777

let directory = ""
let captureFiles = new ComputerCaptureFiles("", COMPUTER_LINUX)

function prepareDirectory(): void {
  directory = mkdtempSync(join(tmpdir(), COMPUTER_CAPTURE_FILES_TEST_PREFIX))
  captureFiles = new ComputerCaptureFiles(directory, COMPUTER_LINUX)
}

function requireReference(result: ComputerCaptureStorageResult): string {
  if (result.kind !== COMPUTER_CAPTURE_STORED) {
    throw new Error(result.message)
  }
  return result.reference
}

function storedImage(): void {
  const reference = requireReference(captureFiles.storeImage(computerTestCaptureImage()))
  expect(readFileSync(reference, "utf8")).toBe(COMPUTER_CAPTURE_TEST_PIXELS)
}

function storedElements(): void {
  const capture = computerTestCapture()
  const reference = requireReference(captureFiles.storeElements(capture))
  expect(JSON.parse(readFileSync(reference, "utf8"))).toStrictEqual(capture)
}

function rotation(): void {
  const references: string[] = []
  for (let index = 0; index <= COMPUTER_CAPTURE_FILE_ROTATION_LIMIT; index++) {
    const reference = requireReference(captureFiles.storeImage(computerTestCaptureImage()))
    const seconds = index + 1
    utimesSync(reference, seconds, seconds)
    references.push(reference)
  }
  expect(readdirSync(directory).length).toBe(COMPUTER_CAPTURE_FILE_ROTATION_LIMIT)
  const [oldest] = references
  if (!oldest) {
    throw new Error("captura mais antiga ausente")
  }
  expect(existsSync(oldest)).toBe(false)
}

function restrictedPermissions(): void {
  const reference = requireReference(captureFiles.storeImage(computerTestCaptureImage()))
  expect(statSync(reference).mode & PERMISSION_BITS).toBe(COMPUTER_CAPTURE_FILE_MODE)
}

function unusableDirectory(): void {
  const file = join(directory, "arquivo")
  writeFileSync(file, "")
  const captureFiles = new ComputerCaptureFiles(file, COMPUTER_LINUX)
  const result = captureFiles.storeImage(computerTestCaptureImage())
  expect(result.kind).toBe(COMPUTER_CAPTURE_NOT_STORED)
  expect(readdirSync(directory)).toStrictEqual(["arquivo"])
}

function windowsPermissionsSkipped(): void {
  const captureFiles = new ComputerCaptureFiles(directory, COMPUTER_WIN32)
  expect(requireReference(captureFiles.storeImage(computerTestCaptureImage()))).toBeTruthy()
}

function registerTests(): void {
  test("grava a imagem da captura", storedImage)
  test("grava os elementos da captura", storedElements)
  test("rotaciona as capturas antigas", rotation)
  test.skipIf(process.platform === COMPUTER_WIN32)("restringe as permissões em POSIX", restrictedPermissions)
  test("informa falha quando a pasta não pode ser usada", unusableDirectory)
  test("não restringe permissões no Windows", windowsPermissionsSkipped)
}

describe("arquivos de captura do computer-use", () => {
  beforeEach(prepareDirectory)
  afterEach(() => rmSync(directory, { recursive: true, force: true }))
  registerTests()
})
