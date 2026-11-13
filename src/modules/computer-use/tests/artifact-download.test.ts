import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  COMPUTER_ARTIFACT_ABSENT,
  COMPUTER_ARTIFACT_FOUND,
  COMPUTER_DRIVER_ARTIFACT_DOWNLOADED,
  COMPUTER_DRIVER_ARTIFACT_MAX_BYTES,
  COMPUTER_DRIVER_ARTIFACT_REFUSED,
  COMPUTER_DRIVER_ARTIFACT_TOO_LARGE,
  computerDownloadDriverArtifact,
  computerPinnedArtifact,
} from "#synapse/modules/computer-use/adapters/artifact-download"
import { COMPUTER_LINUX, COMPUTER_WIN32 } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_ARTIFACT_TEST_PREFIX } from "./artifact-download-constants"
import { computerArtifactDigest } from "./artifact-download-digest"
import { ComputerArtifactTestServer } from "./artifact-download-support"
import { type ComputerArtifactDownloadSut } from "./artifact-download-types"

const PAYLOAD = Buffer.from("pacote do cua-driver")

const WINDOWS_ARTIFACT = {
  fileName: "windows-x86_64-binary.zip",
  sha256: "d63f6a78e65afc06524048f5557fed36cdf01f0a8a680236e93c9a2fb3587f44",
}

let sut: ComputerArtifactDownloadSut

async function makeSut(): Promise<ComputerArtifactDownloadSut> {
  const server = new ComputerArtifactTestServer(PAYLOAD)
  const baseUrl = await server.start()
  return {
    server,
    baseUrl,
    directory: mkdtempSync(join(tmpdir(), COMPUTER_ARTIFACT_TEST_PREFIX)),
    artifact: { fileName: "pacote.tar.gz", sha256: computerArtifactDigest(PAYLOAD) },
  }
}

async function prepare(): Promise<void> {
  sut = await makeSut()
}

async function dispose(): Promise<void> {
  await sut.server.stop()
  rmSync(sut.directory, { recursive: true, force: true })
}

async function artifactDownloaded(): Promise<void> {
  const result = await computerDownloadDriverArtifact({
    baseUrl: sut.baseUrl,
    directory: sut.directory,
    artifact: sut.artifact,
    maxBytes: COMPUTER_DRIVER_ARTIFACT_MAX_BYTES,
  })
  if (result.kind !== COMPUTER_DRIVER_ARTIFACT_DOWNLOADED) {
    throw new Error(result.message)
  }
  expect(readFileSync(result.archive)).toStrictEqual(PAYLOAD)
}

async function checksumRefused(): Promise<void> {
  const result = await computerDownloadDriverArtifact({
    baseUrl: sut.baseUrl,
    directory: sut.directory,
    artifact: { fileName: sut.artifact.fileName, sha256: computerArtifactDigest(Buffer.from("outro")) },
    maxBytes: COMPUTER_DRIVER_ARTIFACT_MAX_BYTES,
  })
  expect(result.kind).toBe(COMPUTER_DRIVER_ARTIFACT_REFUSED)
  expect(readdirSync(sut.directory)).toStrictEqual([])
}

async function oversizedRefused(): Promise<void> {
  const result = await computerDownloadDriverArtifact({
    baseUrl: sut.baseUrl,
    directory: sut.directory,
    artifact: sut.artifact,
    maxBytes: PAYLOAD.byteLength - 1,
  })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_ARTIFACT_REFUSED,
    message: `${COMPUTER_DRIVER_ARTIFACT_TOO_LARGE} ${PAYLOAD.byteLength - 1} bytes.`,
  })
  expect(readdirSync(sut.directory)).toStrictEqual([])
}

function unsupportedArchitecture(): void {
  expect(computerPinnedArtifact(COMPUTER_LINUX, "ia32")).toStrictEqual({ kind: COMPUTER_ARTIFACT_ABSENT })
}

function pinnedWindowsArtifact(): void {
  expect(computerPinnedArtifact(COMPUTER_WIN32, "x64")).toStrictEqual({
    kind: COMPUTER_ARTIFACT_FOUND,
    artifact: WINDOWS_ARTIFACT,
  })
}

function registerTests(): void {
  test("baixa o artefato com checksum correto", artifactDownloaded)
  test("recusa checksum diferente sem gravar o arquivo", checksumRefused)
  test("recusa corpo acima do limite sem gravar o arquivo", oversizedRefused)
  test("recusa arquitetura sem artefato fixado", unsupportedArchitecture)
  test("resolve o artefato fixado do Windows x64", pinnedWindowsArtifact)
}

describe("download do artefato do cua-driver", () => {
  beforeEach(prepare)
  afterEach(dispose)
  registerTests()
})
