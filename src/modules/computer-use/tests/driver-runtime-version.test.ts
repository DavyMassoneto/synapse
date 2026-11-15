import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  computerDriverBinaryPath,
  computerReadCurrentVersion,
} from "#synapse/modules/computer-use/adapters/driver-location"
import { COMPUTER_SYSTEM_RUNTIME_VERSION_DIVERGENCE } from "#synapse/modules/computer-use/adapters/system-infrastructure"
import { COMPUTER_DIAGNOSTIC_OVERRIDE_MESSAGE } from "#synapse/modules/computer-use/internal"
import { COMPUTER_LINUX, createComputerUse } from "#synapse/modules/computer-use/public"
import { COMPUTER_FAKE_VERSION } from "./fake-driver"
import { computerFakeDriverArguments } from "./fake-driver-launch"
import {
  COMPUTER_PROVISION_CONTEXT,
  COMPUTER_PROVISION_OLD_VERSION,
  COMPUTER_PROVISION_OTHER_VERSION,
  COMPUTER_PROVISION_RELEASE_FAILED,
  COMPUTER_PROVISION_RESOLUTION_FAILURE,
  COMPUTER_PROVISION_SCRIPT_TEMPLATE,
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

async function runtimeVersionDivergenceRefused(): Promise<void> {
  fixture.installFakeDriverAt(COMPUTER_PROVISION_OTHER_VERSION, fixture.latestPolicy())
  fixture.resolve.mockResolvedValue({
    kind: "release-resolved",
    selection: fixture.selectionFor(COMPUTER_PROVISION_OTHER_VERSION),
    pages: [],
  })
  const result = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result).toMatchObject({
    result: {
      kind: "failed",
      message: `${COMPUTER_SYSTEM_RUNTIME_VERSION_DIVERGENCE} reportada ${COMPUTER_FAKE_VERSION}, selecionada ${COMPUTER_PROVISION_OTHER_VERSION}.`,
    },
  })
  expect(fixture.download).not.toHaveBeenCalled()
}

async function overrideReportsManagedDisabled(): Promise<void> {
  const service = createComputerUse({
    ...fixture.dependencies,
    driverLaunch: {
      command: process.execPath,
      arguments: computerFakeDriverArguments(),
      environment: process.env,
      timeoutMilliseconds: 5000,
      windowsHide: true,
    },
  })
  try {
    expect(await service.diagnose()).toStrictEqual({
      kind: "computer-ready",
      binary: process.execPath,
      version: COMPUTER_FAKE_VERSION,
      message: COMPUTER_DIAGNOSTIC_OVERRIDE_MESSAGE,
    })
    expect(fixture.resolve).not.toHaveBeenCalled()
    expect(fixture.download).not.toHaveBeenCalled()
  } finally {
    await service.stop()
  }
}

async function resolutionFailureKeepsPublished(): Promise<void> {
  const previous = fixture.installVersion(COMPUTER_PROVISION_OLD_VERSION)
  fixture.resolve.mockResolvedValue({
    kind: COMPUTER_PROVISION_RELEASE_FAILED,
    message: COMPUTER_PROVISION_RESOLUTION_FAILURE,
  })
  const result = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result).toMatchObject({ result: { kind: "failed", message: COMPUTER_PROVISION_RESOLUTION_FAILURE } })
  expect(fixture.download).not.toHaveBeenCalled()
  expect(readFileSync(previous, "utf8")).toBe(COMPUTER_PROVISION_SCRIPT_TEMPLATE)
  expect(computerReadCurrentVersion(fixture.installationDirectory)).toStrictEqual({
    kind: "version-found",
    version: COMPUTER_PROVISION_OLD_VERSION,
  })
}

async function diagnosticReportsRunningVersion(): Promise<void> {
  const binary = fixture.installFakeDriverAt(COMPUTER_FAKE_VERSION, fixture.latestPolicy())
  expect(await fixture.service.diagnose()).toStrictEqual({
    kind: "computer-ready",
    binary,
    version: COMPUTER_FAKE_VERSION,
  })
  expect(fixture.resolve).not.toHaveBeenCalled()
  expect(fixture.download).not.toHaveBeenCalled()
  expect(computerDriverBinaryPath(fixture.installationDirectory, COMPUTER_LINUX, COMPUTER_FAKE_VERSION)).toBe(binary)
}

function registerTests(): void {
  test(
    "recusa sessão quando a versão em execução difere da selecionada",
    runtimeVersionDivergenceRefused,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test(
    "diagnóstico informa que o provisionamento está desativado por override",
    overrideReportsManagedDisabled,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test("falha de resolução não substitui a versão publicada", resolutionFailureKeepsPublished)
  test(
    "diagnóstico reporta a versão do executável em execução",
    diagnosticReportsRunningVersion,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
}

describe.skipIf(process.platform === "win32")("versão efetiva do cua-driver", () => {
  beforeEach(prepare)
  afterEach(dispose)
  registerTests()
})
