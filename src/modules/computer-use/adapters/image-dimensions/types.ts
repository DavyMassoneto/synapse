import { type COMPUTER_DIMENSIONS_ABSENT, type COMPUTER_DIMENSIONS_FOUND } from "./constants"

export interface ComputerFoundDimensions {
  kind: typeof COMPUTER_DIMENSIONS_FOUND
  width: number
  height: number
}

export interface ComputerAbsentDimensions {
  kind: typeof COMPUTER_DIMENSIONS_ABSENT
}

export type ComputerImageDimensions = ComputerFoundDimensions | ComputerAbsentDimensions
