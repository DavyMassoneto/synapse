import { randomUUID } from "node:crypto"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, test, vi } from "vitest"
import { computerUseDependenciesAt } from "#synapse/integration/pi/computer-use/host-dependencies"
import {
  COMPUTER_CONFIGURATION_DRIVER_DIRECTORY,
  COMPUTER_CONFIGURATION_FETCH_FUNCTION,
  COMPUTER_CONFIGURATION_FILE,
  COMPUTER_CONFIGURATION_INVALID_CONTENT,
  COMPUTER_CONFIGURATION_STATE_DIRECTORY,
  COMPUTER_CONFIGURATION_TEST_ROOT,
} from "../fixtures"

function invalidConfigurationDoesNotProvision(): void {
  const directory = resolve(COMPUTER_CONFIGURATION_TEST_ROOT, randomUUID())
  mkdirSync(directory, { recursive: true })
  writeFileSync(join(directory, COMPUTER_CONFIGURATION_FILE), COMPUTER_CONFIGURATION_INVALID_CONTENT)
  const download = vi.spyOn(globalThis, COMPUTER_CONFIGURATION_FETCH_FUNCTION)
  try {
    expect(computerUseDependenciesAt.bind(null, directory, "linux", process.env)).toThrow()
    expect(download).not.toHaveBeenCalled()
    expect(
      existsSync(join(directory, COMPUTER_CONFIGURATION_STATE_DIRECTORY, COMPUTER_CONFIGURATION_DRIVER_DIRECTORY)),
    ).toBe(false)
  } finally {
    download.mockRestore()
    rmSync(directory, { recursive: true, force: true })
  }
}

describe("configuração do provisionamento de computer-use", () => {
  test("recusa configuração inválida antes de provisionar", invalidConfigurationDoesNotProvision)
})
