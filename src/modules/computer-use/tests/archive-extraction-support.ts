import {
  COMPUTER_ARCHIVE_TAR_RESOLVED,
  computerResolveArchiveTar,
} from "#synapse/modules/computer-use/adapters/archive-extraction"
import { type ComputerCommandOutput } from "#synapse/modules/computer-use/adapters/command-execution"
import {
  COMPUTER_DARWIN,
  COMPUTER_LINUX,
  COMPUTER_WIN32,
  type ComputerPlatform,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_ARCHIVE_TEST_MISSING_TAR } from "./archive-extraction-constants"
import { type ComputerArchiveTestCall } from "./archive-extraction-types"

export class ComputerArchiveMissingTarError extends Error {
  readonly code = "ENOENT"
}

export class ComputerArchiveCommandDouble {
  readonly calls: ComputerArchiveTestCall[] = []

  execute(command: string, argumentsValue: string[]): Promise<ComputerCommandOutput> {
    this.calls.push({ command, arguments: argumentsValue })
    return Promise.reject(new ComputerArchiveMissingTarError(COMPUTER_ARCHIVE_TEST_MISSING_TAR))
  }
}

export function computerArchiveTestPlatform(): ComputerPlatform {
  if (process.platform === COMPUTER_WIN32) {
    return COMPUTER_WIN32
  }
  if (process.platform === COMPUTER_DARWIN) {
    return COMPUTER_DARWIN
  }
  return COMPUTER_LINUX
}

export function computerArchiveTestTarCommand(): string {
  const resolution = computerResolveArchiveTar({
    platform: computerArchiveTestPlatform(),
    environment: process.env,
  })
  if (resolution.kind !== COMPUTER_ARCHIVE_TAR_RESOLVED) {
    throw new Error(resolution.message)
  }
  return resolution.command
}
