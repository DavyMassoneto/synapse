import { type Finding } from "../review"

export type RuleLabels = Map<string, string>

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
