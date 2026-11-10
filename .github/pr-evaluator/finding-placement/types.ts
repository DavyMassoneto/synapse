import { type Side } from "#evaluator/diff-annotation"
import { type ReviewComment } from "#evaluator/pull-request-review"
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

export interface Partition {
  groups: Map<string, Group>
  unplaced: Finding[]
}

export interface Placement {
  comments: ReviewComment[]
  unplaced: Finding[]
}

export interface RangedFinding extends Finding {
  startLine: number
}
