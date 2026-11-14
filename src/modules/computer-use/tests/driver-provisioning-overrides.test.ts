import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { computerDriverBinaryPath } from "#synapse/modules/computer-use/adapters/driver-location"
import { COMPUTER_LINUX, createComputerUse } from "#synapse/modules/computer-use/public"
import { computerFakeDriverArguments } from "./fake-driver-launch"
import {
  COMPUTER_PROVISION_CONTEXT,
  COMPUTER_PROVISION_INCOMPATIBLE_SCRIPT,
  COMPUTER_PROVISION_INCOMPATIBLE_VERSION,
  COMPUTER_PROVISION_MISSING_COMMAND,
  COMPUTER_PROVISION_SCRIPT_MODE,
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
      timeoutMilliseconds: 5000,
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

async function incompatibleManagedDriverIsNotReplaced(): Promise<void> {
  const binary = computerDriverBinaryPath(
    fixture.installationDirectory,
    COMPUTER_LINUX,
    COMPUTER_PROVISION_INCOMPATIBLE_VERSION,
  )
  mkdirSync(join(fixture.installationDirectory, COMPUTER_PROVISION_INCOMPATIBLE_VERSION), { recursive: true })
  writeFileSync(binary, COMPUTER_PROVISION_INCOMPATIBLE_SCRIPT, { mode: COMPUTER_PROVISION_SCRIPT_MODE })
  const result = await fixture.service.execute({ action: "list_apps" }, COMPUTER_PROVISION_CONTEXT)
  expect(result).toMatchObject({ kind: "computer-executed", result: { kind: "failed" } })
  expect(fixture.download).not.toHaveBeenCalled()
  expect(readFileSync(binary, "utf8")).toBe(COMPUTER_PROVISION_INCOMPATIBLE_SCRIPT)
}

describe.skipIf(process.platform === "win32")("drivers explícitos sem provisionamento", () => {
  beforeEach(prepare)
  afterEach(dispose)
  test("não substitui comando configurado que falha", configuredLaunchIsNotReplaced)
  test("usa driverLaunch válido sem provisionar", compatibleOverrideIsNotReplaced)
  test("não atualiza driver gerenciado incompatível", incompatibleManagedDriverIsNotReplaced)
})
