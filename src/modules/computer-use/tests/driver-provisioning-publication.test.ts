import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import * as extraction from "#synapse/modules/computer-use/adapters/archive-extraction"
import { computerReadCurrentVersion } from "#synapse/modules/computer-use/adapters/driver-location"
import {
  COMPUTER_PROVISION_CONTEXT,
  COMPUTER_PROVISION_OTHER_VERSION,
  COMPUTER_PROVISION_PARTIAL_CONTENT,
  COMPUTER_PROVISION_PARTIAL_FILE,
  COMPUTER_PROVISION_RELEASE_RESOLVED,
  COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  COMPUTER_PROVISION_WRONG_CHECKSUM,
  ComputerProvisioningFixture,
  computerInterruptProvisioningResponse,
} from "./provisioning"

let fixture: ComputerProvisioningFixture

async function prepare(): Promise<void> {
  fixture = new ComputerProvisioningFixture()
  await fixture.start()
}

async function dispose(): Promise<void> {
  await fixture.stop()
}

async function checksumDoesNotPublish(): Promise<void> {
  fixture.resolve.mockResolvedValue({
    kind: COMPUTER_PROVISION_RELEASE_RESOLVED,
    selection: { ...fixture.selection(), expectedSha256: COMPUTER_PROVISION_WRONG_CHECKSUM },
    pages: [],
  })
  await expect(fixture.infrastructure.launch({ provisionMissing: true })).rejects.toThrow("checksum")
  expect(readdirSync(fixture.installationDirectory)).toStrictEqual([])
  expect(computerReadCurrentVersion(fixture.installationDirectory)).toStrictEqual({ kind: "version-absent" })
}

async function partialDestinationIsNotReplaced(): Promise<void> {
  const version = join(fixture.installationDirectory, fixture.selection().version)
  mkdirSync(version, { recursive: true })
  const partial = join(version, COMPUTER_PROVISION_PARTIAL_FILE)
  writeFileSync(partial, COMPUTER_PROVISION_PARTIAL_CONTENT)
  const first = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  const second = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(first).toMatchObject({
    result: { kind: "failed", message: "O destino do cua-driver existe sem um executável válido." },
  })
  expect(second).toStrictEqual(first)
  expect(fixture.download).not.toHaveBeenCalled()
  expect(readFileSync(partial, "utf8")).toBe(COMPUTER_PROVISION_PARTIAL_CONTENT)
  expect(computerReadCurrentVersion(fixture.installationDirectory)).toStrictEqual({ kind: "version-absent" })
}

async function managedVersionDivergenceDoesNotPublish(): Promise<void> {
  fixture.resolve.mockResolvedValue({
    kind: COMPUTER_PROVISION_RELEASE_RESOLVED,
    selection: fixture.selectionFor(COMPUTER_PROVISION_OTHER_VERSION),
    pages: [],
  })
  const result = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result).toMatchObject({ result: { kind: "failed", message: expect.stringContaining("reportada") } })
  expect(existsSync(join(fixture.installationDirectory, COMPUTER_PROVISION_OTHER_VERSION))).toBe(false)
  expect(computerReadCurrentVersion(fixture.installationDirectory)).toStrictEqual({ kind: "version-absent" })
}

async function extractionWithoutBinaryDoesNotPublish(): Promise<void> {
  vi.spyOn(extraction, "computerExtractArchive").mockResolvedValue({ kind: "archive-extracted" })
  await expect(fixture.infrastructure.launch({ provisionMissing: true })).rejects.toThrow("executável esperado")
  expect(readdirSync(fixture.installationDirectory)).toStrictEqual([])
}

async function truncatedResponseDoesNotPublish(): Promise<void> {
  const body = new ReadableStream<Uint8Array>({ start: computerInterruptProvisioningResponse })
  fixture.download.mockResolvedValueOnce(new Response(body))
  await expect(fixture.infrastructure.launch({ provisionMissing: true })).rejects.toThrow("resposta interrompida")
  expect(readdirSync(fixture.installationDirectory)).toStrictEqual([])
}

async function emptyBinaryDoesNotPublish(): Promise<void> {
  vi.spyOn(extraction, "computerExtractArchive").mockImplementationOnce(fixture.emptyExtractedBinary.bind(fixture))
  await expect(fixture.infrastructure.launch({ provisionMissing: true })).rejects.toThrow("executável esperado")
  expect(readdirSync(fixture.installationDirectory)).toStrictEqual([])
}

async function nonexecutableBinaryDoesNotPublish(): Promise<void> {
  vi.spyOn(extraction, "computerExtractArchive").mockImplementationOnce(
    fixture.nonexecutableExtractedBinary.bind(fixture),
  )
  await expect(fixture.infrastructure.launch({ provisionMissing: true })).rejects.toThrow("EACCES")
  expect(readdirSync(fixture.installationDirectory)).toStrictEqual([])
}

function registerTests(): void {
  test("recusa checksum sem publicar versão parcial", checksumDoesNotPublish)
  test("recusa destino parcial sem substituir seu conteúdo", partialDestinationIsNotReplaced)
  test(
    "recusa versão reportada diferente da versão selecionada",
    managedVersionDivergenceDoesNotPublish,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test("recusa extração sem executável sem publicar versão", extractionWithoutBinaryDoesNotPublish)
  test("recusa resposta interrompida sem publicar versão", truncatedResponseDoesNotPublish)
  test("recusa executável vazio antes de publicar versão", emptyBinaryDoesNotPublish)
  test("recusa arquivo sem permissão de execução antes de publicar versão", nonexecutableBinaryDoesNotPublish)
}

describe.skipIf(process.platform === "win32")("publicação da versão do cua-driver", () => {
  beforeEach(prepare)
  afterEach(dispose)
  registerTests()
})
