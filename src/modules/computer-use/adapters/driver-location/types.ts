import { type Static } from "typebox"
import { type COMPUTER_DRIVER_RECEIPT_SCHEMA } from "./schemas"

export interface ComputerDriverFound {
  kind: "driver-found"
  command: string
}

export interface ComputerDriverAbsent {
  kind: "driver-absent"
}

export type ComputerDriverLocation = ComputerDriverFound | ComputerDriverAbsent

export interface ComputerDriverVersionFound {
  kind: "version-found"
  version: string
}

export interface ComputerDriverVersionAbsent {
  kind: "version-absent"
}

export type ComputerDriverVersionResult = ComputerDriverVersionFound | ComputerDriverVersionAbsent

export type ComputerDriverReceipt = Static<typeof COMPUTER_DRIVER_RECEIPT_SCHEMA>

export interface ComputerDriverReceiptFound {
  kind: "receipt-found"
  receipt: ComputerDriverReceipt
}

export interface ComputerDriverReceiptAbsent {
  kind: "receipt-absent"
}

export interface ComputerDriverReceiptInvalid {
  kind: "receipt-invalid"
  message: string
}

export type ComputerDriverReceiptResult =
  | ComputerDriverReceiptFound
  | ComputerDriverReceiptAbsent
  | ComputerDriverReceiptInvalid

export interface ComputerDriverInstallationReusable {
  kind: "installation-reusable"
  binary: string
}

export interface ComputerDriverInstallationAbsent {
  kind: "installation-absent"
}

export interface ComputerDriverInstallationConflict {
  kind: "installation-conflict"
  message: string
}

export interface ComputerDriverInstallationCorrupt {
  kind: "installation-corrupt"
  message: string
}

export type ComputerDriverInstallationCheck =
  | ComputerDriverInstallationReusable
  | ComputerDriverInstallationAbsent
  | ComputerDriverInstallationConflict
  | ComputerDriverInstallationCorrupt
