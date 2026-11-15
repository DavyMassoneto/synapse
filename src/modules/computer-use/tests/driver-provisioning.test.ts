import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  computerDriverBinaryPath,
  computerReadCurrentVersion,
} from "#synapse/modules/computer-use/adapters/driver-location"
import { COMPUTER_LINUX, createComputerUse } from "#synapse/modules/computer-use/public"
import {
  COMPUTER_PROVISION_CONTEXT,
  COMPUTER_PROVISION_INSTALL_TEST_TITLE,
  COMPUTER_PROVISION_NO_OVERRIDE,
  COMPUTER_PROVISION_RELEASE_FAILED,
  COMPUTER_PROVISION_RESOLUTION_FAILURE,
  COMPUTER_PROVISION_REUSE_TEST_TITLE,
  COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  ComputerProvisioningFixture,
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
  expect(fixture.download.mock.lastCall?.[0]).toBe(fixture.selection().assetUrl)
  const binary = computerDriverBinaryPath(fixture.installationDirectory, COMPUTER_LINUX, fixture.selection().version)
  expect(await fixture.service.diagnose()).toStrictEqual({
    kind: "computer-ready",
    binary,
    version: fixture.selection().version,
  })
}

async function reusesProvisionedDriver(): Promise<void> {
  await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
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
  expect(fixture.resolve).not.toHaveBeenCalled()
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

async function resolutionFailureDoesNotDownload(): Promise<void> {
  fixture.resolve.mockResolvedValue({
    kind: COMPUTER_PROVISION_RELEASE_FAILED,
    message: COMPUTER_PROVISION_RESOLUTION_FAILURE,
  })
  const result = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result).toMatchObject({ result: { kind: "failed", message: COMPUTER_PROVISION_RESOLUTION_FAILURE } })
  expect(fixture.download).not.toHaveBeenCalled()
  expect(existsSync(fixture.installationDirectory)).toBe(false)
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
      version: fixture.selection().version,
    })
    expect(readdirSync(fixture.installationDirectory).sort()).toStrictEqual([fixture.selection().version, "current"])
  } finally {
    await Promise.all([first.stop(), second.stop()])
  }
}

function registerTests(): void {
  test(COMPUTER_PROVISION_INSTALL_TEST_TITLE, automaticProvisioning, COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS)
  test(COMPUTER_PROVISION_REUSE_TEST_TITLE, reusesProvisionedDriver, COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS)
  test("diagnostica ausência sem instalar nem resolver release", diagnosticDoesNotInstall)
  test("recusa override ausente sem instalar", missingOverrideDoesNotInstall)
  test("recusa resolução da release sem baixar o artefato", resolutionFailureDoesNotDownload)
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
}

describe.skipIf(process.platform === "win32")("provisionamento automático do cua-driver", () => {
  beforeEach(prepare)
  afterEach(dispose)
  registerTests()
})
