import { type COMPUTER_DRIVER_VERSION_ABSENT, type COMPUTER_DRIVER_VERSION_FOUND } from "./constants"

export interface ComputerDriverVersionFound {
  kind: typeof COMPUTER_DRIVER_VERSION_FOUND
  version: string
}

export interface ComputerDriverVersionAbsent {
  kind: typeof COMPUTER_DRIVER_VERSION_ABSENT
}

export type ComputerDriverVersionResult = ComputerDriverVersionFound | ComputerDriverVersionAbsent
