import { type Side } from "../diff"
import { type ReviewComment } from "../github"
import { type Finding } from "../model"

export interface Anchored {
  kind: "anchored"
  path: string
  side: Side
  line: number
  startLine?: number
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

export interface CriterionLabels {
  "clean-code": string
  dry: string
  yagni: string
  srp: string
  architecture: string
}

export interface KindLabels {
  violation: string
  insufficient_context: string
}

export interface VerdictLabels {
  approve: string
  approve_with_remarks: string
  request_changes: string
}
