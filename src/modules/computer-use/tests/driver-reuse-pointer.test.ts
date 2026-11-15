import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { computerInstallDriver } from "#synapse/modules/computer-use/adapters/driver-installation"
import {
  computerFindInstalledVersion,
  computerReadCurrentVersion,
  computerWriteCurrentVersion,
} from "#synapse/modules/computer-use/adapters/driver-location"
import { COMPUTER_DRIVER_POLICY_MODE_PINNED, type ComputerDriverPolicy } from "#synapse/modules/computer-use/public"
import { COMPUTER_FAKE_VERSION } from "./fake-driver"
import {
  COMPUTER_PROVISION_CONTEXT,
  COMPUTER_PROVISION_OLD_VERSION,
  COMPUTER_PROVISION_PINNED_REASON,
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

function pinnedOlderPolicy(): ComputerDriverPolicy {
  return {
    mode: COMPUTER_DRIVER_POLICY_MODE_PINNED,
    version: COMPUTER_PROVISION_OLD_VERSION,
    reason: COMPUTER_PROVISION_PINNED_REASON,
  }
}

async function republishesPointerOnReuse(): Promise<void> {
  const older = fixture.installFakeDriverAt(COMPUTER_PROVISION_OLD_VERSION, fixture.latestPolicy())
  const latest = fixture.installFakeDriverAt(COMPUTER_FAKE_VERSION, fixture.latestPolicy())
  const installed = fixture.installationDirectory
  computerWriteCurrentVersion(installed, COMPUTER_PROVISION_OLD_VERSION)

  const reusedLatest = await computerInstallDriver({
    directory: installed,
    selection: fixture.selectionFor(COMPUTER_FAKE_VERSION),
    policy: fixture.latestPolicy(),
  })
  expect(reusedLatest).toBe(latest)
  expect(computerFindInstalledVersion(installed)).toStrictEqual({
    kind: "version-found",
    version: COMPUTER_FAKE_VERSION,
  })

  const reusedOlder = await computerInstallDriver({
    directory: installed,
    selection: fixture.selectionFor(COMPUTER_PROVISION_OLD_VERSION),
    policy: pinnedOlderPolicy(),
  })
  expect(reusedOlder).toBe(older)
  expect(computerReadCurrentVersion(installed)).toStrictEqual({
    kind: "version-found",
    version: COMPUTER_PROVISION_OLD_VERSION,
  })
  expect(fixture.download).not.toHaveBeenCalled()
}

async function diagnosesReusedSelection(): Promise<void> {
  fixture.installFakeDriverAt(COMPUTER_PROVISION_OLD_VERSION, fixture.latestPolicy())
  const latest = fixture.installFakeDriverAt(COMPUTER_FAKE_VERSION, fixture.latestPolicy())
  computerWriteCurrentVersion(fixture.installationDirectory, COMPUTER_PROVISION_OLD_VERSION)

  expect((await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)).kind).toBe(
    "computer-apps-listed",
  )
  expect(fixture.download).not.toHaveBeenCalled()
  expect(await fixture.service.diagnose()).toStrictEqual({
    kind: "computer-ready",
    binary: latest,
    version: COMPUTER_FAKE_VERSION,
  })
}

function registerTests(): void {
  test("atualiza o ponteiro ao reutilizar outra versão selecionada", republishesPointerOnReuse)
  test(
    "diagnostica a versão reutilizada em vez da anterior",
    diagnosesReusedSelection,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
}

describe.skipIf(process.platform === "win32")("ponteiro da versão publicada", () => {
  beforeEach(prepare)
  afterEach(dispose)
  registerTests()
})
