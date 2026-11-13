export interface ComputerCompatibleDriver {
  kind: "driver-compatible"
  version: string
}

export interface ComputerIncompatibleDriver {
  kind: "driver-incompatible"
  message: string
}

export type ComputerDriverCompatibility = ComputerCompatibleDriver | ComputerIncompatibleDriver
