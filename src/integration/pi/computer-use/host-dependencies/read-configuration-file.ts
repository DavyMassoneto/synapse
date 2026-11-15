import { readFileSync } from "node:fs"
import { join } from "node:path"
import {
  PI_COMPUTER_CONFIGURATION_ERROR_CODE_PROPERTY,
  PI_COMPUTER_CONFIGURATION_FILE_MISSING,
  PI_COMPUTER_CONFIGURATION_FILE_READ,
  PI_COMPUTER_CONFIGURATION_MISSING_CODE,
} from "./constants"
import { type PiComputerConfigurationFile } from "./types"

export function computerReadConfigurationFile(directory: string, file: string): PiComputerConfigurationFile {
  try {
    return {
      kind: PI_COMPUTER_CONFIGURATION_FILE_READ,
      text: new TextDecoder().decode(readFileSync(join(directory, file))),
    }
  } catch (error) {
    if (
      error instanceof Error &&
      PI_COMPUTER_CONFIGURATION_ERROR_CODE_PROPERTY in error &&
      error.code === PI_COMPUTER_CONFIGURATION_MISSING_CODE
    ) {
      return { kind: PI_COMPUTER_CONFIGURATION_FILE_MISSING }
    }
    throw error
  }
}
