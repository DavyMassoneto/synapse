import {
  COMPUTER_COMMAND_ARCHIVE_TIMEOUT_MILLISECONDS,
  COMPUTER_ERROR_CODE_MISSING_FILE,
  type ComputerCommandRunner,
  isErrorWithCode,
} from "../command-execution"
import {
  COMPUTER_ARCHIVE_DIRECTORY_FLAG,
  COMPUTER_ARCHIVE_EXECUTABLE_MISSING,
  COMPUTER_ARCHIVE_EXTRACT_FLAG,
  COMPUTER_ARCHIVE_EXTRACTED,
  COMPUTER_ARCHIVE_EXTRACTION_FAILED,
  COMPUTER_ARCHIVE_REFUSED,
  COMPUTER_ARCHIVE_TAR_EXECUTABLE,
} from "./constants"
import { type ComputerArchiveExtractionResult, type ComputerArchiveRequest } from "./types"

export async function computerExtractArchive(
  request: ComputerArchiveRequest,
  executor: ComputerCommandRunner,
): Promise<ComputerArchiveExtractionResult> {
  const argumentsValue = [
    COMPUTER_ARCHIVE_EXTRACT_FLAG,
    request.archive,
    COMPUTER_ARCHIVE_DIRECTORY_FLAG,
    request.directory,
  ]
  try {
    await executor(COMPUTER_ARCHIVE_TAR_EXECUTABLE, argumentsValue, {
      timeout: COMPUTER_COMMAND_ARCHIVE_TIMEOUT_MILLISECONDS,
    })
    return { kind: COMPUTER_ARCHIVE_EXTRACTED }
  } catch (error) {
    if (error instanceof Error && isErrorWithCode(error, COMPUTER_ERROR_CODE_MISSING_FILE)) {
      return { kind: COMPUTER_ARCHIVE_REFUSED, message: COMPUTER_ARCHIVE_EXECUTABLE_MISSING }
    }
    if (error instanceof Error) {
      return { kind: COMPUTER_ARCHIVE_REFUSED, message: `${COMPUTER_ARCHIVE_EXTRACTION_FAILED} ${error.message}` }
    }
    throw error
  }
}
