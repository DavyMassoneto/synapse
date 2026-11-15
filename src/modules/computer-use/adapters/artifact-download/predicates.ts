import {
  COMPUTER_DRIVER_ARTIFACT_CURRENT_DIRECTORY,
  COMPUTER_DRIVER_ARTIFACT_FORBIDDEN_SEPARATORS,
  COMPUTER_DRIVER_ARTIFACT_PARENT_DIRECTORY,
} from "./constants"

export function isComputerArtifactFileNameSafe(fileName: string): boolean {
  const isReservedName =
    fileName === COMPUTER_DRIVER_ARTIFACT_CURRENT_DIRECTORY || fileName === COMPUTER_DRIVER_ARTIFACT_PARENT_DIRECTORY
  const hasSeparator = COMPUTER_DRIVER_ARTIFACT_FORBIDDEN_SEPARATORS.some((separator) => fileName.includes(separator))
  return fileName.trim().length > 0 && !isReservedName && !hasSeparator
}
