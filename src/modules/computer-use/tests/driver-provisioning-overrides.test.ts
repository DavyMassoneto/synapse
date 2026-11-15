import { existsSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { createComputerUse } from "#synapse/modules/computer-use/public"
import { computerFakeDriverArguments } from "./fake-driver-launch"
import {
  COMPUTER_PROVISION_CONTEXT,
  COMPUTER_PROVISION_MISSING_COMMAND,
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

async function configuredLaunchIsNotReplaced(): Promise<void> {
  const driverLaunch = {
    command: join(fixture.directory, COMPUTER_PROVISION_MISSING_COMMAND),
    arguments: [],
    environment: process.env,
    timeoutMilliseconds: 1000,
    windowsHide: true,
  }
  const service = createComputerUse({ ...fixture.dependencies, driverLaunch })
  expect((await service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)).kind).toBe("computer-executed")
  expect(fixture.download).not.toHaveBeenCalled()
  expect(existsSync(fixture.installationDirectory)).toBe(false)
}

async function compatibleOverrideIsNotReplaced(): Promise<void> {
  const service = createComputerUse({
    ...fixture.dependencies,
    driverLaunch: {
      command: process.execPath,
      arguments: computerFakeDriverArguments(),
      environment: process.env,
      timeoutMilliseconds: COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
      windowsHide: true,
    },
  })
  try {
    expect((await service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)).kind).toBe(
      "computer-apps-listed",
    )
    expect(fixture.download).not.toHaveBeenCalled()
    expect(existsSync(fixture.installationDirectory)).toBe(false)
  } finally {
    await service.stop()
  }
}

describe.skipIf(process.platform === "win32")("drivers explícitos sem provisionamento", () => {
  beforeEach(prepare)
  afterEach(dispose)
  test(
    "não substitui comando configurado que falha",
    configuredLaunchIsNotReplaced,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
  test(
    "usa driverLaunch válido sem provisionar",
    compatibleOverrideIsNotReplaced,
    COMPUTER_PROVISION_TEST_TIMEOUT_MILLISECONDS,
  )
})
