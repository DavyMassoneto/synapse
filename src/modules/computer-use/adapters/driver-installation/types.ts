import {
  type ComputerDriverPolicy,
  type ComputerDriverReleaseSelection,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerDriverReceipt } from "../driver-location"

export interface ComputerDriverInstallationRequest {
  directory: string
  selection: ComputerDriverReleaseSelection
  policy: ComputerDriverPolicy
}

export type ComputerDriverReceiptPolicy = ComputerDriverReceipt["policy"]
