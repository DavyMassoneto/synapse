export interface ComputerDriverVersionFound {
  kind: "version-found"
  version: string
}

export interface ComputerDriverVersionAbsent {
  kind: "version-absent"
}

export type ComputerDriverVersionResult = ComputerDriverVersionFound | ComputerDriverVersionAbsent
