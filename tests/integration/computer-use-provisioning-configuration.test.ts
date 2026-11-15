import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test, vi } from "vitest"
import { computerUseDependenciesAt } from "#synapse/integration/pi/computer-use/host-dependencies"
import {
  COMPUTER_CONFIGURATION_DRIVER_DIRECTORY,
  COMPUTER_CONFIGURATION_FETCH_FUNCTION,
  COMPUTER_CONFIGURATION_FILE,
  COMPUTER_CONFIGURATION_INVALID_CONTENT,
  COMPUTER_CONFIGURATION_STATE_DIRECTORY,
  createComputerConfigurationDirectory,
  removeComputerConfigurationDirectory,
  writeComputerConfigurationFile,
} from "../fixtures"

function invalidConfigurationDoesNotProvision(): void {
  const directory = createComputerConfigurationDirectory()
  writeComputerConfigurationFile(directory, COMPUTER_CONFIGURATION_FILE, COMPUTER_CONFIGURATION_INVALID_CONTENT)
  const download = vi.spyOn(globalThis, COMPUTER_CONFIGURATION_FETCH_FUNCTION)
  try {
    expect(computerUseDependenciesAt.bind(null, directory, "linux", process.env)).toThrow()
    expect(download).not.toHaveBeenCalled()
    expect(
      existsSync(join(directory, COMPUTER_CONFIGURATION_STATE_DIRECTORY, COMPUTER_CONFIGURATION_DRIVER_DIRECTORY)),
    ).toBe(false)
  } finally {
    download.mockRestore()
    removeComputerConfigurationDirectory(directory)
  }
}

describe("configuração do provisionamento de computer-use", () => {
  test("recusa configuração inválida antes de provisionar", invalidConfigurationDoesNotProvision)
})
