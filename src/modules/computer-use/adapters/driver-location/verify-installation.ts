import { existsSync } from "node:fs"
import { join } from "node:path"
import { type ComputerDriverReleaseSelection } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DRIVER_INSTALLATION_ABSENT,
  COMPUTER_DRIVER_INSTALLATION_CONFLICT,
  COMPUTER_DRIVER_INSTALLATION_CORRUPT,
  COMPUTER_DRIVER_INSTALLATION_CORRUPT_MESSAGE,
  COMPUTER_DRIVER_INSTALLATION_DESTINATION_CONFLICT,
  COMPUTER_DRIVER_INSTALLATION_REUSABLE,
  COMPUTER_DRIVER_INSTALLATION_SELECTION_CONFLICT,
  COMPUTER_DRIVER_RECEIPT_ABSENT,
  COMPUTER_DRIVER_RECEIPT_INVALID,
} from "./constants"
import { computerDriverBinaryPath, computerDriverExecutablePath } from "./locate-driver"
import { isComputerReceiptForSelection } from "./predicates"
import { computerExecutableDigest, computerReadDriverReceipt } from "./receipt"
import { type ComputerDriverInstallationCheck, type ComputerDriverReceipt } from "./types"

export function computerVerifyDriverInstallation(
  directory: string,
  selection: ComputerDriverReleaseSelection,
): ComputerDriverInstallationCheck {
  const versionDirectory = join(directory, selection.version)
  if (!existsSync(versionDirectory)) {
    return { kind: COMPUTER_DRIVER_INSTALLATION_ABSENT }
  }
  const receipt = computerReadDriverReceipt(versionDirectory)
  if (receipt.kind === COMPUTER_DRIVER_RECEIPT_ABSENT) {
    return { kind: COMPUTER_DRIVER_INSTALLATION_CONFLICT, message: COMPUTER_DRIVER_INSTALLATION_DESTINATION_CONFLICT }
  }
  if (receipt.kind === COMPUTER_DRIVER_RECEIPT_INVALID) {
    return { kind: COMPUTER_DRIVER_INSTALLATION_CORRUPT, message: receipt.message }
  }
  if (!isComputerReceiptForSelection(receipt.receipt, selection)) {
    return { kind: COMPUTER_DRIVER_INSTALLATION_CONFLICT, message: COMPUTER_DRIVER_INSTALLATION_SELECTION_CONFLICT }
  }
  return computerVerifyInstalledExecutable(directory, selection, receipt.receipt)
}

function computerVerifyInstalledExecutable(
  directory: string,
  selection: ComputerDriverReleaseSelection,
  receipt: ComputerDriverReceipt,
): ComputerDriverInstallationCheck {
  const binary = computerDriverBinaryPath(directory, selection.platform, selection.version)
  if (!existsSync(binary) || receipt.executable !== computerDriverExecutablePath(selection.platform)) {
    return { kind: COMPUTER_DRIVER_INSTALLATION_CORRUPT, message: COMPUTER_DRIVER_INSTALLATION_CORRUPT_MESSAGE }
  }
  if (computerExecutableDigest(binary) !== receipt.executableSha256) {
    return { kind: COMPUTER_DRIVER_INSTALLATION_CORRUPT, message: COMPUTER_DRIVER_INSTALLATION_CORRUPT_MESSAGE }
  }
  return { kind: COMPUTER_DRIVER_INSTALLATION_REUSABLE, binary }
}
