import { type COMPUTER_DRIVER_COMPATIBLE, type COMPUTER_DRIVER_INCOMPATIBLE } from "./constants"

export interface ComputerCompatibleDriver {
  kind: typeof COMPUTER_DRIVER_COMPATIBLE
  version: string
}

export interface ComputerIncompatibleDriver {
  kind: typeof COMPUTER_DRIVER_INCOMPATIBLE
  message: string
}

export type ComputerDriverCompatibility = ComputerCompatibleDriver | ComputerIncompatibleDriver
