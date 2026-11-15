import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_ARTIFACT_CHECKSUM_MISMATCH,
  COMPUTER_DRIVER_ARTIFACT_DOWNLOAD_FAILED,
  COMPUTER_DRIVER_ARTIFACT_DOWNLOADED,
  COMPUTER_DRIVER_ARTIFACT_INVALID_NAME,
  COMPUTER_DRIVER_ARTIFACT_REFUSED,
  COMPUTER_DRIVER_ARTIFACT_TOO_LARGE,
  computerDownloadDriverArtifact,
} from "#synapse/modules/computer-use/adapters/artifact-download"
import {
  COMPUTER_ARTIFACT_TEST_EMPTY_FILE_NAME,
  COMPUTER_ARTIFACT_TEST_HTTP_NOT_FOUND,
  COMPUTER_ARTIFACT_TEST_HTTP_OK,
  COMPUTER_ARTIFACT_TEST_PREFIX,
  COMPUTER_ARTIFACT_TEST_UNSAFE_FILE_NAME,
} from "./artifact-download-constants"
import { computerArtifactDigest } from "./artifact-download-digest"
import { computerArtifactRequest } from "./artifact-download-request"
import { ComputerArtifactTestServer } from "./artifact-download-support"

const PAYLOAD = Buffer.from("pacote do cua-driver")

const servers: ComputerArtifactTestServer[] = []

let directory = ""

function prepareDirectory(): void {
  directory = mkdtempSync(join(tmpdir(), COMPUTER_ARTIFACT_TEST_PREFIX))
}

async function dispose(): Promise<void> {
  for (const server of servers) {
    await server.stop()
  }
  servers.length = 0
  rmSync(directory, { recursive: true, force: true })
}

async function startServer(status: number): Promise<string> {
  const server = new ComputerArtifactTestServer(PAYLOAD, status)
  const baseUrl = await server.start()
  servers.push(server)
  return baseUrl
}

async function artifactDownloaded(): Promise<void> {
  const baseUrl = await startServer(COMPUTER_ARTIFACT_TEST_HTTP_OK)
  const result = await computerDownloadDriverArtifact(computerArtifactRequest(baseUrl, directory, PAYLOAD))
  if (result.kind !== COMPUTER_DRIVER_ARTIFACT_DOWNLOADED) {
    throw new Error(result.message)
  }
  expect(readFileSync(result.archive)).toStrictEqual(PAYLOAD)
}

async function checksumRefused(): Promise<void> {
  const baseUrl = await startServer(COMPUTER_ARTIFACT_TEST_HTTP_OK)
  const request = computerArtifactRequest(baseUrl, directory, PAYLOAD)
  const result = await computerDownloadDriverArtifact({
    ...request,
    sha256: computerArtifactDigest(Buffer.from("outro")),
  })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_ARTIFACT_REFUSED,
    message: COMPUTER_DRIVER_ARTIFACT_CHECKSUM_MISMATCH,
  })
  expect(readdirSync(directory)).toStrictEqual([])
}

async function oversizedRefused(): Promise<void> {
  const baseUrl = await startServer(COMPUTER_ARTIFACT_TEST_HTTP_OK)
  const request = computerArtifactRequest(baseUrl, directory, PAYLOAD)
  const result = await computerDownloadDriverArtifact({ ...request, maxBytes: PAYLOAD.byteLength - 1 })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_ARTIFACT_REFUSED,
    message: `${COMPUTER_DRIVER_ARTIFACT_TOO_LARGE} ${PAYLOAD.byteLength - 1} bytes.`,
  })
  expect(readdirSync(directory)).toStrictEqual([])
}

async function unsafeFileNameRefused(): Promise<void> {
  const baseUrl = await startServer(COMPUTER_ARTIFACT_TEST_HTTP_OK)
  const request = computerArtifactRequest(baseUrl, directory, PAYLOAD)
  const result = await computerDownloadDriverArtifact({ ...request, fileName: COMPUTER_ARTIFACT_TEST_UNSAFE_FILE_NAME })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_ARTIFACT_REFUSED,
    message: COMPUTER_DRIVER_ARTIFACT_INVALID_NAME,
  })
  expect(readdirSync(directory)).toStrictEqual([])
}

async function blankFileNameRefused(): Promise<void> {
  const baseUrl = await startServer(COMPUTER_ARTIFACT_TEST_HTTP_OK)
  const request = computerArtifactRequest(baseUrl, directory, PAYLOAD)
  const result = await computerDownloadDriverArtifact({ ...request, fileName: COMPUTER_ARTIFACT_TEST_EMPTY_FILE_NAME })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_ARTIFACT_REFUSED,
    message: COMPUTER_DRIVER_ARTIFACT_INVALID_NAME,
  })
}

async function failedResponseRefused(): Promise<void> {
  const baseUrl = await startServer(COMPUTER_ARTIFACT_TEST_HTTP_NOT_FOUND)
  const result = await computerDownloadDriverArtifact(computerArtifactRequest(baseUrl, directory, PAYLOAD))
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_ARTIFACT_REFUSED,
    message: `${COMPUTER_DRIVER_ARTIFACT_DOWNLOAD_FAILED} HTTP ${COMPUTER_ARTIFACT_TEST_HTTP_NOT_FOUND}.`,
  })
  expect(readdirSync(directory)).toStrictEqual([])
}

function registerTests(): void {
  test("baixa o artefato com checksum correto", artifactDownloaded)
  test("recusa checksum diferente sem gravar o arquivo", checksumRefused)
  test("recusa corpo acima do limite sem gravar o arquivo", oversizedRefused)
  test("recusa nome de arquivo com separador sem gravar nada", unsafeFileNameRefused)
  test("recusa nome de arquivo em branco", blankFileNameRefused)
  test("recusa resposta HTTP sem sucesso sem gravar o arquivo", failedResponseRefused)
}

describe("download do artefato do cua-driver", () => {
  beforeEach(prepareDirectory)
  afterEach(dispose)
  registerTests()
})
