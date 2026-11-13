export interface ComputerFoundDimensions {
  kind: "dimensions-found"
  width: number
  height: number
}

export interface ComputerAbsentDimensions {
  kind: "dimensions-absent"
}

export type ComputerImageDimensions = ComputerFoundDimensions | ComputerAbsentDimensions
