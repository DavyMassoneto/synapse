import { type Finding } from "#synapse/review"

export interface LineGroup {
  path: string
  line: number
  findings: Finding[]
}

export interface Partition {
  anchored: Finding[]
  outsideDiff: Finding[]
  general: Finding[]
}
