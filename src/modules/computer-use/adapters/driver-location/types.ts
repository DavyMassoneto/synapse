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
