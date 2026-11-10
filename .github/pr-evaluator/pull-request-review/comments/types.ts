import { type Side } from "#evaluator/changes"
import { type Finding } from "#evaluator/review-result"
import { type ReviewComment } from "../review-publication"

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

export interface Placement {
  comments: ReviewComment[]
  unplaced: Finding[]
}
