import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import * as extraction from "#synapse/modules/computer-use/adapters/archive-extraction"
import * as artifacts from "#synapse/modules/computer-use/adapters/artifact-download"
import {
  computerDriverBinaryPath,
  computerReadCurrentVersion,
} from "#synapse/modules/computer-use/adapters/driver-location"
import { COMPUTER_LINUX, createComputerUse } from "#synapse/modules/computer-use/public"
import {
  COMPUTER_PROVISION_CONTEXT,
  COMPUTER_PROVISION_NO_OVERRIDE,
  COMPUTER_PROVISION_PARTIAL_CONTENT,
  COMPUTER_PROVISION_PARTIAL_FILE,
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

async function automaticProvisioning(): Promise<void> {
  const result = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result.kind).toBe("computer-apps-listed")
  expect(fixture.download).toHaveBeenCalledTimes(1)
  const binary = computerDriverBinaryPath(fixture.installationDirectory, COMPUTER_LINUX, "0.21.0")
  expect(await fixture.service.diagnose()).toStrictEqual({ kind: "computer-ready", binary, version: "0.21.0" })
  await fixture.service.stop()
  const restarted = createComputerUse(fixture.dependencies)
  try {
    expect((await restarted.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)).kind).toBe(
      "computer-apps-listed",
    )
    expect(fixture.download).toHaveBeenCalledTimes(1)
  } finally {
    await restarted.stop()
  }
}

async function diagnosticDoesNotInstall(): Promise<void> {
  expect(await fixture.service.diagnose()).toStrictEqual({
    kind: "computer-unavailable",
    message: "O cua-driver não está instalado nesta máquina.",
  })
  expect(fixture.download).not.toHaveBeenCalled()
  expect(existsSync(fixture.installationDirectory)).toBe(false)
}

async function missingOverrideDoesNotInstall(): Promise<void> {
  const service = createComputerUse({
    ...fixture.dependencies,
    driverPath: join(fixture.directory, COMPUTER_PROVISION_NO_OVERRIDE),
  })
  const result = await service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result).toMatchObject({
    result: { kind: "failed", message: "O caminho informado para o cua-driver não existe." },
  })
  expect(fixture.download).not.toHaveBeenCalled()
}

async function checksumDoesNotPublish(): Promise<void> {
  vi.spyOn(artifacts, "computerPinnedArtifact").mockReturnValue({
    kind: "artifact-found",
    artifact: { fileName: "driver.tar.gz", sha256: COMPUTER_PROVISION_WRONG_CHECKSUM },
  })
  await expect(fixture.infrastructure.launch({ provisionMissing: true })).rejects.toThrow("checksum")
  expect(readdirSync(fixture.installationDirectory)).toStrictEqual([])
  expect(computerReadCurrentVersion(fixture.installationDirectory)).toStrictEqual({ kind: "version-absent" })
}

async function interruptedDownloadCanRetry(): Promise<void> {
  fixture.download.mockRejectedValueOnce(new Error("download interrompido"))
  const failed = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(failed).toMatchObject({ result: { kind: "failed", message: "download interrompido" } })
  expect(readdirSync(fixture.installationDirectory)).toStrictEqual([])
  const succeeded = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(succeeded.kind).toBe("computer-apps-listed")
  expect(fixture.download).toHaveBeenCalledTimes(2)
}

async function concurrentInstallations(): Promise<void> {
  const first = createComputerUse(fixture.dependencies)
  const second = createComputerUse(fixture.dependencies)
  try {
    const results = await Promise.all([
      first.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT),
      second.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT),
    ])
    expect(results.map((result) => result.kind)).toStrictEqual(["computer-apps-listed", "computer-apps-listed"])
    const diagnostic = await first.diagnose()
    expect(diagnostic.kind).toBe("computer-ready")
    expect(await second.diagnose()).toStrictEqual(diagnostic)
    expect(computerReadCurrentVersion(fixture.installationDirectory)).toStrictEqual({
      kind: "version-found",
      version: "0.21.0",
    })
    expect(readdirSync(fixture.installationDirectory).sort()).toStrictEqual(["0.21.0", "current"])
  } finally {
    await Promise.all([first.stop(), second.stop()])
  }
}

async function partialDestinationIsNotReplaced(): Promise<void> {
  const version = join(fixture.installationDirectory, "0.21.0")
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

async function unsupportedTargetDoesNotDownload(): Promise<void> {
  vi.spyOn(artifacts, "computerPinnedArtifact").mockReturnValue({ kind: "artifact-absent" })
  await expect(fixture.infrastructure.launch({ provisionMissing: true })).rejects.toThrow("Não há build")
  expect(fixture.download).not.toHaveBeenCalled()
  expect(existsSync(fixture.installationDirectory)).toBe(false)
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
  test(
    "provisiona no uso normal e reutiliza o executável gerenciado em nova instância",
    automaticProvisioning,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test("diagnostica ausência sem instalar", diagnosticDoesNotInstall)
  test("recusa override ausente sem instalar", missingOverrideDoesNotInstall)
  test("recusa checksum sem publicar versão parcial", checksumDoesNotPublish)
  test(
    "limpa download interrompido e permite nova tentativa",
    interruptedDownloadCanRetry,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test(
    "publica duas instalações concorrentes sem apagar o vencedor",
    concurrentInstallations,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test("recusa destino parcial sem substituir seu conteúdo", partialDestinationIsNotReplaced)
  test("recusa alvo sem build sem download", unsupportedTargetDoesNotDownload)
  test("recusa extração sem executável sem publicar versão", extractionWithoutBinaryDoesNotPublish)
  test("recusa resposta interrompida sem publicar versão", truncatedResponseDoesNotPublish)
  test("recusa executável vazio antes de publicar versão", emptyBinaryDoesNotPublish)
  test("recusa arquivo sem permissão de execução antes de publicar versão", nonexecutableBinaryDoesNotPublish)
}

describe.skipIf(process.platform === "win32")("provisionamento automático do cua-driver", () => {
  beforeEach(prepare)
  afterEach(dispose)
  registerTests()
})
