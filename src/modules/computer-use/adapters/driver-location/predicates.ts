import { type ComputerDriverReleaseSelection } from "#synapse/modules/computer-use/public/contracts"
import { type ComputerDriverReceipt } from "./types"

export function isComputerReceiptForSelection(
  receipt: ComputerDriverReceipt,
  selection: ComputerDriverReleaseSelection,
): boolean {
  return (
    receipt.version === selection.version &&
    receipt.tag === selection.tag &&
    receipt.assetName === selection.assetName &&
    receipt.expectedSha256 === selection.expectedSha256 &&
    receipt.platform === selection.platform &&
    receipt.architecture === selection.architecture
  )
}
