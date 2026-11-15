import { existsSync } from "node:fs"
import { join } from "node:path"
import { COMPUTER_WIN32 } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_ARCHIVE_TAR_EXECUTABLE,
  COMPUTER_ARCHIVE_TAR_MISSING,
  COMPUTER_ARCHIVE_TAR_RESOLVED,
  COMPUTER_ARCHIVE_WIN32_SYSTEM_ROOT_MISSING,
  COMPUTER_ARCHIVE_WIN32_SYSTEM_ROOT_VARIABLE,
  COMPUTER_ARCHIVE_WIN32_TAR_DIRECTORY,
  COMPUTER_ARCHIVE_WIN32_TAR_EXECUTABLE,
  COMPUTER_ARCHIVE_WIN32_TAR_MISSING,
} from "./constants"
import { type ComputerArchiveTarRequest, type ComputerArchiveTarResult } from "./types"

export function computerResolveArchiveTar(request: ComputerArchiveTarRequest): ComputerArchiveTarResult {
  if (request.platform !== COMPUTER_WIN32) {
    return { kind: COMPUTER_ARCHIVE_TAR_RESOLVED, command: COMPUTER_ARCHIVE_TAR_EXECUTABLE }
  }
  const systemRoot = request.environment[COMPUTER_ARCHIVE_WIN32_SYSTEM_ROOT_VARIABLE]
  if (!systemRoot) {
    return { kind: COMPUTER_ARCHIVE_TAR_MISSING, message: COMPUTER_ARCHIVE_WIN32_SYSTEM_ROOT_MISSING }
  }
  const command = join(systemRoot, COMPUTER_ARCHIVE_WIN32_TAR_DIRECTORY, COMPUTER_ARCHIVE_WIN32_TAR_EXECUTABLE)
  if (!existsSync(command)) {
    return { kind: COMPUTER_ARCHIVE_TAR_MISSING, message: `${COMPUTER_ARCHIVE_WIN32_TAR_MISSING} ${command}.` }
  }
  return { kind: COMPUTER_ARCHIVE_TAR_RESOLVED, command }
}
