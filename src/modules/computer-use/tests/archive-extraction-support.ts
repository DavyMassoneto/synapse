import { type ComputerCommandOutput } from "#synapse/modules/computer-use/adapters/command-execution"
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
