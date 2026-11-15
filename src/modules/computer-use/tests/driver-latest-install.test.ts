import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_INSTALLATION_CORRUPT_MESSAGE,
  COMPUTER_DRIVER_INSTALLATION_SELECTION_CONFLICT,
  COMPUTER_DRIVER_RECEIPT_FOUND,
  computerDriverBinaryPath,
  computerReadCurrentVersion,
  computerReadDriverReceipt,
} from "#synapse/modules/computer-use/adapters/driver-location"
import {
  COMPUTER_DRIVER_CHECKSUM_SOURCE_ASSET_DIGEST,
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  COMPUTER_DRIVER_POLICY_MODE_PINNED,
  COMPUTER_LINUX,
  type ComputerDriverPolicy,
  createComputerUse,
} from "#synapse/modules/computer-use/public"
import { COMPUTER_DRIVER_LOCATION_TEST_SCRIPT_MODE } from "./driver-location-support"
import { COMPUTER_FAKE_VERSION } from "./fake-driver"
import {
  COMPUTER_PROVISION_ALTERED_CONTENT,
  COMPUTER_PROVISION_CONTEXT,
  COMPUTER_PROVISION_OLD_VERSION,
  COMPUTER_PROVISION_PINNED_REASON,
  COMPUTER_PROVISION_SCRIPT_TEMPLATE,
  COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  COMPUTER_PROVISION_WRONG_CHECKSUM,
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

async function reusesVerifiedLatest(): Promise<void> {
  const binary = fixture.installFakeDriverAt(COMPUTER_FAKE_VERSION, fixture.latestPolicy())
  const result = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result.kind).toBe("computer-apps-listed")
  expect(fixture.download).not.toHaveBeenCalled()
  expect(await fixture.service.diagnose()).toStrictEqual({
    kind: "computer-ready",
    binary,
    version: COMPUTER_FAKE_VERSION,
  })
}

async function upgradesPublishedVersion(): Promise<void> {
  const previous = fixture.installVersion(COMPUTER_PROVISION_OLD_VERSION)
  const result = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result.kind).toBe("computer-apps-listed")
  expect(fixture.download).toHaveBeenCalledTimes(1)
  expect(readdirSync(fixture.installationDirectory).sort()).toStrictEqual(
    [COMPUTER_PROVISION_OLD_VERSION, COMPUTER_FAKE_VERSION, "current"].sort(),
  )
  expect(computerReadCurrentVersion(fixture.installationDirectory)).toStrictEqual({
    kind: "version-found",
    version: COMPUTER_FAKE_VERSION,
  })
  expect(readFileSync(previous, "utf8")).toBe(COMPUTER_PROVISION_SCRIPT_TEMPLATE)
}

async function republishedDigestRefused(): Promise<void> {
  const binary = fixture.installFakeDriverAt(COMPUTER_FAKE_VERSION, fixture.latestPolicy())
  fixture.resolve.mockResolvedValue({
    kind: "release-resolved",
    selection: { ...fixture.selection(), expectedSha256: COMPUTER_PROVISION_WRONG_CHECKSUM },
    pages: [],
  })
  const result = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result).toMatchObject({
    result: { kind: "failed", message: COMPUTER_DRIVER_INSTALLATION_SELECTION_CONFLICT },
  })
  expect(fixture.download).not.toHaveBeenCalled()
  expect(readFileSync(binary, "utf8")).toContain(process.execPath)
}

async function alteredExecutableRefused(): Promise<void> {
  const binary = fixture.installFakeDriverAt(COMPUTER_FAKE_VERSION, fixture.latestPolicy())
  writeFileSync(binary, COMPUTER_PROVISION_ALTERED_CONTENT, { mode: COMPUTER_DRIVER_LOCATION_TEST_SCRIPT_MODE })
  const result = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result).toMatchObject({
    result: { kind: "failed", message: COMPUTER_DRIVER_INSTALLATION_CORRUPT_MESSAGE },
  })
  expect(fixture.download).not.toHaveBeenCalled()
}

async function receiptRecordsPolicy(): Promise<void> {
  await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  const receipt = computerReadDriverReceipt(join(fixture.installationDirectory, COMPUTER_FAKE_VERSION))
  expect(receipt).toMatchObject({
    kind: COMPUTER_DRIVER_RECEIPT_FOUND,
    receipt: {
      checksumSource: COMPUTER_DRIVER_CHECKSUM_SOURCE_ASSET_DIGEST,
      policy: { mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE },
    },
  })
}

async function pinnedPolicyIsApplied(): Promise<void> {
  const policy: ComputerDriverPolicy = {
    mode: COMPUTER_DRIVER_POLICY_MODE_PINNED,
    version: COMPUTER_FAKE_VERSION,
    reason: COMPUTER_PROVISION_PINNED_REASON,
  }
  const service = createComputerUse({ ...fixture.dependencies, driverPolicy: policy })
  try {
    expect((await service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)).kind).toBe(
      "computer-apps-listed",
    )
    expect(fixture.resolve.mock.lastCall?.[0].policy).toStrictEqual(policy)
    const receipt = computerReadDriverReceipt(join(fixture.installationDirectory, COMPUTER_FAKE_VERSION))
    expect(receipt).toMatchObject({ kind: COMPUTER_DRIVER_RECEIPT_FOUND, receipt: { policy: { mode: "pinned" } } })
    expect(await service.diagnose()).toStrictEqual({
      kind: "computer-ready",
      binary: computerDriverBinaryPath(fixture.installationDirectory, COMPUTER_LINUX, COMPUTER_FAKE_VERSION),
      version: COMPUTER_FAKE_VERSION,
      message: expect.stringContaining(COMPUTER_PROVISION_PINNED_REASON),
    })
  } finally {
    await service.stop()
  }
}

async function isolatedInstallationDirectory(): Promise<void> {
  const other = mkdtempSync(join(fixture.directory, "outra-instalacao"))
  const service = createComputerUse({ ...fixture.dependencies, installationDirectory: other })
  try {
    expect((await service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)).kind).toBe(
      "computer-apps-listed",
    )
    expect(computerReadCurrentVersion(other)).toStrictEqual({ kind: "version-found", version: COMPUTER_FAKE_VERSION })
    expect(existsSync(fixture.installationDirectory)).toBe(false)
  } finally {
    await service.stop()
    rmSync(other, { recursive: true, force: true })
  }
}

function registerTests(): void {
  test(
    "reutiliza a versão estável instalada e verificada",
    reusesVerifiedLatest,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test(
    "instala a versão mais nova preservando a anterior",
    upgradesPublishedVersion,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test("recusa release republicada com digest diferente", republishedDigestRefused)
  test("recusa executável alterado depois da publicação", alteredExecutableRefused)
  test(
    "grava origem do checksum e política no recibo",
    receiptRecordsPolicy,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test(
    "aplica a política fixada e informa o motivo no diagnóstico",
    pinnedPolicyIsApplied,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test(
    "instala em diretório isolado por configuração",
    isolatedInstallationDirectory,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
}

describe.skipIf(process.platform === "win32")("instalação da última versão estável", () => {
  beforeEach(prepare)
  afterEach(dispose)
  registerTests()
})
