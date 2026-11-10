import { type Side } from "#evaluator/diff-annotation"
import { type Finding } from "#evaluator/review-result"

export interface Anchored {
  kind: "anchored"
  path: string
  side: Side
  line: number
  startLine: number
}

export interface Floating {
  kind: "floating"
}

export type Anchor = Anchored | Floating

export interface Group {
  anchor: Anchored
  findings: Finding[]
}

export type GroupsByAnchor = Map<string, Group>

export interface Placement {
  groups: GroupsByAnchor
  unplaced: Finding[]
}
